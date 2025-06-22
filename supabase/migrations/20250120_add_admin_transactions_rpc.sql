-- Create an RPC function to get all transactions for admin users
-- This function will bypass RLS by using SECURITY DEFINER

CREATE OR REPLACE FUNCTION get_all_transactions_admin(limit_count INT DEFAULT 1000)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  booking_id UUID,
  amount NUMERIC(10,2),
  currency TEXT,
  status TEXT,
  payment_method TEXT,
  transaction_reference TEXT,
  description TEXT,
  pet_owner_id UUID,
  provider TEXT,
  provider_payment_id TEXT,
  provider_order_id TEXT,
  payment_intent_id TEXT,
  customer_email TEXT
)
LANGUAGE sql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
  SELECT 
    t.id,
    t.created_at,
    t.updated_at,
    t.booking_id,
    t.amount,
    t.currency,
    t.status,
    t.payment_method,
    t.transaction_reference,
    t.description,
    t.pet_owner_id,
    t.provider,
    t.provider_payment_id,
    t.provider_order_id,
    t.payment_intent_id,
    t.customer_email
  FROM public.transactions t
  ORDER BY t.created_at DESC
  LIMIT limit_count;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_transactions_admin(INT) TO authenticated;

-- Add a comment to document the function
COMMENT ON FUNCTION get_all_transactions_admin(INT) IS 'Admin function to retrieve all transactions bypassing RLS. Used by SuperAdmin dashboard.'; 