/*
  # Create payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (text)
      - `quantity` (integer)
      - `total_amount` (decimal)
      - `status` (text, default: 'pending')
      - `stripe_session_id` (text)
      - `stripe_payment_intent_id` (text)
      - `is_paid` (boolean, default: false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Users can read their own payments
      - Users can create their own payments
      - Users cannot modify existing payments (read-only)

  3. Indexes
    - Index on user_id for faster queries
    - Index on stripe_session_id for Stripe webhook processing
    - Index on status for filtering
*/

-- Create payments table
CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    total_amount decimal(10,2) NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    stripe_session_id text,
    stripe_payment_intent_id text,
    is_paid boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX payments_user_id_idx ON payments(user_id);
CREATE INDEX payments_stripe_session_id_idx ON payments(stripe_session_id);
CREATE INDEX payments_status_idx ON payments(status);

-- Create updated_at trigger
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Users can read own payments"
    ON payments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments"
    ON payments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE payments IS 'Stores payment information for user transactions';