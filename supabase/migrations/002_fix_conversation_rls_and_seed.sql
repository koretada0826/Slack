-- ============================================================
-- 002: RLS修正 + テストユーザーシード + DM通知トリガー
-- ============================================================

-- =========================
-- 1. conversation_members INSERT RLS を修正
--    会話の作成者がメンバーを追加できるようにする
-- =========================
DROP POLICY IF EXISTS "conversation_members_insert" ON conversation_members;

CREATE POLICY "conversation_members_insert"
  ON conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- 既存メンバーは追加可能
    can_access_conversation(conversation_id, auth.uid())
    OR
    -- 会話の作成者もメンバーを追加可能（初回追加時に必要）
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND c.created_by = auth.uid()
    )
  );

-- =========================
-- 2. DM メッセージ通知トリガー
--    DM に新しいメッセージが来たら相手に通知
-- =========================
CREATE OR REPLACE FUNCTION handle_dm_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  _member RECORD;
  _sender profiles%ROWTYPE;
BEGIN
  -- conversation_id が NULL なら skip (チャンネルメッセージ)
  IF NEW.conversation_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- スレッド返信は別のトリガーで処理
  IF NEW.parent_message_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO _sender FROM profiles WHERE id = NEW.sender_id;

  -- 会話の全メンバーに通知（送信者自身を除く）
  FOR _member IN
    SELECT user_id FROM conversation_members
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LOOP
    INSERT INTO notifications (user_id, workspace_id, type, title, body, entity_type, entity_id)
    VALUES (
      _member.user_id,
      NEW.workspace_id,
      'dm_message',
      _sender.display_name || ' さんからメッセージ',
      LEFT(NEW.body_plaintext, 200),
      'conversation',
      NEW.conversation_id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dm_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION handle_dm_message_notification();

-- =========================
-- 3. create_conversation RPC（RLSをバイパスしてアトミックに作成）
-- =========================
CREATE OR REPLACE FUNCTION create_conversation_with_members(
  _workspace_id uuid,
  _kind conversation_kind,
  _member_ids uuid[]
)
RETURNS uuid AS $$
DECLARE
  _conv_id uuid;
  _user_id uuid := auth.uid();
  _mid uuid;
BEGIN
  -- workspace member であることを確認
  IF NOT is_workspace_member(_workspace_id, _user_id) THEN
    RAISE EXCEPTION 'Not a workspace member';
  END IF;

  -- conversation を作成
  INSERT INTO conversations (workspace_id, kind, created_by)
  VALUES (_workspace_id, _kind, _user_id)
  RETURNING id INTO _conv_id;

  -- 作成者をメンバーに追加
  INSERT INTO conversation_members (conversation_id, user_id)
  VALUES (_conv_id, _user_id);

  -- 他のメンバーを追加
  FOREACH _mid IN ARRAY _member_ids
  LOOP
    IF _mid != _user_id THEN
      INSERT INTO conversation_members (conversation_id, user_id)
      VALUES (_conv_id, _mid)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN _conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
