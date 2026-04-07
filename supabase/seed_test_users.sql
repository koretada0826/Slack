-- ============================================================
-- テストユーザーのシードデータ
-- Supabase SQL Editor で実行してください
-- 注意: auth.users への直接INSERTはSupabase Dashboard経由が推奨
-- このスクリプトは profiles テーブルのみ更新します
--
-- 先に以下のアカウントを Supabase Dashboard > Authentication で作成してください:
--   1. user-a@test.com / password123
--   2. user-b@test.com / password123
--   3. user-c@test.com / password123
--
-- または、アプリのサインアップ画面から作成してください。
-- プロフィールは auth.users 作成時にトリガーで自動作成されます。
-- 以下はプロフィールを更新するだけです。
-- ============================================================

-- プロフィールを更新（auth.users 作成後に実行）
UPDATE profiles SET display_name = '田中太郎', status_message = 'こんにちは！'
WHERE email = 'user-a@test.com' AND display_name = '';

UPDATE profiles SET display_name = '鈴木花子', status_message = 'よろしくお願いします'
WHERE email = 'user-b@test.com' AND display_name = '';

UPDATE profiles SET display_name = '佐藤健太', status_message = 'エンジニアです'
WHERE email = 'user-c@test.com' AND display_name = '';
