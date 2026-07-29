/*
  # Add audio support to journal entries

  1. Changes
    - Add audio_url column for storing the transcribed audio file URL
    - Add transcription column for storing the transcribed text
    - Add audio_duration column for storing the length of the recording
*/

ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS audio_url text,
ADD COLUMN IF NOT EXISTS transcription text,
ADD COLUMN IF NOT EXISTS audio_duration integer;

-- Create index for audio entries
CREATE INDEX IF NOT EXISTS journal_entries_has_audio_idx ON journal_entries((audio_url IS NOT NULL));