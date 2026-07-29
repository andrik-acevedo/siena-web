-- Add DELETE policy for chat_history to allow users to delete their own chats
-- Run this SQL in your Supabase SQL editor if the policy doesn't exist

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'chat_history'
    AND policyname = 'Users can delete own chat history'
  ) THEN
    CREATE POLICY "Users can delete own chat history"
      ON chat_history
      FOR DELETE
      USING (auth.uid() = user_id);

    RAISE NOTICE 'Policy created successfully';
  ELSE
    RAISE NOTICE 'Policy already exists';
  END IF;
END $$;
