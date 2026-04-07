-- ============================================================
-- TeamHub: Complete Database Schema
-- Supabase SQL Editor にそのまま貼って実行可能
-- ============================================================

-- =========================
-- 0. Extensions
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 将来の全文検索用

-- =========================
-- 1. Enums
-- =========================
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'guest');
CREATE TYPE channel_visibility AS ENUM ('public', 'private');
CREATE TYPE conversation_kind AS ENUM ('dm', 'group_dm');
CREATE TYPE presence_status AS ENUM ('online', 'offline', 'away');
CREATE TYPE notification_type AS ENUM (
  'dm_message',
  'mention',
  'thread_reply',
  'reaction',
  'invite',
  'channel_invite'
);
CREATE TYPE notification_entity_type AS ENUM (
  'message',
  'channel',
  'conversation',
  'workspace',
  'invite'
);

-- =========================
-- 2. Helper function: updated_at trigger
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- 3. Tables
-- =========================

-- 3-1. profiles
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url  text,
  email       text NOT NULL DEFAULT '',
  status_message text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3-2. workspaces
CREATE TABLE workspaces (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  icon_url    text,
  created_by  uuid NOT NULL REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspaces_slug ON workspaces(slug);

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3-3. workspace_members
CREATE TABLE workspace_members (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          workspace_role NOT NULL DEFAULT 'member',
  joined_at     timestamptz NOT NULL DEFAULT now(),
  invited_by    uuid REFERENCES profiles(id),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- 3-4. channels
CREATE TABLE channels (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          text NOT NULL,
  slug          text NOT NULL,
  description   text,
  topic         text,
  visibility    channel_visibility NOT NULL DEFAULT 'public',
  created_by    uuid NOT NULL REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_channels_workspace ON channels(workspace_id);

CREATE TRIGGER channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3-5. channel_members
CREATE TABLE channel_members (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id  uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

CREATE INDEX idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user ON channel_members(user_id);

-- 3-6. conversations
CREATE TABLE conversations (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  kind          conversation_kind NOT NULL DEFAULT 'dm',
  created_by    uuid NOT NULL REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_workspace ON conversations(workspace_id);

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3-7. conversation_members
CREATE TABLE conversation_members (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conversation_members_conversation ON conversation_members(conversation_id);
CREATE INDEX idx_conversation_members_user ON conversation_members(user_id);

-- 3-8. messages
CREATE TABLE messages (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id        uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel_id          uuid REFERENCES channels(id) ON DELETE CASCADE,
  conversation_id     uuid REFERENCES conversations(id) ON DELETE CASCADE,
  parent_message_id   uuid REFERENCES messages(id) ON DELETE SET NULL,
  sender_id           uuid NOT NULL REFERENCES profiles(id),
  body                text NOT NULL DEFAULT '',
  body_plaintext      text NOT NULL DEFAULT '',
  edited_at           timestamptz,
  deleted_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  -- channel_id と conversation_id のどちらか一方のみ
  CONSTRAINT messages_target_check CHECK (
    (channel_id IS NOT NULL AND conversation_id IS NULL) OR
    (channel_id IS NULL AND conversation_id IS NOT NULL)
  )
);

CREATE INDEX idx_messages_channel ON messages(channel_id, created_at)
  WHERE channel_id IS NOT NULL;
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at)
  WHERE conversation_id IS NOT NULL;
CREATE INDEX idx_messages_parent ON messages(parent_message_id)
  WHERE parent_message_id IS NOT NULL;
CREATE INDEX idx_messages_workspace ON messages(workspace_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3-9. message_reactions
CREATE TABLE message_reactions (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id  uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);

-- 3-10. message_mentions
CREATE TABLE message_mentions (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id          uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  mentioned_user_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, mentioned_user_id)
);

CREATE INDEX idx_message_mentions_message ON message_mentions(message_id);
CREATE INDEX idx_message_mentions_user ON message_mentions(mentioned_user_id);

-- 3-11. notifications
CREATE TABLE notifications (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type          notification_type NOT NULL,
  title         text NOT NULL DEFAULT '',
  body          text NOT NULL DEFAULT '',
  entity_type   notification_entity_type NOT NULL,
  entity_id     uuid NOT NULL,
  is_read       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_workspace ON notifications(workspace_id);

-- 3-12. invites
CREATE TABLE invites (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email         text,
  token         text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  role          workspace_role NOT NULL DEFAULT 'member',
  invited_by    uuid NOT NULL REFERENCES profiles(id),
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_workspace ON invites(workspace_id);

-- 3-13. read_states
CREATE TABLE read_states (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id          uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel_id            uuid REFERENCES channels(id) ON DELETE CASCADE,
  conversation_id       uuid REFERENCES conversations(id) ON DELETE CASCADE,
  last_read_message_id  uuid REFERENCES messages(id) ON DELETE SET NULL,
  last_read_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT read_states_target_check CHECK (
    (channel_id IS NOT NULL AND conversation_id IS NULL) OR
    (channel_id IS NULL AND conversation_id IS NOT NULL)
  )
);

-- partial unique indexes (NULLカラムのunique対策)
CREATE UNIQUE INDEX idx_read_states_channel
  ON read_states(user_id, channel_id)
  WHERE channel_id IS NOT NULL;

CREATE UNIQUE INDEX idx_read_states_conversation
  ON read_states(user_id, conversation_id)
  WHERE conversation_id IS NOT NULL;

CREATE INDEX idx_read_states_user ON read_states(user_id);

-- 3-14. user_presence
CREATE TABLE user_presence (
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status        presence_status NOT NULL DEFAULT 'offline',
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, workspace_id)
);

CREATE INDEX idx_user_presence_workspace ON user_presence(workspace_id);

CREATE TRIGGER user_presence_updated_at
  BEFORE UPDATE ON user_presence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =========================
-- 4. Triggers & Functions
-- =========================

-- 4-1. auth.users 登録時に profile を自動作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4-2. workspace 作成時に owner membership を自動作成
CREATE OR REPLACE FUNCTION handle_workspace_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_created
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION handle_workspace_created();

-- 4-3. channel 作成時に作成者の membership を自動作成
CREATE OR REPLACE FUNCTION handle_channel_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO channel_members (channel_id, user_id)
  VALUES (NEW.id, NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_channel_created
  AFTER INSERT ON channels
  FOR EACH ROW EXECUTE FUNCTION handle_channel_created();

-- 4-4. message の workspace 整合性チェック
CREATE OR REPLACE FUNCTION check_message_workspace_consistency()
RETURNS TRIGGER AS $$
DECLARE
  _ws_id uuid;
BEGIN
  IF NEW.channel_id IS NOT NULL THEN
    SELECT workspace_id INTO _ws_id FROM channels WHERE id = NEW.channel_id;
    IF _ws_id IS DISTINCT FROM NEW.workspace_id THEN
      RAISE EXCEPTION 'Message workspace_id does not match channel workspace_id';
    END IF;
  END IF;

  IF NEW.conversation_id IS NOT NULL THEN
    SELECT workspace_id INTO _ws_id FROM conversations WHERE id = NEW.conversation_id;
    IF _ws_id IS DISTINCT FROM NEW.workspace_id THEN
      RAISE EXCEPTION 'Message workspace_id does not match conversation workspace_id';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_message_workspace
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION check_message_workspace_consistency();

-- 4-5. parent_message_id の整合性チェック
-- 親メッセージは同じ channel/conversation に属し、自身が thread root であること
CREATE OR REPLACE FUNCTION check_parent_message_consistency()
RETURNS TRIGGER AS $$
DECLARE
  parent_record messages%ROWTYPE;
BEGIN
  IF NEW.parent_message_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO parent_record FROM messages WHERE id = NEW.parent_message_id;

  IF parent_record IS NULL THEN
    RAISE EXCEPTION 'Parent message not found';
  END IF;

  -- 親は thread root（parent_message_id が NULL）でなければならない
  IF parent_record.parent_message_id IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot reply to a thread reply; reply to the root message instead';
  END IF;

  -- 同じ channel/conversation に属すこと
  IF NEW.channel_id IS DISTINCT FROM parent_record.channel_id THEN
    RAISE EXCEPTION 'Thread reply must be in the same channel as parent';
  END IF;

  IF NEW.conversation_id IS DISTINCT FROM parent_record.conversation_id THEN
    RAISE EXCEPTION 'Thread reply must be in the same conversation as parent';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_parent_message
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION check_parent_message_consistency();

-- 4-6. message insert 時に channel/conversation の updated_at を更新
CREATE OR REPLACE FUNCTION update_container_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.channel_id IS NOT NULL THEN
    UPDATE channels SET updated_at = now() WHERE id = NEW.channel_id;
  END IF;
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_update_container
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_container_updated_at();

-- 4-7. mention 通知作成 trigger
CREATE OR REPLACE FUNCTION handle_mention_notification()
RETURNS TRIGGER AS $$
DECLARE
  _msg messages%ROWTYPE;
  _sender profiles%ROWTYPE;
BEGIN
  SELECT * INTO _msg FROM messages WHERE id = NEW.message_id;
  SELECT * INTO _sender FROM profiles WHERE id = _msg.sender_id;

  -- 自分自身へのメンションは通知しない
  IF NEW.mentioned_user_id = _msg.sender_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, workspace_id, type, title, body, entity_type, entity_id)
  VALUES (
    NEW.mentioned_user_id,
    _msg.workspace_id,
    'mention',
    _sender.display_name || ' mentioned you',
    LEFT(_msg.body_plaintext, 200),
    'message',
    _msg.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_mention_created
  AFTER INSERT ON message_mentions
  FOR EACH ROW EXECUTE FUNCTION handle_mention_notification();

-- 4-8. reaction 通知作成 trigger
CREATE OR REPLACE FUNCTION handle_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  _msg messages%ROWTYPE;
  _reactor profiles%ROWTYPE;
BEGIN
  SELECT * INTO _msg FROM messages WHERE id = NEW.message_id;

  -- 自分のメッセージへのリアクションは通知しない
  IF _msg.sender_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT * INTO _reactor FROM profiles WHERE id = NEW.user_id;

  INSERT INTO notifications (user_id, workspace_id, type, title, body, entity_type, entity_id)
  VALUES (
    _msg.sender_id,
    _msg.workspace_id,
    'reaction',
    _reactor.display_name || ' reacted ' || NEW.emoji,
    LEFT(_msg.body_plaintext, 200),
    'message',
    _msg.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_created
  AFTER INSERT ON message_reactions
  FOR EACH ROW EXECUTE FUNCTION handle_reaction_notification();

-- 4-9. thread reply 通知作成 trigger
CREATE OR REPLACE FUNCTION handle_thread_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
  _parent messages%ROWTYPE;
  _sender profiles%ROWTYPE;
BEGIN
  IF NEW.parent_message_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO _parent FROM messages WHERE id = NEW.parent_message_id;

  -- 自分のスレッドへの返信は通知しない
  IF _parent.sender_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  SELECT * INTO _sender FROM profiles WHERE id = NEW.sender_id;

  INSERT INTO notifications (user_id, workspace_id, type, title, body, entity_type, entity_id)
  VALUES (
    _parent.sender_id,
    NEW.workspace_id,
    'thread_reply',
    _sender.display_name || ' replied to your message',
    LEFT(NEW.body_plaintext, 200),
    'message',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_thread_reply_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION handle_thread_reply_notification();


-- =========================
-- 5. Helper functions
-- =========================

-- workspace membership check (RLSポリシーで多用)
CREATE OR REPLACE FUNCTION is_workspace_member(_workspace_id uuid, _user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- channel access check
CREATE OR REPLACE FUNCTION can_access_channel(_channel_id uuid, _user_id uuid)
RETURNS boolean AS $$
DECLARE
  _channel channels%ROWTYPE;
BEGIN
  SELECT * INTO _channel FROM channels WHERE id = _channel_id;
  IF _channel IS NULL THEN
    RETURN false;
  END IF;

  -- public channel: workspace member なら OK
  IF _channel.visibility = 'public' THEN
    RETURN is_workspace_member(_channel.workspace_id, _user_id);
  END IF;

  -- private channel: channel member のみ
  RETURN EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_id = _channel_id AND user_id = _user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- conversation access check
CREATE OR REPLACE FUNCTION can_access_conversation(_conversation_id uuid, _user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- workspace role check
CREATE OR REPLACE FUNCTION get_workspace_role(_workspace_id uuid, _user_id uuid)
RETURNS workspace_role AS $$
  SELECT role FROM workspace_members
  WHERE workspace_id = _workspace_id AND user_id = _user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =========================
-- 6. RLS Enable
-- =========================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;


-- =========================
-- 7. RLS Policies
-- =========================

-- ---- profiles ----
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true); -- 認証済みユーザーは全profileを参照可能(ユーザー検索のため)

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---- workspaces ----
CREATE POLICY "workspaces_select_member"
  ON workspaces FOR SELECT
  TO authenticated
  USING (is_workspace_member(id, auth.uid()));

CREATE POLICY "workspaces_insert_authenticated"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "workspaces_update_admin"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (get_workspace_role(id, auth.uid()) IN ('owner', 'admin'))
  WITH CHECK (get_workspace_role(id, auth.uid()) IN ('owner', 'admin'));

-- ---- workspace_members ----
CREATE POLICY "workspace_members_select"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "workspace_members_insert_admin"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
    OR user_id = auth.uid() -- 自分自身の参加(招待受理時)
  );

CREATE POLICY "workspace_members_update_admin"
  ON workspace_members FOR UPDATE
  TO authenticated
  USING (get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "workspace_members_delete_admin"
  ON workspace_members FOR DELETE
  TO authenticated
  USING (
    get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
    OR user_id = auth.uid() -- 自分で退出
  );

-- ---- channels ----
CREATE POLICY "channels_select"
  ON channels FOR SELECT
  TO authenticated
  USING (
    CASE
      WHEN visibility = 'public' THEN is_workspace_member(workspace_id, auth.uid())
      ELSE EXISTS (
        SELECT 1 FROM channel_members cm
        WHERE cm.channel_id = id AND cm.user_id = auth.uid()
      )
    END
  );

CREATE POLICY "channels_insert"
  ON channels FOR INSERT
  TO authenticated
  WITH CHECK (
    is_workspace_member(workspace_id, auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "channels_update"
  ON channels FOR UPDATE
  TO authenticated
  USING (
    can_access_channel(id, auth.uid())
    AND (
      created_by = auth.uid()
      OR get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
    )
  );

-- ---- channel_members ----
CREATE POLICY "channel_members_select"
  ON channel_members FOR SELECT
  TO authenticated
  USING (can_access_channel(channel_id, auth.uid()));

CREATE POLICY "channel_members_insert"
  ON channel_members FOR INSERT
  TO authenticated
  WITH CHECK (
    can_access_channel(channel_id, auth.uid())
    OR (
      -- public channel への自己参加
      EXISTS (
        SELECT 1 FROM channels c
        WHERE c.id = channel_id
        AND c.visibility = 'public'
        AND is_workspace_member(c.workspace_id, auth.uid())
      )
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "channel_members_delete"
  ON channel_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = channel_id
      AND get_workspace_role(c.workspace_id, auth.uid()) IN ('owner', 'admin')
    )
  );

-- ---- conversations ----
CREATE POLICY "conversations_select"
  ON conversations FOR SELECT
  TO authenticated
  USING (can_access_conversation(id, auth.uid()));

CREATE POLICY "conversations_insert"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    is_workspace_member(workspace_id, auth.uid())
    AND created_by = auth.uid()
  );

-- ---- conversation_members ----
CREATE POLICY "conversation_members_select"
  ON conversation_members FOR SELECT
  TO authenticated
  USING (can_access_conversation(conversation_id, auth.uid()));

CREATE POLICY "conversation_members_insert"
  ON conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (can_access_conversation(conversation_id, auth.uid()));

-- ---- messages ----
CREATE POLICY "messages_select"
  ON messages FOR SELECT
  TO authenticated
  USING (
    (channel_id IS NOT NULL AND can_access_channel(channel_id, auth.uid()))
    OR
    (conversation_id IS NOT NULL AND can_access_conversation(conversation_id, auth.uid()))
  );

CREATE POLICY "messages_insert"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      (channel_id IS NOT NULL AND can_access_channel(channel_id, auth.uid()))
      OR
      (conversation_id IS NOT NULL AND can_access_conversation(conversation_id, auth.uid()))
    )
  );

CREATE POLICY "messages_update_sender"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_delete_sender"
  ON messages FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- ---- message_reactions ----
CREATE POLICY "message_reactions_select"
  ON message_reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_id
      AND (
        (m.channel_id IS NOT NULL AND can_access_channel(m.channel_id, auth.uid()))
        OR
        (m.conversation_id IS NOT NULL AND can_access_conversation(m.conversation_id, auth.uid()))
      )
    )
  );

CREATE POLICY "message_reactions_insert"
  ON message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_id
      AND (
        (m.channel_id IS NOT NULL AND can_access_channel(m.channel_id, auth.uid()))
        OR
        (m.conversation_id IS NOT NULL AND can_access_conversation(m.conversation_id, auth.uid()))
      )
    )
  );

CREATE POLICY "message_reactions_delete_own"
  ON message_reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---- message_mentions ----
CREATE POLICY "message_mentions_select"
  ON message_mentions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_id
      AND (
        (m.channel_id IS NOT NULL AND can_access_channel(m.channel_id, auth.uid()))
        OR
        (m.conversation_id IS NOT NULL AND can_access_conversation(m.conversation_id, auth.uid()))
      )
    )
  );

CREATE POLICY "message_mentions_insert"
  ON message_mentions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_id
      AND m.sender_id = auth.uid()
    )
  );

-- ---- notifications ----
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- notifications insert は trigger (SECURITY DEFINER) 経由のみ
-- クライアントからの直接 insert は禁止

-- ---- invites ----
CREATE POLICY "invites_select"
  ON invites FOR SELECT
  TO authenticated
  USING (
    get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "invites_insert_admin"
  ON invites FOR INSERT
  TO authenticated
  WITH CHECK (
    get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
    AND invited_by = auth.uid()
  );

-- invite accept は別途 RPC function で処理

-- ---- read_states ----
CREATE POLICY "read_states_select_own"
  ON read_states FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "read_states_insert_own"
  ON read_states FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "read_states_update_own"
  ON read_states FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---- user_presence ----
CREATE POLICY "user_presence_select"
  ON user_presence FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "user_presence_upsert_own"
  ON user_presence FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_presence_update_own"
  ON user_presence FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =========================
-- 8. RPC: 招待受理
-- =========================
CREATE OR REPLACE FUNCTION accept_invite(_token text)
RETURNS uuid AS $$
DECLARE
  _invite invites%ROWTYPE;
  _user_id uuid := auth.uid();
BEGIN
  SELECT * INTO _invite FROM invites
  WHERE token = _token
    AND accepted_at IS NULL
    AND expires_at > now();

  IF _invite IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  -- workspace member に追加
  INSERT INTO workspace_members (workspace_id, user_id, role, invited_by)
  VALUES (_invite.workspace_id, _user_id, _invite.role, _invite.invited_by)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- invite を accepted にする
  UPDATE invites SET accepted_at = now() WHERE id = _invite.id;

  RETURN _invite.workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================
-- 9. Realtime publication
-- =========================
-- Supabase Realtime で購読するテーブル
-- (Supabase Dashboard で Publication 設定も必要)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE read_states;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
