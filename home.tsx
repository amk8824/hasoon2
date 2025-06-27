import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calculator as CalculatorIcon, 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Receipt, 
  FileText, 
  Settings, 
  Bell,
  Home as HomeIcon,
  BarChart3,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import type { Customer, Expense, InsertCustomer, InsertExpense } from "@shared/schema";
import CalculatorComponent from "@/components/Calculator";

const customerSchema = z.object({
  name: z.string().min(1, "اسم العميل مطلوب"),
  goodsType: z.string().min(1, "نوع البضاعة مطلوب"),
  carCount: z.number().min(1, "عدد السيارات يجب أن يكون أكبر من صفر"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "المبلغ يجب أن يكون رقم صحيح أكبر من صفر"
  }),
  paymentStatus: z.enum(["paid", "unpaid"], {
    required_error: "حالة الدفع مطلوبة"
  })
});

const expenseSchema = z.object({
  description: z.string().min(1, "وصف الصرفية مطلوب"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "المبلغ يجب أن يكون رقم صحيح أكبر من صفر"
  })
});

type CustomerFormData = z.infer<typeof customerSchema>;
type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function Home() {
  const { toast } = useToast();
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Queries
  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"]
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"]
  });

  const { data: summary = {}, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/summary"]
  });

  // Forms
  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      goodsType: "",
      carCount: 1,
      amount: "",
      paymentStatus: "unpaid"
    }
  });

  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: ""
    }
  });

  // Mutations
  const createCustomerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const response = await apiRequest("POST", "/api/customers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      setShowCustomerDialog(false);
      customerForm.reset();
      toast({
        title: "تم إضافة العميل بنجاح",
        description: "تم حفظ بيانات العميل الجديد"
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة العميل",
        description: "حدث خطأ أثناء حفظ بيانات العميل",
        variant: "destructive"
      });
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCustomer> }) => {
      const response = await apiRequest("PUT", `/api/customers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      setEditingCustomer(null);
      setShowCustomerDialog(false);
      customerForm.reset();
      toast({
        title: "تم تحديث العميل بنجاح",
        description: "تم حفظ التعديلات"
      });
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({
        title: "تم حذف العميل",
        description: "تم حذف العميل بنجاح"
      });
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const response = await apiRequest("POST", "/api/expenses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      setShowExpenseDialog(false);
      expenseForm.reset();
      toast({
        title: "تم إضافة الصرفية بنجاح",
        description: "تم حفظ الصرفية الجديدة"
      });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({
        title: "تم حذف الصرفية",
        description: "تم حذف الصرفية بنجاح"
      });
    }
  });

  const clearAllDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/clear-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      setShowClearDialog(false);
      toast({
        title: "تم مسح جميع البيانات",
        description: "تم حذف جميع العمليات والمصاريف بنجاح"
      });
    }
  });

  const generatePDFMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-pdf");
      return response.json();
    },
    onSuccess: (data) => {
      // Client-side PDF generation using jsPDF
      const generatePDF = async () => {
        // Dynamic import to reduce bundle size
        const jsPDF = await import('jspdf').then(m => m.default);
        
        const doc = new jsPDF();
        
        // Set font for better Arabic support
        doc.setFont("helvetica", "normal");
        
        // Header with English text for better PDF compatibility
        doc.setFontSize(20);
        doc.text("Hassan Accounts - Operations Report", 105, 20, { align: "center" });
        
        doc.setFontSize(12);
        doc.text(`Report Date: ${formatDate(new Date())}`, 105, 30, { align: "center" });
        
        let yPosition = 50;
        
        // Group customers by name for consolidated reporting
        const groupedCustomers = data.customers.reduce((acc: any, customer: Customer) => {
          if (!acc[customer.name]) {
            acc[customer.name] = {
              name: customer.name,
              goodsType: customer.goodsType,
              totalCars: 0,
              totalAmount: 0,
              entries: []
            };
          }
          acc[customer.name].totalCars += customer.carCount;
          acc[customer.name].totalAmount += parseFloat(customer.amount);
          acc[customer.name].entries.push(customer);
          return acc;
        }, {});
        
        // Customers section
        doc.setFontSize(16);
        doc.text("Operations:", 20, yPosition);
        yPosition += 15;
        
        Object.values(groupedCustomers).forEach((group: any, index: number) => {
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.text(`${index + 1}. ${group.name}`, 20, yPosition);
          doc.setFontSize(10);
          doc.text(`   Goods Type: ${group.goodsType}`, 20, yPosition + 8);
          doc.text(`   Total Cars: ${group.totalCars}`, 20, yPosition + 16);
          doc.text(`   Total Amount: ${group.totalAmount.toLocaleString()} IQD`, 20, yPosition + 24);
          
          // Show individual entries
          group.entries.forEach((entry: Customer, entryIndex: number) => {
            doc.setFontSize(8);
            doc.text(`     Entry ${entryIndex + 1}: ${entry.carCount} cars - ${parseFloat(entry.amount).toLocaleString()} IQD (${entry.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'})`, 25, yPosition + 32 + (entryIndex * 8));
          });
          
          yPosition += 40 + (group.entries.length * 8);
        });
        
        // Expenses section
        yPosition += 10;
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text("Expenses:", 20, yPosition);
        yPosition += 15;
        
        data.expenses.forEach((expense: Expense, index: number) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(10);
          doc.text(`${index + 1}. ${expense.description}: ${parseFloat(expense.amount).toLocaleString()} IQD`, 20, yPosition);
          yPosition += 12;
        });
        
        // Summary
        yPosition += 15;
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text("Summary:", 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.text(`Total Revenue: ${((summary as any)?.totalRevenue || 0).toLocaleString()} IQD`, 20, yPosition);
        doc.text(`Total Expenses: ${((summary as any)?.totalExpenses || 0).toLocaleString()} IQD`, 20, yPosition + 12);
        doc.text(`Net Total: ${((summary as any)?.netTotal || 0).toLocaleString()} IQD`, 20, yPosition + 24);
        
        // Save the PDF
        doc.save(`hassan-accounts-${new Date().toISOString().split('T')[0]}.pdf`);
      };
      
      generatePDF();
      
      toast({
        title: "تم إنشاء التقرير",
        description: "تم تنزيل ملف PDF بنجاح"
      });
    }
  });

  // Form handlers
  const onCustomerSubmit = (data: CustomerFormData) => {
    const customerData: InsertCustomer = {
      ...data,
      amount: data.amount
    };

    if (editingCustomer) {
      updateCustomerMutation.mutate({
        id: editingCustomer.id,
        data: customerData
      });
    } else {
      createCustomerMutation.mutate(customerData);
    }
  };

  const onExpenseSubmit = (data: ExpenseFormData) => {
    const expenseData: InsertExpense = {
      ...data,
      amount: data.amount
    };
    createExpenseMutation.mutate(expenseData);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    customerForm.reset({
      name: customer.name,
      goodsType: customer.goodsType,
      carCount: customer.carCount,
      amount: customer.amount,
      paymentStatus: customer.paymentStatus as "paid" | "unpaid"
    });
    setShowCustomerDialog(true);
  };

  const handleCloseCustomerDialog = () => {
    setShowCustomerDialog(false);
    setEditingCustomer(null);
    customerForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <CalculatorIcon className="text-lg text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">حسابات حسن</h1>
                <p className="text-xs text-slate-500">محاسب المعام</p>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-2">
              <Button size="sm" variant="ghost" className="w-8 h-8 rounded-full">
                <Bell className="w-4 h-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 max-w-md pb-20">
        
        {/* Stats Cards - inspired by the image design */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-cyan-400 to-cyan-500 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{(summary as any)?.customerCount || 0}</div>
              <div className="text-xs opacity-90">العملاء</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{formatNumber((summary as any)?.totalCars || 0)}</div>
              <div className="text-xs opacity-90">السيارات</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-400 to-orange-500 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{(summary as any)?.expenseCount || 0}</div>
              <div className="text-xs opacity-90">الصرفيات</div>
            </CardContent>
          </Card>
        </div>

        {/* Service Icons */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex-col h-20 space-y-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-all border border-blue-200">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-blue-700 font-medium">العملاء</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? "تعديل العميل" : "إضافة عميل جديد"}
                </DialogTitle>
              </DialogHeader>
              <Form {...customerForm}>
                <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                  <FormField
                    control={customerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم العميل</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل اسم العميل" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="goodsType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع البضاعة</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل نوع البضاعة" 
                            {...field} 
                            className="input-focus"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="carCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد السيارات</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="عدد السيارات"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ (د.ع)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1" 
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حالة الدفع</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-row space-x-reverse space-x-6"
                          >
                            <div className="flex items-center space-x-reverse space-x-2">
                              <RadioGroupItem value="paid" id="paid" />
                              <Label htmlFor="paid">مدفوع</Label>
                            </div>
                            <div className="flex items-center space-x-reverse space-x-2">
                              <RadioGroupItem value="unpaid" id="unpaid" />
                              <Label htmlFor="unpaid">غير مدفوع</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                    >
                      {editingCustomer ? "تحديث" : "إضافة"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCloseCustomerDialog}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex-col h-20 space-y-1 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-sm hover:shadow-md transition-all border border-red-200">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-red-700 font-medium">المصاريف</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة صرفية جديدة</DialogTitle>
              </DialogHeader>
              <Form {...expenseForm}>
                <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                  <FormField
                    control={expenseForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الصرفية</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل وصف الصرفية" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={expenseForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ (د.ع)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1" 
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createExpenseMutation.isPending}
                    >
                      إضافة
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowExpenseDialog(false)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            className="flex-col h-20 space-y-1 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm hover:shadow-md transition-all border border-green-200"
            onClick={() => generatePDFMutation.mutate()}
            disabled={generatePDFMutation.isPending}
          >
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-green-700 font-medium">التقرير</span>
          </Button>

          <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex-col h-20 space-y-1 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-all border border-purple-200">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <CalculatorIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-purple-700 font-medium">الحاسبة</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs">
              <DialogHeader>
                <DialogTitle>الحاسبة</DialogTitle>
              </DialogHeader>
              <CalculatorComponent />
            </DialogContent>
          </Dialog>
        </div>

        {/* Daily Operations */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>الأعمال اليومية</span>
              <div className="flex gap-2">
                <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs">
                      <RefreshCw className="w-3 h-3 ml-1" />
                      مسح الكل
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>تأكيد مسح البيانات</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-slate-600">هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="destructive" 
                        onClick={() => clearAllDataMutation.mutate()}
                        disabled={clearAllDataMutation.isPending}
                        className="flex-1"
                      >
                        {clearAllDataMutation.isPending ? "جاري المسح..." : "مسح جميع البيانات"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowClearDialog(false)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Badge variant="outline" className="text-xs">
                  {formatDate(new Date())}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customersLoading ? (
              <div className="text-center py-4 text-slate-500">جاري التحميل...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-4 text-slate-500">لا توجد عمليات اليوم</div>
            ) : (
              (() => {
                // Group customers by date first, then by name
                const customersByDate = customers.reduce((acc: any, customer) => {
                  const dateKey = formatDate(customer.createdAt);
                  if (!acc[dateKey]) {
                    acc[dateKey] = [];
                  }
                  acc[dateKey].push(customer);
                  return acc;
                }, {});

                // Get the 3 most recent dates
                const recentDates = Object.keys(customersByDate)
                  .sort((a, b) => new Date(customersByDate[b][0].createdAt).getTime() - new Date(customersByDate[a][0].createdAt).getTime())
                  .slice(0, 3);

                return recentDates.map((dateKey) => {
                  const dateCustomers = customersByDate[dateKey];
                  const isExpanded = expandedDates.has(dateKey);
                  
                  // Group by name within each date
                  const groupedByName = dateCustomers.reduce((acc: any, customer: Customer) => {
                    if (!acc[customer.name]) {
                      acc[customer.name] = {
                        name: customer.name,
                        goodsType: customer.goodsType,
                        totalCars: 0,
                        totalAmount: 0,
                        entries: [],
                        allPaid: true
                      };
                    }
                    acc[customer.name].totalCars += customer.carCount;
                    acc[customer.name].totalAmount += parseFloat(customer.amount);
                    acc[customer.name].entries.push(customer);
                    if (customer.paymentStatus === 'unpaid') {
                      acc[customer.name].allPaid = false;
                    }
                    return acc;
                  }, {});

                  const customerGroups = Object.values(groupedByName);
                  const totalDayAmount = customerGroups.reduce((sum: number, group: any) => sum + group.totalAmount, 0);

                  return (
                    <div key={dateKey} className="bg-slate-50 rounded-xl overflow-hidden">
                      <Button
                        variant="ghost"
                        className="w-full p-3 justify-between h-auto"
                        onClick={() => {
                          const newExpanded = new Set(expandedDates);
                          if (isExpanded) {
                            newExpanded.delete(dateKey);
                          } else {
                            newExpanded.add(dateKey);
                          }
                          setExpandedDates(newExpanded);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-slate-800">{dateKey}</span>
                          <Badge variant="outline" className="text-xs">
                            {customerGroups.length} عميل
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-600">
                            {formatCurrency(totalDayAmount)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </Button>
                      
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-2">
                          {customerGroups.map((group: any) => (
                            <div key={group.name} className="p-3 bg-white rounded-xl shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-800">{group.name}</span>
                                    {group.allPaid ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {group.entries.length} معاملة
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    {group.goodsType} • {group.totalCars} سيارة إجمالي
                                  </div>
                                  <div className="text-sm font-medium text-blue-600">
                                    {formatCurrency(group.totalAmount)}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Individual entries */}
                              <div className="space-y-1 mt-2 pt-2 border-t border-slate-200">
                                {group.entries.map((customer: Customer) => (
                                  <div key={customer.id} className="flex items-center justify-between text-xs text-slate-500">
                                    <span>{customer.carCount} سيارة - {formatCurrency(parseFloat(customer.amount))}</span>
                                    <div className="flex gap-1">
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleEditCustomer(customer)}
                                        className="w-6 h-6 p-0"
                                      >
                                        <Edit className="w-3 h-3 text-slate-500" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => deleteCustomerMutation.mutate(customer.id)}
                                        className="w-6 h-6 p-0"
                                      >
                                        <Trash2 className="w-3 h-3 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()
            )}
          </CardContent>
        </Card>

        {/* Expenses */}
        {expenses.length > 0 && (
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">المصاريف</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{expense.description}</div>
                    <div className="text-sm font-medium text-red-600">
                      -{formatCurrency(parseFloat(expense.amount))}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => deleteExpenseMutation.mutate(expense.id)}
                    className="w-8 h-8 p-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-slate-600">إجمالي الدخل</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency((summary as any)?.totalRevenue || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">إجمالي المصاريف</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency((summary as any)?.totalExpenses || 0)}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <div className="text-sm text-slate-600">الباقي الصافي</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency((summary as any)?.netTotal || 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6 mt-8 text-xs text-slate-500 border-t border-slate-200 mb-20">
          <div className="mb-2">تصميم وتطوير</div>
          <div className="font-medium text-slate-700">
            أحمد العبيدي • حسن الكرطاني
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 safe-area-pb">
        <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
          <Button variant="ghost" size="sm" className="flex-col space-y-1 text-blue-600">
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs">الرئيسية</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">التقارير</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1" onClick={() => setShowCalculator(true)}>
            <CalculatorIcon className="w-5 h-5" />
            <span className="text-xs">الحاسبة</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1">
            <User className="w-5 h-5" />
            <span className="text-xs">الملف</span>
          </Button>
        </div>
      </div>
    </div>
  );
}