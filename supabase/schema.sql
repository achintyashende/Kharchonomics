-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Accounts Table
create table public.accounts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    name text not null,
    icon text not null,
    initial_balance numeric(12, 2) default 0 not null,
    archived boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.accounts enable row level security;
create policy "Users can view own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can insert own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts" on public.accounts for delete using (auth.uid() = user_id);

-- 2. Categories Table
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    name text not null,
    type text not null check (type in ('income', 'expense')),
    icon text not null,
    color text not null,
    archived boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.categories enable row level security;
create policy "Users can view own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories for delete using (auth.uid() = user_id);

-- 3. Transactions Table
create table public.transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    type text not null check (type in ('income', 'expense', 'transfer')),
    account_id uuid references public.accounts,
    to_account_id uuid references public.accounts,
    category_id uuid references public.categories,
    amount numeric(12, 2) not null,
    notes text,
    date date not null,
    time time without time zone not null,
    archived boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    constraint tx_account_check check (
        (type = 'transfer' and account_id is not null and to_account_id is not null) or
        (type != 'transfer' and account_id is not null and category_id is not null)
    )
);
alter table public.transactions enable row level security;
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- 4. Budgets Table
create table public.budgets (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    category_id uuid references public.categories not null,
    month integer not null check (month >= 0 and month <= 11),
    year integer not null,
    limit_amount numeric(12, 2) default 0 not null,
    archived boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, category_id, month, year)
);
alter table public.budgets enable row level security;
create policy "Users can view own budgets" on public.budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on public.budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on public.budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on public.budgets for delete using (auth.uid() = user_id);

-- Function to handle new user seed data
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Example default account
  insert into public.accounts (user_id, name, icon, initial_balance)
  values (new.id, 'Cash', 'cash', 1000);
  
  -- Example default categories
  insert into public.categories (user_id, name, type, icon, color)
  values 
    (new.id, 'Food', 'expense', 'utensils', '#ef5350'),
    (new.id, 'Rent', 'expense', 'home', '#f2c94c'),
    (new.id, 'Salary', 'income', 'salary', '#6fcf97');
    
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to seed data for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
