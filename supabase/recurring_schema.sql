-- Run this in your Supabase SQL Editor

create table public.recurring_transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    type text not null check (type in ('income', 'expense', 'transfer')),
    account_id uuid references public.accounts,
    to_account_id uuid references public.accounts,
    category_id uuid references public.categories,
    amount numeric(12, 2) not null,
    notes text,
    day_of_month integer not null check (day_of_month >= 1 and day_of_month <= 31),
    last_processed_month integer,
    last_processed_year integer,
    archived boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    constraint recurring_account_check check (
        (type = 'transfer' and account_id is not null and to_account_id is not null) or
        (type != 'transfer' and account_id is not null and category_id is not null)
    )
);

alter table public.recurring_transactions enable row level security;
create policy "Users can view own recurring transactions" on public.recurring_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own recurring transactions" on public.recurring_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own recurring transactions" on public.recurring_transactions for update using (auth.uid() = user_id);
create policy "Users can delete own recurring transactions" on public.recurring_transactions for delete using (auth.uid() = user_id);
