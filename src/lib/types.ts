export type Account = {
  id: string;
  name: string;
  icon: string;
  initial_balance: number;
  archived: boolean;
  ignored: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  archived: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  account_id: string | null;
  to_account_id: string | null;
  category_id: string | null;
  amount: number;
  notes: string | null;
  date: string;
  time: string;
  archived: boolean;
  created_at: string;
};

export type Budget = {
  id: string;
  category_id: string;
  month: number;
  year: number;
  limit_amount: number;
  archived: boolean;
  created_at: string;
};

export type RecurringTransaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  account_id: string | null;
  to_account_id: string | null;
  category_id: string | null;
  amount: number;
  day_of_month: number;
  archived: boolean;
  created_at: string;
  last_processed_date: string | null;
};
