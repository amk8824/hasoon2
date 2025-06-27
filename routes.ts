import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertExpenseSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create customer" });
      }
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, updates);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update customer" });
      }
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Summary route
  app.get("/api/summary", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      const expenses = await storage.getAllExpenses();
      
      const totalRevenue = customers.reduce((sum, customer) => 
        sum + parseFloat(customer.amount), 0
      );
      
      const totalExpenses = expenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0
      );
      
      const totalCars = customers.reduce((sum, customer) => 
        sum + customer.carCount, 0
      );
      
      const netTotal = totalRevenue - totalExpenses;
      
      res.json({
        totalRevenue,
        totalExpenses,
        netTotal,
        totalCars,
        customerCount: customers.length,
        expenseCount: expenses.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  // Clear all data route
  app.delete("/api/clear-all", async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ message: "All data cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear data" });
    }
  });

  // PDF generation route
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      const expenses = await storage.getAllExpenses();
      
      // Return data for client-side PDF generation
      res.json({
        customers,
        expenses,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF data" });
    }
  });

  // Clear all data route
  app.delete("/api/clear-all", async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ message: "All data cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
