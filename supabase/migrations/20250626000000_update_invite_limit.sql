/*
  # Update invite validation to enforce 1-user limit

  1. Updates
    - `validate_invite_code` function now checks if inviter already has 1 invited user
    - Returns error if limit reached
*/

-- Drop and recreate the function with new logic
DROP FUNCTION IF EXISTS validate_invite_code(text);

CREATE OR REPLACE FUNCTION validate_invite_code(invite_code_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  inviter_record RECORD;
  invited_user_count INTEGER;
  result JSONB;
BEGIN
  -- Look up the invite
  SELECT * INTO invite_record
  FROM invites
  WHERE code = invite_code_param
  AND status = 'pending'
  LIMIT 1;
  
  -- If no invite found, return invalid result
  IF invite_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid invite code or invite has expired'
    );
  END IF;
  
  -- Look up the inviter if this is a relationship invite
  BEGIN
    -- For relationship invites, the code is the relationship_id
    SELECT p.* INTO inviter_record
    FROM profiles p
    JOIN internal_world_entries e ON p.id = e.user_id
    WHERE e.relationship_id::text = invite_code_param
    LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      -- If there's an error, we'll just set inviter_record to NULL
      inviter_record := NULL;
  END;
  
  -- If we couldn't find an inviter through relationship, try the profiles table
  IF inviter_record IS NULL THEN
    -- For premium invites, look up the inviter directly
    SELECT p.* INTO inviter_record
    FROM profiles p
    WHERE p.invite_code = invite_code_param
    LIMIT 1;
  END IF;
  
  -- Check if this is a premium invite (has an inviter) and if so, check the limit
  IF inviter_record IS NOT NULL THEN
    -- Count how many users this inviter has already invited
    SELECT COUNT(*) INTO invited_user_count
    FROM profiles
    WHERE invited_by = inviter_record.id;
    
    -- If they already have 1 invited user, return error
    IF invited_user_count >= 1 THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'This invite code has reached its maximum limit. The inviter can only have 1 invited user at a time.'
      );
    END IF;
  END IF;
  
  -- Build the result
  result := jsonb_build_object(
    'valid', true,
    'invite', row_to_json(invite_record)::jsonb,
    'inviter', CASE WHEN inviter_record IS NULL THEN NULL ELSE 
      jsonb_build_object(
        'id', inviter_record.id,
        'first_name', inviter_record.first_name,
        'last_name', inviter_record.last_name,
        'email', inviter_record.email
      )
    END
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION validate_invite_code(text) TO PUBLIC; 