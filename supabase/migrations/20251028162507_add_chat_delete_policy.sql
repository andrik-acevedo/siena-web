/*
  # Add DELETE policy for chat_history

  1. Changes
    - Add DELETE policy to chat_history table to allow users to delete their own chats

  2. Security
    - Policy ensures users can only delete their own chat history
    - Uses auth.uid() to verify ownership
*/

CREATE POLICY "Users can delete own chat history"
  ON chat_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
