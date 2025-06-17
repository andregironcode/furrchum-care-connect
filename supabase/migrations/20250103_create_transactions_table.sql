-- Create transactions table to track all payment transactions
create table public.transactions (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  booking_id uuid null,
  amount numeric(10, 2) not null,
  currency text null default 'INR'::text,
  status text not null default 'pending'::text,
  payment_method text null,
  transaction_reference text null,
  description text null,
  pet_owner_id uuid null,
  provider text null default 'razorpay'::text,
  provider_payment_id text null,
  provider_order_id text null,
  payment_intent_id text null,
  customer_email text null,
  constraint transactions_pkey primary key (id),
  constraint transactions_booking_id_fkey foreign KEY (booking_id) references bookings (id),
  constraint transactions_pet_owner_id_fkey foreign KEY (pet_owner_id) references auth.users (id) on delete CASCADE,
  constraint transactions_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'completed'::text,
          'failed'::text,
          'refunded'::text,
          'success'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Create indexes for better query performance
create index IF not exists idx_transactions_booking_id on public.transactions using btree (booking_id) TABLESPACE pg_default;

create index IF not exists idx_transactions_status on public.transactions using btree (status) TABLESPACE pg_default;

create index IF not exists idx_transactions_pet_owner_id on public.transactions using btree (pet_owner_id) TABLESPACE pg_default;

create index IF not exists idx_transactions_payment_intent_id on public.transactions using btree (payment_intent_id) TABLESPACE pg_default;

create index IF not exists idx_transactions_provider_payment_id on public.transactions using btree (provider_payment_id) TABLESPACE pg_default;

create index IF not exists idx_transactions_provider_order_id on public.transactions using btree (provider_order_id) TABLESPACE pg_default;

-- Create trigger to automatically update the updated_at timestamp
create trigger update_transactions_updated_at BEFORE
update on transactions for EACH row
execute FUNCTION update_updated_at ();

-- Enable Row Level Security
alter table public.transactions enable row level security;

-- Create RLS policies for transactions

-- Pet owners can view their own transactions
create policy "Pet owners can view own transactions" on public.transactions
  for select using (
    auth.uid() = pet_owner_id OR 
    auth.uid() in (
      select id from auth.users 
      where raw_user_meta_data->>'user_type' = 'admin'
    )
  );

-- Vets can view transactions for their bookings
create policy "Vets can view their booking transactions" on public.transactions
  for select using (
    auth.uid() in (
      select vet_id from bookings where id = booking_id
    ) OR
    auth.uid() in (
      select id from auth.users 
      where raw_user_meta_data->>'user_type' = 'admin'
    )
  );

-- Only system/admin can insert transactions
create policy "System can insert transactions" on public.transactions
  for insert with check (true);

-- Only system/admin can update transactions
create policy "System can update transactions" on public.transactions
  for update using (true);

-- Grant necessary permissions
grant select, insert, update on public.transactions to authenticated;
grant select, insert, update on public.transactions to anon; 