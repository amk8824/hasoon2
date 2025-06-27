import { customers, expenses, type Customer, type Expense, type InsertCustomer, type InsertExpense } from "@shared/schema";

export interface IStorage {
  // Customer methods
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Expense methods
  getAllExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Clear all data
  clearAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private expenses: Map<number, Expense>;
  private currentCustomerId: number;
  private currentExpenseId: number;

  constructor() {
    this.customers = new Map();
    this.expenses = new Map();
    this.currentCustomerId = 1;
    this.currentExpenseId = 1;
  }

  // Customer methods
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;

    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Expense methods
  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;

    const updatedExpense = { ...expense, ...updates };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async clearAllData(): Promise<void> {
    this.customers.clear();
    this.expenses.clear();
    this.currentCustomerId = 1;
    this.currentExpenseId = 1;
  }
}

export const storage = new MemStorage();
