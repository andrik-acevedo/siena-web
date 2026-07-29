# Fix Chat History Delete Issue

## Problem
Chat history items cannot be deleted because the `chat_history` table is missing a DELETE policy.

## Solution
Apply the DELETE policy by running the SQL below in your Supabase SQL Editor.

## Steps

1. Go to your Supabase Dashboard: https://vfsysdkbhwrrveyhehvg.supabase.co
2. Navigate to the SQL Editor
3. Run the following SQL:

```sql
CREATE POLICY "Users can delete own chat history"
  ON chat_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

4. Verify the policy was created by running:

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'chat_history';
```

You should see three policies:
- Users can read own chat history (SELECT)
- Users can insert own chat messages (INSERT)
- Users can delete own chat history (DELETE)

## After Applying
Once the policy is applied, users will be able to delete their chat history items.
