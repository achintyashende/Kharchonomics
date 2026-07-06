export type Account = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  initial_balance: number;
  archived: boolean;
  ignored: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  archived: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
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
  user_id: string;
  category_id: string;
  month: number;
  year: number;
  limit_amount: number;
  archived: boolean;
  created_at: string;
};
