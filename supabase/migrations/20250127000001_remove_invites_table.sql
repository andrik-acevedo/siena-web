/*
  # Remove invites table and simplify invite system

  1. Changes
    - Drop the invites table entirely
    - Update validate_invite_code function to work without invites table
    - Rely solely on profiles table for invite tracking

  This simplifies the invite system to use only the profiles.invite_code 
  and profiles.invited_by columns, eliminating the need for a separate
  invites table and fixing RLS policy issues.
*/

-- Drop the invites table and all its dependencies
DROP TABLE IF EXISTS invites CASCADE;

-- Update the validate_invite_code function to work without invites table
CREATE OR REPLACE FUNCTION validate_invite_code(invite_code_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inviter_record RECORD;
  invited_user_count INTEGER;
  result JSONB;
BEGIN
  -- Look up the inviter by their invite_code
  SELECT * INTO inviter_record
  FROM profiles
  WHERE invite_code = invite_code_param
  LIMIT 1;
  
  -- If no inviter found, return invalid result
  IF inviter_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid invite code'
    );
  END IF;
  
  -- Check if the inviter can still invite more users (limit of 1)
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
  
  -- Return valid result with inviter info
  result := jsonb_build_object(
    'valid', true,
    'inviter', jsonb_build_object(
      'id', inviter_record.id,
      'first_name', inviter_record.first_name,
      'last_name', inviter_record.last_name,
      'email', inviter_record.email
    )
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION validate_invite_code(text) TO PUBLIC; 