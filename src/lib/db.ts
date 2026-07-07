import Dexie, { Table } from 'dexie';
import { Account, Category, Transaction, Budget, RecurringTransaction } from './types';
import { v4 as uuidv4 } from 'uuid';

export class KharchonomicsDB extends Dexie {
  accounts!: Table<Account, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  recurring_transactions!: Table<RecurringTransaction, string>;

  constructor() {
    super('KharchonomicsDB');
    this.version(1).stores({
      accounts: 'id, name, archived, created_at',
      categories: 'id, type, archived, created_at',
      transactions: 'id, account_id, to_account_id, category_id, date, archived, created_at',
      budgets: 'id, month, year, category_id, archived, created_at',
      recurring_transactions: 'id, account_id, to_account_id, category_id, day_of_month, archived, created_at'
    });
  }
}

export const db = new KharchonomicsDB();

// Initialize defaults if empty
db.on('ready', async () => {
  const accountCount = await db.accounts.count();
  if (accountCount === 0) {
    const defaultAccounts: Account[] = [
      { id: uuidv4(), name: 'Main Account', icon: 'wallet', initial_balance: 0, archived: false, ignored: false, created_at: new Date().toISOString() },
      { id: uuidv4(), name: 'Savings', icon: 'piggy-bank', initial_balance: 0, archived: false, ignored: false, created_at: new Date().toISOString() }
    ];
    await db.accounts.bulkAdd(defaultAccounts);
  }

  const catCount = await db.categories.count();
  if (catCount === 0) {
    const defaultCategories: Category[] = [
      { id: uuidv4(), name: 'Food', type: 'expense', icon: 'utensils', color: '#ef4444', archived: false, created_at: new Date().toISOString() },
      { id: uuidv4(), name: 'Transport', type: 'expense', icon: 'car', color: '#f97316', archived: false, created_at: new Date().toISOString() },
      { id: uuidv4(), name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899', archived: false, created_at: new Date().toISOString() },
      { id: uuidv4(), name: 'Bills', type: 'expense', icon: 'receipt', color: '#8b5cf6', archived: false, created_at: new Date().toISOString() },
      { id: uuidv4(), name: 'Salary', type: 'income', icon: 'banknote', color: '#22c55e', archived: false, created_at: new Date().toISOString() },
      { id: uuidv4(), name: 'Bonus', type: 'income', icon: 'award', color: '#10b981', archived: false, created_at: new Date().toISOString() }
    ];
    await db.categories.bulkAdd(defaultCategories);
  }
});
