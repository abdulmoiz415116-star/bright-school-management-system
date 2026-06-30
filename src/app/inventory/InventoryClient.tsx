"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Plus, Minus, Loader2, Trash2, Edit2, ArrowUpRight, 
  ArrowDownRight, AlertTriangle, Search, CheckCircle2, RefreshCw, 
  Printer, Share2, Calendar, ChevronDown, ChevronUp, FileText, CreditCard, Landmark, Wallet, Users
} from "lucide-react";
import { useLocale } from "next-intl";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  minimum_stock_level: number;
  purchase_price: number;
  sale_price: number;
};

type InventoryLog = {
  id: number;
  item_id: number;
  item_name?: string;
  transaction_type: string; // 'IN' or 'OUT'
  quantity: number;
  remarks: string;
  handled_by: string;
  date: string;
  payment_mode: string; // 'Cash Purchase', 'Credit Purchase', 'Donation', 'Internal Issue', 'Cash Sale', 'Credit Sale'
  price_per_unit: number;
  total_amount: number;
  payment_source?: string; // 'Cash in Hand', 'Bank', or Supplier Name
};

type Supplier = {
  id: number;
  name: string;
  contact: string;
  outstanding_balance: number;
};

const DEFAULT_ITEMS: InventoryItem[] = [
  { id: 101, name: "Pens (بال پین)", category: "Stationery", quantity: 120, unit: "pcs", location: "Main Store - Rack A1", minimum_stock_level: 20, purchase_price: 15, sale_price: 20 },
  { id: 102, name: "Pencils (پنسل)", category: "Stationery", quantity: 250, unit: "pcs", location: "Main Store - Rack A1", minimum_stock_level: 30, purchase_price: 8, sale_price: 10 },
  { id: 103, name: "Sharpeners (شاپنر)", category: "Stationery", quantity: 180, unit: "pcs", location: "Main Store - Rack A1", minimum_stock_level: 25, purchase_price: 10, sale_price: 15 },
  { id: 104, name: "Erasers (ربڑ / ریزرز)", category: "Stationery", quantity: 200, unit: "pcs", location: "Main Store - Rack A1", minimum_stock_level: 25, purchase_price: 8, sale_price: 12 },
  { id: 105, name: "Board Markers (بورڈ مارکر)", category: "Stationery", quantity: 150, unit: "pcs", location: "Main Store - Rack A2", minimum_stock_level: 20, purchase_price: 30, sale_price: 40 },
  { id: 106, name: "Dusters (ڈسٹر)", category: "Stationery", quantity: 80, unit: "pcs", location: "Main Store - Rack A2", minimum_stock_level: 15, purchase_price: 40, sale_price: 60 },
  { id: 107, name: "Student Wooden Desks & Chairs (ڈیسک اور کرسیاں)", category: "Furniture", quantity: 45, unit: "sets", location: "Classrooms Block B", minimum_stock_level: 10, purchase_price: 2500, sale_price: 0 },
  { id: 108, name: "Whiteboards (وائٹ بورڈ)", category: "Furniture", quantity: 15, unit: "pcs", location: "Main Store - Section C", minimum_stock_level: 3, purchase_price: 1800, sale_price: 0 },
  { id: 109, name: "Computer Systems (کمپیوٹر)", category: "Electronics", quantity: 30, unit: "pcs", location: "Computer Lab 1", minimum_stock_level: 5, purchase_price: 35000, sale_price: 0 },
  { id: 110, name: "Official Footballs (فٹ بال)", category: "Sports", quantity: 25, unit: "pcs", location: "Sports Room", minimum_stock_level: 5, purchase_price: 600, sale_price: 800 }
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 201, name: "Al-Karam Stationers (الکرم اسٹیشنرز)", contact: "0300-1234567", outstanding_balance: 6450 },
  { id: 202, name: "DEC Furniture House (فرنیچر ہاؤس)", contact: "0321-9876543", outstanding_balance: 15000 },
  { id: 203, name: "Lahore Book Depot (لاہور بک ڈپو)", contact: "0333-5556667", outstanding_balance: 0 },
  { id: 204, name: "Apex Sports Traders (ایپیکس اسپورٹس)", contact: "0312-4443322", outstanding_balance: 3000 }
];

const DEFAULT_LOGS: InventoryLog[] = [
  // Item 101: Pens
  { id: 501, item_id: 101, item_name: "Pens (بال پین)", transaction_type: "IN", quantity: 150, remarks: "Initial Stock Import", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 10).toISOString(), payment_mode: "Cash Purchase", price_per_unit: 15, total_amount: 2250, payment_source: "Cash in Hand" },
  { id: 502, item_id: 101, item_name: "Pens (بال پین)", transaction_type: "OUT", quantity: 20, remarks: "Issued to Primary Block", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 8).toISOString(), payment_mode: "Internal Issue", price_per_unit: 0, total_amount: 0, payment_source: "Internal" },
  { id: 503, item_id: 101, item_name: "Pens (بال پین)", transaction_type: "OUT", quantity: 15, remarks: "Issued to High Section", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 6).toISOString(), payment_mode: "Internal Issue", price_per_unit: 0, total_amount: 0, payment_source: "Internal" },
  { id: 504, item_id: 101, item_name: "Pens (بال پین)", transaction_type: "IN", quantity: 30, remarks: "Restock from supplier", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 4).toISOString(), payment_mode: "Credit Purchase", price_per_unit: 15, total_amount: 450, payment_source: "Al-Karam Stationers (الکرم اسٹیشنرز)" },
  { id: 505, item_id: 101, item_name: "Pens (بال پین)", transaction_type: "OUT", quantity: 25, remarks: "Sold to students", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 2).toISOString(), payment_mode: "Cash Sale", price_per_unit: 20, total_amount: 500, payment_source: "Cash in Hand" },

  // Item 102: Pencils
  { id: 506, item_id: 102, item_name: "Pencils (پنسل)", transaction_type: "IN", quantity: 300, remarks: "Store Opening Stock", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 10).toISOString(), payment_mode: "Cash Purchase", price_per_unit: 8, total_amount: 2400, payment_source: "Bank" },
  { id: 507, item_id: 102, item_name: "Pencils (پنسل)", transaction_type: "OUT", quantity: 50, remarks: "Issued to Playgroup Block", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 7).toISOString(), payment_mode: "Internal Issue", price_per_unit: 0, total_amount: 0, payment_source: "Internal" },
  { id: 508, item_id: 102, item_name: "Pencils (پنسل)", transaction_type: "OUT", quantity: 30, remarks: "Sold to student bookshop", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 5).toISOString(), payment_mode: "Cash Sale", price_per_unit: 10, total_amount: 300, payment_source: "Cash in Hand" },
  { id: 509, item_id: 102, item_name: "Pencils (پنسل)", transaction_type: "IN", quantity: 60, remarks: "Restocked from vendor", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 3).toISOString(), payment_mode: "Credit Purchase", price_per_unit: 8, total_amount: 480, payment_source: "Al-Karam Stationers (الکرم اسٹیشنرز)" },
  { id: 510, item_id: 102, item_name: "Pencils (پنسل)", transaction_type: "OUT", quantity: 30, remarks: "Sold on credit to staff", handled_by: "Admin", date: new Date(Date.now() - 86400000 * 1).toISOString(), payment_mode: "Credit Sale", price_per_unit: 10, total_amount: 300, payment_source: "Staff Credit Ledger" }
];

export function InventoryClient({ initialItems, initialLogs }: { initialItems: InventoryItem[], initialLogs: InventoryLog[] }) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const supabase = createClient();

  // State Definitions
  const [items, setItems] = useState<InventoryItem[]>(() => {
    if (initialItems && initialItems.length > 0) return initialItems;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bs_inventory_items_v5");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_ITEMS;
  });

  const [logs, setLogs] = useState<InventoryLog[]>(() => {
    if (initialLogs && initialLogs.length > 0) return initialLogs;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bs_inventory_logs_v5");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_LOGS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bs_inventory_suppliers_v5");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_SUPPLIERS;
  });

  const [cashInHand, setCashInHand] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bs_inventory_cash_in_hand_v5");
      if (saved) return parseFloat(saved) || 45000;
    }
    return 45000;
  });

  const [bankBalance, setBankBalance] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bs_inventory_bank_balance_v5");
      if (saved) return parseFloat(saved) || 150000;
    }
    return 150000;
  });

  // Active view tabs
  const [activeTab, setActiveTab] = useState<'stock' | 'ledger' | 'suppliers'>('stock');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Edit / Form states
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Stationery");
  const [quantity, setQuantity] = useState("10");
  const [unit, setUnit] = useState("pcs");
  const [location, setLocation] = useState("");
  const [minStock, setMinStock] = useState("5");
  const [purchasePrice, setPurchasePrice] = useState("15");
  const [salePrice, setSalePrice] = useState("20");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Edit Item Modal Form fields
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editMinStock, setEditMinStock] = useState(0);
  const [editPurchasePrice, setEditPurchasePrice] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);

  // Transaction Inputs
  const [selectedItemId, setSelectedItemId] = useState("");
  const [transactionType, setTransactionType] = useState("IN"); // 'IN' or 'OUT'
  const [paymentMode, setPaymentMode] = useState("Cash Purchase"); 
  const [transQuantity, setTransQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const [transLoading, setTransLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic Transaction dropdown states
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [cashSource, setCashSource] = useState<"Cash in Hand" | "Bank">("Cash in Hand");
  const [partyName, setPartyName] = useState(""); // For credit sales (Party/Buyer Name)

  // Supplier Add Modal fields
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierContact, setNewSupplierContact] = useState("");

  // Supplier Payment Modal
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [paySource, setPaySource] = useState<"Cash in Hand" | "Bank">("Cash in Hand");
  const [payRemarks, setPayRemarks] = useState("");

  // Ledger Filter State
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'CASH' | 'CREDIT' | 'INTERNAL'>('ALL');

  // Toggle log history visibility inside cards
  const [expandedLogs, setExpandedLogs] = useState<{ [itemId: number]: boolean }>({});

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bs_inventory_items_v5", JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bs_inventory_logs_v5", JSON.stringify(logs));
    }
  }, [logs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bs_inventory_suppliers_v5", JSON.stringify(suppliers));
    }
  }, [suppliers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bs_inventory_cash_in_hand_v5", cashInHand.toString());
    }
  }, [cashInHand]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bs_inventory_bank_balance_v5", bankBalance.toString());
    }
  }, [bankBalance]);

  // Handle selected item price change on Transaction Form
  useEffect(() => {
    if (selectedItemId) {
      const item = items.find(i => i.id === parseInt(selectedItemId));
      if (item) {
        if (transactionType === 'IN') {
          setUnitPrice(item.purchase_price.toString());
          setPaymentMode("Cash Purchase");
        } else {
          setUnitPrice(item.sale_price.toString());
          setPaymentMode("Internal Issue");
        }
      }
    } else {
      setUnitPrice("");
    }
  }, [selectedItemId, transactionType, items]);

  // Realtime Supabase Sync (optional backup)
  useEffect(() => {
    const itemsChannel = supabase
      .channel('inventory_items_sync_v5')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setItems(prev => {
            if (prev.find(i => i.id === payload.new.id)) return prev;
            return [payload.new as InventoryItem, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setItems(prev => prev.map(i => i.id === payload.new.id ? payload.new as InventoryItem : i));
        } else if (payload.eventType === 'DELETE') {
          setItems(prev => prev.filter(i => i.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
    };
  }, [supabase]);

  // Trigger Notification
  const triggerNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  // Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const newItem: InventoryItem = {
      id: Date.now(),
      name: name.trim(),
      category,
      quantity: parseInt(quantity) || 0,
      unit,
      location: location.trim() || (isUrdu ? "مین اسٹور" : "Main Store"),
      minimum_stock_level: parseInt(minStock) || 5,
      purchase_price: parseFloat(purchasePrice) || 0,
      sale_price: parseFloat(salePrice) || 0
    };

    setItems(prev => [newItem, ...prev]);
    
    // Initial Stock Ledger entry (links to Cash in Hand by default)
    const totalAmt = newItem.quantity * newItem.purchase_price;
    if (newItem.quantity > 0) {
      setCashInHand(prev => prev - totalAmt);
    }

    const initialLog: InventoryLog = {
      id: Date.now() + 1,
      item_id: newItem.id,
      item_name: newItem.name,
      transaction_type: "IN",
      quantity: newItem.quantity,
      remarks: isUrdu ? "ابتدائی خریداری اور اسٹور انٹری" : "Initial stock purchase entry",
      handled_by: "Admin",
      date: new Date().toISOString(),
      payment_mode: "Cash Purchase",
      price_per_unit: newItem.purchase_price,
      total_amount: totalAmt,
      payment_source: "Cash in Hand"
    };
    setLogs(prev => [initialLog, ...prev]);

    setName("");
    setQuantity("10");
    setLocation("");
    setMinStock("5");
    setPurchasePrice("15");
    setSalePrice("20");
    triggerNotification(isUrdu ? "نیا پروڈکٹ اور کیش کھاتہ کامیابی سے اپ ڈیٹ ہو گیا ہے!" : "Product registered and Cash in Hand adjusted successfully!");
    setLoading(false);
  };

  // Quick Quantity Plus / Minus Adjustment
  const handleQuickAdjust = async (itemId: number, type: 'IN' | 'OUT') => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (type === 'OUT' && item.quantity <= 0) {
      alert(isUrdu ? "مقدار صفر سے کم نہیں ہوسکتی!" : "Available stock is already zero!");
      return;
    }

    const diff = 1;
    const newQty = type === 'IN' ? item.quantity + diff : item.quantity - diff;
    const unitPrice = type === 'IN' ? item.purchase_price : item.sale_price;
    const totalAmt = diff * unitPrice;

    // Adjust Cash in Hand
    if (type === 'IN') {
      setCashInHand(prev => prev - totalAmt);
    } else {
      // internal issue by default has 0 total amount, quick adjust defaults to internal issue
    }

    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));

    const newLog: InventoryLog = {
      id: Date.now(),
      item_id: itemId,
      item_name: item.name,
      transaction_type: type,
      quantity: diff,
      remarks: type === 'IN' 
        ? (isUrdu ? "فوری اسٹاک ان (+1)" : "Quick stock IN (+1)")
        : (isUrdu ? "فوری اسٹاک آؤٹ (-1)" : "Quick stock OUT (-1)"),
      handled_by: "Admin",
      date: new Date().toISOString(),
      payment_mode: type === 'IN' ? "Cash Purchase" : "Internal Issue",
      price_per_unit: type === 'IN' ? unitPrice : 0,
      total_amount: type === 'IN' ? totalAmt : 0,
      payment_source: type === 'IN' ? "Cash in Hand" : "Internal"
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Edit Item Modal handlers
  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditUnit(item.unit);
    setEditLocation(item.location);
    setEditMinStock(item.minimum_stock_level);
    setEditPurchasePrice(item.purchase_price);
    setEditSalePrice(item.sale_price);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = {
      ...editingItem,
      name: editName.trim(),
      category: editCategory,
      unit: editUnit,
      location: editLocation.trim(),
      minimum_stock_level: editMinStock,
      purchase_price: editPurchasePrice,
      sale_price: editSalePrice
    };

    setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
    setEditingItem(null);
    triggerNotification(isUrdu ? "پروڈکٹ کی تفصیلات اور قیمتیں کامیابی سے اپ ڈیٹ ہو گئیں!" : "Product details and pricing updated successfully!");
  };

  // Delete Item
  const handleDeleteItem = async (id: number) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی اس ائٹم کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this item?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    setLogs(prev => prev.filter(l => l.item_id !== id));
  };

  // Reset default sample seed
  const handleResetDefault = () => {
    if (confirm(isUrdu ? "تمام ڈیٹا ری سیٹ کر کے 10 ڈیفالٹ کارڈز، سپلائرز اور مالی کھاتہ لوڈ کریں؟" : "Reset inventory to load default products, suppliers and logs?")) {
      setItems(DEFAULT_ITEMS);
      setLogs(DEFAULT_LOGS);
      setSuppliers(DEFAULT_SUPPLIERS);
      setCashInHand(45000);
      setBankBalance(150000);
      if (typeof window !== "undefined") {
        localStorage.setItem("bs_inventory_items_v5", JSON.stringify(DEFAULT_ITEMS));
        localStorage.setItem("bs_inventory_logs_v5", JSON.stringify(DEFAULT_LOGS));
        localStorage.setItem("bs_inventory_suppliers_v5", JSON.stringify(DEFAULT_SUPPLIERS));
        localStorage.setItem("bs_inventory_cash_in_hand_v5", "45000");
        localStorage.setItem("bs_inventory_bank_balance_v5", "150000");
      }
      triggerNotification("Ledger, Cash Accounts and Suppliers successfully reset!");
    }
  };

  // Log Custom transaction IN / OUT from Form
  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !transQuantity) return;
    setTransLoading(true);

    const itemId = parseInt(selectedItemId);
    const qty = parseInt(transQuantity);
    const price = parseFloat(unitPrice) || 0;
    const item = items.find(i => i.id === itemId);

    if (!item) {
      setTransLoading(false);
      return;
    }

    if (transactionType === 'OUT' && item.quantity < qty) {
      alert(isUrdu ? "اسٹاک میں اتنی مقدار موجود نہیں ہے!" : "Insufficient stock available!");
      setTransLoading(false);
      return;
    }

    const newQty = transactionType === 'IN' ? item.quantity + qty : item.quantity - qty;
    const totalAmt = qty * price;

    // UPDATE BALANCES BASED ON THE PAYMENT MODE
    let sourceText = "Internal";

    if (transactionType === 'IN') {
      if (paymentMode === 'Cash Purchase') {
        sourceText = cashSource;
        if (cashSource === 'Cash in Hand') {
          setCashInHand(prev => prev - totalAmt);
        } else {
          setBankBalance(prev => prev - totalAmt);
        }
      } else if (paymentMode === 'Credit Purchase') {
        // Find supplier and add to outstanding balance
        const supplier = suppliers.find(s => s.id === parseInt(selectedSupplierId));
        if (supplier) {
          sourceText = supplier.name;
          setSuppliers(prev => prev.map(s => s.id === supplier.id ? { ...s, outstanding_balance: s.outstanding_balance + totalAmt } : s));
        } else {
          sourceText = "Supplier";
        }
      } else {
        sourceText = "Donation";
      }
    } else {
      // OUT (Sale/Issue)
      if (paymentMode === 'Cash Sale') {
        sourceText = cashSource;
        if (cashSource === 'Cash in Hand') {
          setCashInHand(prev => prev + totalAmt);
        } else {
          setBankBalance(prev => prev + totalAmt);
        }
      } else if (paymentMode === 'Credit Sale') {
        sourceText = partyName.trim() || (isUrdu ? "ادھار خریدار" : "Credit Customer");
      } else {
        sourceText = "Internal";
      }
    }

    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));

    const newLog: InventoryLog = {
      id: Date.now(),
      item_id: itemId,
      item_name: item.name,
      transaction_type: transactionType,
      quantity: qty,
      remarks: remarks.trim() || (transactionType === 'IN' ? 'Stock Restocked' : 'Stock Issued'),
      handled_by: 'Admin',
      date: new Date().toISOString(),
      payment_mode: paymentMode,
      price_per_unit: price,
      total_amount: totalAmt,
      payment_source: sourceText
    };

    setLogs(prev => [newLog, ...prev]);
    setTransQuantity("");
    setRemarks("");
    setPartyName("");
    triggerNotification(isUrdu ? "کھاتہ ٹرانزیکشن اور اکاؤنٹ بیلنس کامیابی سے اپ ڈیٹ ہو گئے!" : "Ledger transaction recorded and account balance adjusted!");
    setTransLoading(false);
  };

  // Add Supplier Handler
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    const newSup: Supplier = {
      id: Date.now(),
      name: newSupplierName.trim(),
      contact: newSupplierContact.trim() || "-",
      outstanding_balance: 0
    };

    setSuppliers(prev => [newSup, ...prev]);
    setNewSupplierName("");
    setNewSupplierContact("");
    triggerNotification(isUrdu ? "نیا سپلائر کامیابی سے شامل ہو گیا!" : "New supplier added to registry!");
  };

  // Pay Supplier Outstanding Balance
  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || !payAmount) return;

    const amountToPay = parseFloat(payAmount);
    if (amountToPay <= 0) return;

    // Deduct from supplier balance
    setSuppliers(prev => prev.map(s => s.id === payingSupplier.id ? { ...s, outstanding_balance: Math.max(0, s.outstanding_balance - amountToPay) } : s));

    // Deduct from cash/bank source
    if (paySource === 'Cash in Hand') {
      setCashInHand(prev => prev - amountToPay);
    } else {
      setBankBalance(prev => prev - amountToPay);
    }

    // Log the cash payment in General Ledger
    const paymentLog: InventoryLog = {
      id: Date.now(),
      item_id: 0,
      item_name: isUrdu ? `ادائیگی برائے ${payingSupplier.name}` : `Payment to ${payingSupplier.name}`,
      transaction_type: "OUTFLOW", // custom outflow type
      quantity: 1,
      remarks: payRemarks.trim() || `Supplier outstanding payment`,
      handled_by: "Admin",
      date: new Date().toISOString(),
      payment_mode: "Supplier Payment",
      price_per_unit: amountToPay,
      total_amount: amountToPay,
      payment_source: paySource
    };

    setLogs(prev => [paymentLog, ...prev]);
    setPayingSupplier(null);
    setPayAmount("");
    setPayRemarks("");
    triggerNotification(isUrdu ? "سپلائر کو ادائیگی کامیابی سے مکمل اور کیش بک میں درج کر دی گئی!" : "Supplier payment processed and logged successfully!");
  };

  const toggleExpandedLogs = (itemId: number) => {
    setExpandedLogs(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Printing Layout
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Share - Item Specific
  const shareItemOnWhatsApp = (item: InventoryItem) => {
    const last3Logs = logs.filter(l => l.item_id === item.id).slice(0, 3);
    const logsText = last3Logs.length > 0 
      ? last3Logs.map(l => `  - [${l.transaction_type}] ${l.quantity} ${item.unit} (${l.payment_mode}) - ${new Date(l.date).toLocaleDateString()}`).join('\n')
      : "  No transaction logs found.";

    const text = `*📦 BRIGHT SCHOOL INVENTORY STATUS*\n` +
      `------------------------------------------\n` +
      `*Item Name:* ${item.name}\n` +
      `*Category:* ${item.category}\n` +
      `*Current Stock:* ${item.quantity} ${item.unit}\n` +
      `*Cost Price:* Rs. ${item.purchase_price} | *Sale Price:* Rs. ${item.sale_price}\n` +
      `*Location:* ${item.location || 'Main Store'}\n` +
      `*Status:* ${item.quantity <= item.minimum_stock_level ? '⚠️ LOW STOCK (خریداری کریں)' : '✅ SAFE (محفوظ)'}\n\n` +
      `*Last 3 Logs:*\n${logsText}\n` +
      `------------------------------------------\n` +
      `_Report generated on: ${new Date().toLocaleDateString()}_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // WhatsApp Share - Ledger Audit Report
  const shareLedgerOnWhatsApp = () => {
    const text = `*📊 BRIGHT SCHOOL FINANCIAL INVENTORY LEDGER*\n` +
      `------------------------------------------\n` +
      `*Date:* ${new Date().toLocaleDateString()}\n` +
      `*Total Stock Assets Value:* Rs. ${totalStockValue.toLocaleString()}\n` +
      `*Cash in Hand Balance:* Rs. ${cashInHand.toLocaleString()}\n` +
      `*Bank Account Balance:* Rs. ${bankBalance.toLocaleString()}\n` +
      `*Total Outstanding Supplier Payables:* Rs. ${totalPayableOutstanding.toLocaleString()}\n` +
      `*Outstanding Credit Receivables:* Rs. ${accountsReceivable.toLocaleString()}\n` +
      `------------------------------------------\n` +
      `_Audit Sync Status: Verified & Live_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // WhatsApp Share - Full Inventory Report
  const shareFullReportOnWhatsApp = () => {
    const itemsText = items.map(i => `• ${i.name}: ${i.quantity} ${i.unit} (Val: Rs. ${(i.quantity * i.purchase_price).toLocaleString()})`).join('\n');
    const text = `*📊 BRIGHT SCHOOL FULL INVENTORY REPORT*\n` +
      `------------------------------------------\n` +
      `*Date:* ${new Date().toLocaleDateString()}\n` +
      `*Total Registered Items:* ${items.length}\n` +
      `*Low Stock Alerts:* ${items.filter(i => i.quantity <= i.minimum_stock_level).length}\n` +
      `*Total Inventory Asset Valuation:* Rs. ${totalStockValue.toLocaleString()}\n\n` +
      `*Current Stock Level:*\n${itemsText}\n` +
      `------------------------------------------\n` +
      `_System Sync Status: Active Live_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // LEDGER CALCULATION ENGINE
  const totalStockValue = items.reduce((sum, item) => sum + (item.quantity * item.purchase_price), 0);
  const totalPayableOutstanding = suppliers.reduce((sum, s) => sum + s.outstanding_balance, 0);

  // Total credit sales (outstanding receivables)
  const accountsReceivable = logs
    .filter(l => l.transaction_type === 'OUT' && l.payment_mode === 'Credit Sale')
    .reduce((sum, log) => sum + log.total_amount, 0);

  // Total sales revenue from both Cash and Credit sales
  const totalSalesRevenue = logs
    .filter(l => l.transaction_type === 'OUT' && (l.payment_mode === 'Cash Sale' || l.payment_mode === 'Credit Sale'))
    .reduce((sum, log) => sum + log.total_amount, 0);

  // Cost of Goods Sold (COGS)
  const totalCostOfGoodsSold = logs
    .filter(l => l.transaction_type === 'OUT' && (l.payment_mode === 'Cash Sale' || l.payment_mode === 'Credit Sale'))
    .reduce((sum, log) => {
      const item = items.find(i => i.id === log.item_id);
      const costPrice = item ? item.purchase_price : log.price_per_unit * 0.75;
      return sum + (log.quantity * costPrice);
    }, 0);

  const totalProfitLoss = totalSalesRevenue - totalCostOfGoodsSold;

  // Filter items matching Search
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter logs for Double-Entry Ledger Book
  const filteredLogs = logs.filter(l => {
    if (ledgerFilter === 'ALL') return true;
    if (ledgerFilter === 'CASH') return l.payment_mode.toLowerCase().includes('cash') || l.payment_mode === 'Supplier Payment';
    if (ledgerFilter === 'CREDIT') return l.payment_mode.toLowerCase().includes('credit');
    if (ledgerFilter === 'INTERNAL') return l.payment_mode === 'Internal Issue';
    return true;
  });

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 print:p-0 bg-background text-foreground">
      
      {/* HEADER SECTION */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6 print:hidden">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Avatar className="h-9 w-9 border border-border shadow-sm">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* PRINT-ONLY HEADER BANNER */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-5 mb-8 text-center">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">Bright School Management System</h1>
        <p className="text-sm font-bold text-slate-600 mt-1">Official Store Room & Ledger Audit Report</p>
        <div className="flex justify-between text-xs font-bold text-slate-500 mt-4 px-2">
          <span>Date: {new Date().toLocaleDateString()}</span>
          <span>Time: {new Date().toLocaleTimeString()}</span>
          <span>Report Mode: {activeTab === 'stock' ? 'Inventory Directory' : 'Double-Entry Financial Ledger'}</span>
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 print:p-0">
        
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border print:hidden">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-foreground">
              <Package className="h-9 w-9 text-rose-600 dark:text-rose-400" />
              {isUrdu ? 'پریمیم انونٹری اور جنرل لیجر' : 'Premium Store Room & Ledger'}
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              {isUrdu ? 'کیش و بینک والٹ، سپلائرز کھاتہ پے بلز، اور ان پٹ / آؤٹ پٹ انکم سٹیٹمنٹ' : 'Cash & Bank wallets, supplier payables registry, and input/output income statement.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handlePrint} className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs flex items-center gap-1.5 h-9">
              <Printer className="w-3.5 h-3.5" />
              {isUrdu ? 'پرنٹ / پی ڈی ایف حاصل کریں' : 'Print Statement (PDF)'}
            </Button>
            <Button 
              onClick={activeTab === 'stock' ? shareFullReportOnWhatsApp : shareLedgerOnWhatsApp} 
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 h-9"
            >
              <Share2 className="w-3.5 h-3.5" />
              {isUrdu ? 'واٹس ایپ پر بھیجیں' : 'Share on WhatsApp'}
            </Button>
            <Button onClick={handleResetDefault} variant="outline" size="sm" className="rounded-xl border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1 h-9">
              <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
              {isUrdu ? 'ری سیٹ کھاتہ' : 'Reset Ledger'}
            </Button>
          </div>
        </div>

        {/* SUCCESS NOTIFICATION */}
        {successMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm font-bold animate-in fade-in duration-300 print:hidden">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* TOP LEVEL FINANCIAL STATS (WALLETS AND PAYABLES) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">{isUrdu ? "کل اسٹاک مالیت (Store Assets)" : "Store Assets Value"}</p>
                <h3 className="text-2xl font-black text-foreground">Rs. {totalStockValue.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">{isUrdu ? "کیش ان ہینڈ (Cash in Hand)" : "Cash in Hand"}</p>
                <h3 className="text-2xl font-black text-emerald-600">Rs. {cashInHand.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">{isUrdu ? "بینک اکاؤنٹ بیلنس (Bank)" : "Bank Balance"}</p>
                <h3 className="text-2xl font-black text-blue-600">Rs. {bankBalance.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">{isUrdu ? "سپلائر ادھار پے بلز (Payables)" : "Supplier Payables"}</p>
                <h3 className={`text-2xl font-black ${totalPayableOutstanding > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                  Rs. {totalPayableOutstanding.toLocaleString()}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NAVIGATION TABS BETWEEN STOCK, LEDGER AND SUPPLIERS */}
        <div className="flex space-x-2 bg-muted p-1.5 rounded-2xl w-fit border border-border/50 print:hidden">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'stock' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isUrdu ? "انونٹری اور اسٹاک (Stock)" : "Store Room Stock"}
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'ledger' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isUrdu ? "جنرل لیجر کھاتہ (Ledger)" : "General Ledger Book"}
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'suppliers' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isUrdu ? "سپلائرز کھاتہ پے بلز (Suppliers)" : "Suppliers & Payables"}
          </button>
        </div>

        {/* TAB 1: INVENTORY STOCK VIEW */}
        {activeTab === 'stock' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* ADD PRODUCT / TRANSACTION GRID FORMS */}
            <div className="grid gap-8 lg:grid-cols-3 print:hidden">
              
              {/* 1. ADD NEW PRODUCT FORM */}
              <Card className="lg:col-span-1 border-rose-200/80 dark:border-rose-900/40 shadow-xl bg-card rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/20 border-b border-rose-100 dark:border-rose-900/40 p-6">
                  <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900 dark:text-rose-100">
                    <Plus className="w-4 h-4 text-rose-600" />
                    {isUrdu ? 'نیا پروڈکٹ شامل کریں' : 'Add New Product'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'سامان / آئٹم کا نام *' : 'Item Name *'}</Label>
                      <Input required placeholder={isUrdu ? 'مثال: بال پین (بلیک)' : 'e.g. Pens (Black)'} value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-10" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'کیٹیگری' : 'Category'}</Label>
                        <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold" value={category} onChange={e => setCategory(e.target.value)}>
                          <option>Stationery</option>
                          <option>Furniture</option>
                          <option>Electronics</option>
                          <option>Lab Equipment</option>
                          <option>Sports</option>
                          <option>Library</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'یونٹ (Unit)' : 'Unit'}</Label>
                        <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold" value={unit} onChange={e => setUnit(e.target.value)}>
                          <option>pcs</option>
                          <option>boxes</option>
                          <option>kg</option>
                          <option>sets</option>
                          <option>liters</option>
                          <option>reams</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'ابتدائی اسٹاک *' : 'Initial Stock *'}</Label>
                        <Input type="number" min="0" required value={quantity} onChange={e => setQuantity(e.target.value)} className="rounded-xl h-10 font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'انتباہی حد' : 'Min Alert'}</Label>
                        <Input type="number" min="1" required value={minStock} onChange={e => setMinStock(e.target.value)} className="rounded-xl h-10 font-bold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'خریداری قیمت *' : 'Purchase Price *'}</Label>
                        <Input type="number" min="0" required value={purchasePrice} onChange={e => {
                          setPurchasePrice(e.target.value);
                          const num = parseFloat(e.target.value);
                          if (!isNaN(num)) {
                            setSalePrice(Math.round(num * 1.3).toString()); // Auto calculate 30% profit markup
                          }
                        }} className="rounded-xl h-10 font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'فروخت قیمت *' : 'Sale Price *'}</Label>
                        <Input type="number" min="0" required value={salePrice} onChange={e => setSalePrice(e.target.value)} className="rounded-xl h-10 font-bold" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'اسٹور روم میں مقام' : 'Location'}</Label>
                      <Input placeholder={isUrdu ? 'مثال: الماری 2، شیلف 3' : 'e.g. Rack A3'} value={location} onChange={e => setLocation(e.target.value)} className="rounded-xl h-10" />
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold shadow-md mt-2" disabled={loading || !name}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} 
                      {isUrdu ? 'سٹور میں شامل کریں' : 'Add Item to Store'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* 2. TRANSACTION LOG FORM */}
              <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-xl bg-card rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/40 border-b border-border p-6">
                  <CardTitle className="text-base font-black flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-indigo-600" />
                    {isUrdu ? 'اسٹاک ٹرانزیکشن کھاتہ (آمد و رفت)' : 'Stock IN / OUT Transaction'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleTransaction} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'پروڈکٹ منتخب کریں *' : 'Select Product *'}</Label>
                        <select required className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold" value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)}>
                          <option value="">{isUrdu ? '-- پروڈکٹ کا انتخاب کریں --' : '-- Select Product --'}</option>
                          {items.map(i => (
                            <option key={i.id} value={i.id}>{i.name} (Stock: {i.quantity} {i.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'ٹرانزیکشن کی قسم' : 'Transaction Type'}</Label>
                        <div className="flex gap-2">
                          <Button type="button" variant={transactionType === 'IN' ? 'default' : 'outline'} className={`flex-1 h-10 rounded-xl font-bold ${transactionType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`} onClick={() => setTransactionType('IN')}>
                            <ArrowDownRight className="mr-1.5 h-4 w-4" /> {isUrdu ? 'خریداری / آمد (IN)' : 'Restock IN'}
                          </Button>
                          <Button type="button" variant={transactionType === 'OUT' ? 'default' : 'outline'} className={`flex-1 h-10 rounded-xl font-bold ${transactionType === 'OUT' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`} onClick={() => setTransactionType('OUT')}>
                            <ArrowUpRight className="mr-1.5 h-4 w-4" /> {isUrdu ? 'فروخت / اخراج (OUT)' : 'Issue OUT'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'مقدار (Quantity) *' : 'Quantity *'}</Label>
                        <Input type="number" required placeholder="10" min="1" value={transQuantity} onChange={e => setTransQuantity(e.target.value)} className="rounded-xl h-10 font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'قیمت فی یونٹ (Rs.) *' : 'Price per Unit *'}</Label>
                        <Input type="number" required value={unitPrice} onChange={e => setUnitPrice(e.target.value)} className="rounded-xl h-10 font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'ادائیگی کا طریقہ (Mode)' : 'Payment Mode'}</Label>
                        <select 
                          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold" 
                          value={paymentMode} 
                          onChange={e => setPaymentMode(e.target.value)}
                        >
                          {transactionType === 'IN' ? (
                            <>
                              <option value="Cash Purchase">{isUrdu ? 'نقد خریداری (Cash)' : 'Cash Purchase'}</option>
                              <option value="Credit Purchase">{isUrdu ? 'ادھار خریداری (Credit)' : 'Credit Purchase'}</option>
                              <option value="Donation">{isUrdu ? 'عطیہ (Donation)' : 'Donation / Free'}</option>
                            </>
                          ) : (
                            <>
                              <option value="Internal Issue">{isUrdu ? 'اندرونی استعمال (Free)' : 'Internal Issue (Free)'}</option>
                              <option value="Cash Sale">{isUrdu ? 'نقد فروخت (Cash Sale)' : 'Cash Sale'}</option>
                              <option value="Credit Sale">{isUrdu ? 'ادھار فروخت (Credit Sale)' : 'Credit Sale'}</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* DYNAMIC SUB FIELDS FOR PAYMENT MODES */}
                    <div className="grid md:grid-cols-2 gap-4 border-t pt-3 border-border/50">
                      {/* Cash Purchases or Cash Sales */}
                      {paymentMode.includes("Cash") && (
                        <div className="space-y-1.5 md:col-span-2">
                          <Label className="font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5" />
                            {isUrdu ? 'ادائیگی کا ذریعہ (Source Wallet) *' : 'Payment Source / Destination Wallet *'}
                          </Label>
                          <select 
                            className="flex h-10 w-full rounded-xl border border-emerald-300 dark:border-emerald-800 bg-background px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200"
                            value={cashSource}
                            onChange={e => setCashSource(e.target.value as any)}
                          >
                            <option value="Cash in Hand">{isUrdu ? `کیش ان ہینڈ (موجودہ: Rs. ${cashInHand})` : `Cash in Hand (Bal: Rs. ${cashInHand})`}</option>
                            <option value="Bank">{isUrdu ? `بینک اکاؤنٹ (موجودہ: Rs. ${bankBalance})` : `Bank Account (Bal: Rs. ${bankBalance})`}</option>
                          </select>
                        </div>
                      )}

                      {/* Credit Purchases -> Select Supplier */}
                      {paymentMode === "Credit Purchase" && (
                        <div className="space-y-1.5 md:col-span-2">
                          <Label className="font-bold text-xs uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {isUrdu ? 'سپلائر / پارٹی کا نام منتخب کریں *' : 'Select Supplier / Party Name *'}
                          </Label>
                          <select 
                            required
                            className="flex h-10 w-full rounded-xl border border-amber-300 dark:border-amber-800 bg-background px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-200"
                            value={selectedSupplierId}
                            onChange={e => setSelectedSupplierId(e.target.value)}
                          >
                            <option value="">{isUrdu ? '-- سپلائر منتخب کریں --' : '-- Select Supplier --'}</option>
                            {suppliers.map(s => (
                              <option key={s.id} value={s.id}>{s.name} (Payable: Rs. {s.outstanding_balance})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Credit Sales -> Enter Customer/Buyer Name */}
                      {paymentMode === "Credit Sale" && (
                        <div className="space-y-1.5 md:col-span-2">
                          <Label className="font-bold text-xs uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {isUrdu ? 'خریدار / پارٹی کا نام درج کریں *' : 'Enter Customer / Party Name *'}
                          </Label>
                          <Input 
                            required
                            placeholder={isUrdu ? 'مثال: خرم شہزاد (والدین / کلاس 4)' : 'e.g. Khurram Shahzad (Parent)'}
                            value={partyName}
                            onChange={e => setPartyName(e.target.value)}
                            className="h-10 rounded-xl border-blue-300 dark:border-blue-800 bg-background text-blue-800 dark:text-blue-200 text-xs font-bold"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">{isUrdu ? 'تفصیل / وجہ (Remarks)' : 'Remarks'}</Label>
                      <Input placeholder={isUrdu ? 'تفصیل لکھیں...' : 'Remarks/Reason'} value={remarks} onChange={e => setRemarks(e.target.value)} className="rounded-xl h-10" />
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold hover:opacity-90 transition mt-2" disabled={transLoading || !selectedItemId || !transQuantity}>
                      {transLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isUrdu ? 'ٹرانزیکشن اور کھاتہ ریکارڈ کریں' : 'Log Transaction & Adjust Balances')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* SEARCH & DISPLAY CONTROL PANEL */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-border print:hidden">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-foreground">
                  {isUrdu ? 'سٹور روم کا موجودہ اسٹاک' : 'Current Store Room Record'}
                </h2>
                <Badge variant="secondary" className="px-2 py-0.5 rounded-md font-bold text-xs">
                  {filteredItems.length} {isUrdu ? 'آئٹمز' : 'Items'}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={isUrdu ? 'پروڈکٹ تلاش کریں...' : 'Search items...'}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl h-10 border-border bg-card"
                  />
                </div>
                <div className="bg-muted p-1 rounded-xl flex border w-fit mx-auto sm:mx-0">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                  >
                    {isUrdu ? 'کارڈز (Cards)' : 'Cards View'}
                  </button>
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                  >
                    {isUrdu ? 'ٹیبل (Table)' : 'Table View'}
                  </button>
                </div>
              </div>
            </div>

            {/* VIEW A: CARDS GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed rounded-3xl bg-card">
                    <Search className="w-12 h-12 opacity-20 mx-auto mb-3" />
                    <p className="font-bold text-base">{isUrdu ? 'کوئی آئٹم نہیں ملا۔' : 'No items found.'}</p>
                  </div>
                ) : (
                  filteredItems.map(item => {
                    const isLow = item.quantity <= item.minimum_stock_level;
                    const itemLogs = logs.filter(l => l.item_id === item.id);
                    const lastLog = itemLogs[0];
                    const maxRange = Math.max(item.minimum_stock_level * 3, 50);
                    const percentSafe = Math.min(Math.round((item.quantity / maxRange) * 100), 100);

                    return (
                      <Card 
                        key={item.id} 
                        className={`border shadow-md bg-card overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${
                          isLow 
                            ? 'border-amber-400/40 bg-amber-500/[0.02] dark:bg-amber-950/[0.02]' 
                            : 'border-border/80 hover:border-rose-500/30'
                        }`}
                      >
                        <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/40">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold py-0.5 rounded-md mb-1 bg-background text-rose-600 border-rose-200">
                                {item.category}
                              </Badge>
                              <CardTitle className="text-base font-black text-foreground truncate max-w-[200px]" title={item.name}>
                                {item.name}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-1 print:hidden">
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-700" onClick={() => openEditModal(item)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-700" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase">{isUrdu ? 'دستیاب مقدار' : 'Available Stock'}</p>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className={`text-3xl font-black ${
                                  isLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {item.quantity}
                                </span>
                                <span className="text-xs font-bold text-muted-foreground">{item.unit}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              {isLow ? (
                                <Badge className="bg-amber-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Low Stock
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                  Safe Stock
                                </Badge>
                              )}
                              <p className="text-[9px] text-muted-foreground font-semibold mt-1">
                                {isUrdu ? `خرید: Rs. ${item.purchase_price} | فروخت: Rs. ${item.sale_price}` : `Cost: Rs. ${item.purchase_price} | Sale: Rs. ${item.sale_price}`}
                              </p>
                              {item.purchase_price > 0 && item.sale_price > item.purchase_price && (
                                <div className="text-right">
                                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 border-none text-[8px] font-bold py-0 px-1 rounded-sm w-fit mt-0.5">
                                    {isUrdu ? `مارجن: ${Math.round(((item.sale_price - item.purchase_price) / item.purchase_price) * 100)}%` : `Margin: ${Math.round(((item.sale_price - item.purchase_price) / item.purchase_price) * 100)}%`}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="w-full bg-muted dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${isLow ? 'bg-amber-500' : 'bg-emerald-600'}`} style={{ width: `${percentSafe}%` }} />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-muted/30 p-2.5 rounded-xl border border-border/40">
                            <div>
                              <span className="text-muted-foreground block">{isUrdu ? 'مقام (Location)' : 'Storage Location'}:</span>
                              <span className="font-bold text-foreground truncate block">{item.location || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">{isUrdu ? 'آخری تبدیلی' : 'Last Transaction'}:</span>
                              <span className="font-bold text-foreground block">
                                {lastLog ? new Date(lastLog.date).toLocaleDateString() : '-'}
                              </span>
                            </div>
                          </div>

                          {/* QUICK STOCK ADJUSTMENT */}
                          <div className="pt-2 flex items-center justify-between gap-3 border-t border-border/40 print:hidden">
                            <div className="flex items-center gap-1 bg-muted dark:bg-slate-800/80 p-0.5 rounded-xl border">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50"
                                onClick={() => handleQuickAdjust(item.id, 'OUT')}
                                title="Stock OUT (-1)"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-xs font-black text-foreground px-2">{isUrdu ? "ایڈجسٹ" : "Adjust"}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleQuickAdjust(item.id, 'IN')}
                                title="Stock IN (+1)"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-bold rounded-xl h-8 px-2.5"
                              onClick={() => shareItemOnWhatsApp(item)}
                            >
                              <Share2 className="w-3.5 h-3.5 mr-1" />
                              {isUrdu ? 'شیئر' : 'Share'}
                            </Button>
                          </div>

                          {/* AUDIT LOG HISTORY COLLAPSIBLE */}
                          <div className="pt-1 print:hidden">
                            <button 
                              type="button"
                              onClick={() => toggleExpandedLogs(item.id)}
                              className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1 focus:outline-none"
                            >
                              {expandedLogs[item.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {isUrdu ? (expandedLogs[item.id] ? "آڈٹ کھاتہ چھپائیں" : `مالیاتی لاگ دیکھیں (${itemLogs.length})`) : (expandedLogs[item.id] ? "Hide logs" : `View logs (${itemLogs.length})`)}
                            </button>

                            {expandedLogs[item.id] && (
                              <div className="mt-3 space-y-1.5 border-t pt-3 max-h-[150px] overflow-y-auto pr-1">
                                {itemLogs.length === 0 ? (
                                  <p className="text-[10px] text-muted-foreground">No logs found.</p>
                                ) : (
                                  itemLogs.slice(0, 5).map(l => (
                                    <div key={l.id} className="flex flex-col text-[10px] bg-muted/20 border p-2 rounded-lg gap-1">
                                      <div className="flex items-center justify-between">
                                        <Badge className={`text-[8px] px-1 py-0 ${l.transaction_type === 'IN' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                                          {l.transaction_type}
                                        </Badge>
                                        <span className="font-bold">{l.payment_mode}</span>
                                        <span className="text-muted-foreground">{new Date(l.date).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex justify-between font-semibold">
                                        <span>Qty: {l.quantity} {item.unit} x {l.price_per_unit}</span>
                                        <span className={l.transaction_type === 'IN' ? 'text-rose-600' : 'text-emerald-600'}>
                                          {l.transaction_type === 'IN' ? '-' : '+'} Rs. {l.total_amount}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-muted-foreground italic">"{l.remarks}"</p>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* VIEW B: DIRECTORY TABLE VIEW */}
            {viewMode === 'table' && (
              <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden print:shadow-none print:border-none">
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="pl-6 font-bold">{isUrdu ? 'سامان کا نام' : 'Product Name'}</TableHead>
                        <TableHead className="font-bold">{isUrdu ? 'کیٹیگری' : 'Category'}</TableHead>
                        <TableHead className="font-bold">{isUrdu ? 'مقام (Location)' : 'Location'}</TableHead>
                        <TableHead className="font-bold">{isUrdu ? 'خرید / فروخت قیمت' : 'Cost / Sale Price'}</TableHead>
                        <TableHead className="font-bold">{isUrdu ? 'دستیاب مقدار' : 'Available Stock'}</TableHead>
                        <TableHead className="text-right pr-6 font-bold print:hidden">{isUrdu ? 'ایکشن' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-semibold">No items found.</TableCell></TableRow>
                      ) : filteredItems.map(item => {
                        const isLow = item.quantity <= item.minimum_stock_level;
                        return (
                          <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="font-bold pl-6 text-foreground">{item.name}</TableCell>
                            <TableCell><Badge variant="outline" className="rounded-lg font-semibold">{item.category}</Badge></TableCell>
                            <TableCell className="text-muted-foreground text-xs font-semibold">{item.location || '-'}</TableCell>
                            <TableCell className="font-bold text-xs">Rs. {item.purchase_price} / Rs. {item.sale_price}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`font-black text-base ${isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {item.quantity}
                                </span>
                                <span className="text-xs text-muted-foreground">{item.unit}</span>
                                {isLow && <Badge variant="destructive" className="text-[10px] py-0">Low</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6 print:hidden">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 rounded-lg" onClick={() => openEditModal(item)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 rounded-lg" onClick={() => handleDeleteItem(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: FINANCIAL LEDGER BOOK */}
        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Profit & Loss metrics cards */}
            <div className="grid gap-4 md:grid-cols-3 print:hidden">
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{isUrdu ? "فروخت سے کل آمدنی (Revenue)" : "Sales Revenue"}</p>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">Rs. {totalSalesRevenue.toLocaleString()}</h4>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-600 rounded-lg py-1 px-2 font-bold text-[10px]">Income</Badge>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{isUrdu ? "فروخت شدہ مال کی لاگت (COGS)" : "Cost of Goods Sold"}</p>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">Rs. {totalCostOfGoodsSold.toLocaleString()}</h4>
                  </div>
                  <Badge className="bg-rose-500/10 text-rose-600 rounded-lg py-1 px-2 font-bold text-[10px]">Expenses</Badge>
                </CardContent>
              </Card>
              <Card className={`bg-card border-border ${totalProfitLoss >= 0 ? 'bg-emerald-500/[0.02]' : 'bg-rose-500/[0.02]'}`}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{isUrdu ? "نیٹ منافع / نقصان (Profit / Loss)" : "Net Profit / Loss"}</p>
                    <h4 className={`text-lg font-black ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Rs. {totalProfitLoss.toLocaleString()}
                    </h4>
                  </div>
                  <Badge className={`rounded-lg py-1 px-2 font-bold text-[10px] ${
                    totalProfitLoss >= 0 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                  }`}>
                    {totalProfitLoss >= 0 ? (isUrdu ? 'منافع' : 'Net Profit') : (isUrdu ? 'نقصان' : 'Net Loss')}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* LEDGER FILTERS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-border print:hidden">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-extrabold text-foreground">
                  {isUrdu ? 'انونٹری کھاتہ لیجر بک' : 'Double-Entry General Ledger Book'}
                </h2>
              </div>
              <div className="bg-muted p-1 rounded-xl flex border w-fit mx-auto sm:mx-0">
                <button 
                  onClick={() => setLedgerFilter('ALL')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${ledgerFilter === 'ALL' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                >
                  {isUrdu ? 'تمام لاگز' : 'All Transactions'}
                </button>
                <button 
                  onClick={() => setLedgerFilter('CASH')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${ledgerFilter === 'CASH' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                >
                  {isUrdu ? 'کیش / والٹ' : 'Cash Book'}
                </button>
                <button 
                  onClick={() => setLedgerFilter('CREDIT')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${ledgerFilter === 'CREDIT' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                >
                  {isUrdu ? 'ادھار کھاتہ' : 'Credit Ledger'}
                </button>
                <button 
                  onClick={() => setLedgerFilter('INTERNAL')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${ledgerFilter === 'INTERNAL' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                >
                  {isUrdu ? 'شعبہ جاتی استعمال' : 'Internal Use'}
                </button>
              </div>
            </div>

            {/* LEDGER GENERAL BOOK TABLE */}
            <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden print:border-none print:shadow-none">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="pl-6 font-bold">{isUrdu ? 'تاریخ (Time)' : 'Date'}</TableHead>
                      <TableHead className="font-bold">{isUrdu ? 'تفصیل پروڈکٹ' : 'Product / Transaction Description'}</TableHead>
                      <TableHead className="font-bold">{isUrdu ? 'ادائیگی کا ذریعہ (Source)' : 'Source / Destination'}</TableHead>
                      <TableHead className="font-bold">{isUrdu ? 'طریقہ کار (Mode)' : 'Payment Mode'}</TableHead>
                      <TableHead className="font-bold text-center">{isUrdu ? 'مقدار' : 'Quantity'}</TableHead>
                      <TableHead className="font-bold text-center">{isUrdu ? 'یونٹ قیمت' : 'Unit Price'}</TableHead>
                      <TableHead className="text-right pr-6 font-bold">{isUrdu ? 'ڈیبٹ / کریڈٹ (Total Amount)' : 'Debit / Credit (+/-)'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-semibold">No ledger items matching selection.</TableCell></TableRow>
                    ) : filteredLogs.map(log => {
                      const isPurchase = log.transaction_type === 'IN' || log.transaction_type === 'OUTFLOW';
                      const isFree = log.payment_mode === 'Internal Issue' || log.payment_mode === 'Donation';
                      const isCredit = log.payment_mode.toLowerCase().includes('credit');
                      
                      let textAmtColor = "text-emerald-600";
                      let textPrefix = "+";
                      if (isPurchase) {
                        textAmtColor = "text-rose-600";
                        textPrefix = "-";
                      }
                      if (isFree) {
                        textAmtColor = "text-slate-500";
                        textPrefix = "";
                      }

                      return (
                        <TableRow key={log.id} className="hover:bg-muted/15 transition-colors">
                          <TableCell className="pl-6 text-xs text-muted-foreground font-semibold">
                            {new Date(log.date).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-bold text-sm text-foreground">{log.item_name || `Item #${log.item_id}`}</p>
                              <p className="text-[10px] text-muted-foreground italic">"{log.remarks}"</p>
                              {(log.payment_mode === 'Cash Sale' || log.payment_mode === 'Credit Sale') && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                  {isUrdu 
                                    ? `منافع: Rs. ${(log.total_amount - (log.quantity * (items.find(i => i.id === log.item_id)?.purchase_price || log.price_per_unit * 0.75))).toLocaleString()} (لاگت: Rs. ${(log.quantity * (items.find(i => i.id === log.item_id)?.purchase_price || log.price_per_unit * 0.75)).toLocaleString()})`
                                    : `Profit: Rs. ${(log.total_amount - (log.quantity * (items.find(i => i.id === log.item_id)?.purchase_price || log.price_per_unit * 0.75))).toLocaleString()} (COGS: Rs. ${(log.quantity * (items.find(i => i.id === log.item_id)?.purchase_price || log.price_per_unit * 0.75)).toLocaleString()})`}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              {log.payment_source?.includes("Bank") && <Landmark className="w-3.5 h-3.5 text-blue-500" />}
                              {log.payment_source?.includes("Hand") && <Wallet className="w-3.5 h-3.5 text-emerald-500" />}
                              {log.payment_source}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                isFree 
                                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' 
                                  : isCredit 
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              }`}
                            >
                              {log.payment_mode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-bold text-xs">{log.quantity}</TableCell>
                          <TableCell className="text-center font-bold text-xs">Rs. {log.price_per_unit}</TableCell>
                          <TableCell className={`text-right pr-6 font-black text-sm ${textAmtColor}`}>
                            {isFree ? '-' : `${textPrefix} Rs. ${log.total_amount.toLocaleString()}`}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: SUPPLIERS AND PAYABLES */}
        {activeTab === 'suppliers' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid gap-6 md:grid-cols-3">
              
              {/* REGISTER SUPPLIER FORM */}
              <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden print:hidden">
                <CardHeader className="bg-muted/40 border-b border-border p-6">
                  <CardTitle className="text-base font-black flex items-center gap-2">
                    <Plus className="w-4 h-4 text-rose-600" />
                    {isUrdu ? 'نیا سپلائر درج کریں' : 'Register New Supplier'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleAddSupplier} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'سپلائر / پارٹی کا نام *' : 'Supplier Name *'}</Label>
                      <Input 
                        required 
                        placeholder={isUrdu ? 'مثال: الکرم اسٹیشنرز' : 'e.g. Al-Karam Stationers'} 
                        value={newSupplierName} 
                        onChange={e => setNewSupplierName(e.target.value)} 
                        className="rounded-xl h-10" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs uppercase text-muted-foreground">{isUrdu ? 'رابطہ نمبر' : 'Contact Number'}</Label>
                      <Input 
                        placeholder="0300-1234567" 
                        value={newSupplierContact} 
                        onChange={e => setNewSupplierContact(e.target.value)} 
                        className="rounded-xl h-10" 
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold hover:opacity-90 transition mt-2">
                      {isUrdu ? 'سپلائر شامل کریں' : 'Add Supplier'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* REGISTERED SUPPLIERS LIST */}
              <Card className="md:col-span-2 border-border shadow-xl bg-card rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/40 border-b border-border p-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      {isUrdu ? 'سپلائر کھاتہ لیجر' : 'Supplier Ledger Outstanding Balances'}
                    </CardTitle>
                    <CardDescription>{isUrdu ? 'تمام سپلائرز جن کو ادھار ادائیگی کرنی ہے' : 'Supplier payables outstanding registry'}</CardDescription>
                  </div>
                  <Badge variant="outline" className="font-bold text-xs">
                    {suppliers.length} {isUrdu ? 'سپلائرز' : 'Suppliers'}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="pl-6 font-bold">{isUrdu ? 'سپلائر کا نام' : 'Supplier Name'}</TableHead>
                        <TableHead className="font-bold">{isUrdu ? 'رابطہ نمبر' : 'Contact'}</TableHead>
                        <TableHead className="font-bold">{isUrdu ? 'واجب الادا رقم (Payable)' : 'Outstanding Payable'}</TableHead>
                        <TableHead className="text-right pr-6 font-bold print:hidden">{isUrdu ? 'ایکشن' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-semibold">No suppliers registered.</TableCell></TableRow>
                      ) : suppliers.map(s => (
                        <TableRow key={s.id} className="hover:bg-muted/15 transition-colors">
                          <TableCell className="font-bold pl-6 text-foreground">{s.name}</TableCell>
                          <TableCell className="text-muted-foreground text-xs font-semibold">{s.contact}</TableCell>
                          <TableCell className={`font-black text-sm ${s.outstanding_balance > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                            Rs. {s.outstanding_balance.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right pr-6 print:hidden">
                            <Button 
                              disabled={s.outstanding_balance <= 0}
                              onClick={() => setPayingSupplier(s)}
                              className="rounded-xl h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {isUrdu ? 'ادائیگی کریں' : 'Pay Out'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* EDIT DIALOG / MODAL (CONDITIONAL) */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md border border-border shadow-2xl bg-card rounded-3xl overflow-hidden">
              <CardHeader className="bg-rose-50 dark:bg-rose-950/40 p-6 border-b">
                <CardTitle className="text-lg font-black text-rose-800 dark:text-rose-200">
                  {isUrdu ? 'آئٹم کی تفصیلات ایڈٹ کریں' : 'Edit Inventory Item'}
                </CardTitle>
                <CardDescription className="text-xs">{editingItem.name}</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateItem}>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs">{isUrdu ? 'آئٹم کا نام' : 'Item Name'}</Label>
                    <Input required value={editName} onChange={e => setEditName(e.target.value)} className="rounded-xl h-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs">{isUrdu ? 'کیٹیگری' : 'Category'}</Label>
                      <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold" value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                        <option>Stationery</option>
                        <option>Furniture</option>
                        <option>Electronics</option>
                        <option>Lab Equipment</option>
                        <option>Sports</option>
                        <option>Library</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs">{isUrdu ? 'یونٹ' : 'Unit'}</Label>
                      <Input required value={editUnit} onChange={e => setEditUnit(e.target.value)} className="rounded-xl h-10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs">{isUrdu ? 'خریداری قیمت' : 'Purchase Price'}</Label>
                      <Input type="number" required value={editPurchasePrice} onChange={e => {
                        const num = parseFloat(e.target.value) || 0;
                        setEditPurchasePrice(num);
                        setEditSalePrice(Math.round(num * 1.3)); // Auto-calc 30% profit markup
                      }} className="rounded-xl h-10 font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs">{isUrdu ? 'فروخت قیمت' : 'Sale Price'}</Label>
                      <Input type="number" required value={editSalePrice} onChange={e => setEditSalePrice(parseFloat(e.target.value) || 0)} className="rounded-xl h-10 font-bold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs">{isUrdu ? 'سٹوریج مقام' : 'Location'}</Label>
                      <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} className="rounded-xl h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-xs">{isUrdu ? 'الرٹ لیول' : 'Alert Level'}</Label>
                      <Input type="number" min="1" value={editMinStock} onChange={e => setEditMinStock(parseInt(e.target.value) || 5)} className="rounded-xl h-10 font-bold" />
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 bg-muted/30 border-t flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" className="rounded-xl text-xs font-bold" onClick={() => setEditingItem(null)}>
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 h-9">
                    {isUrdu ? 'اپ ڈیٹ کریں' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* PAY OUTSTANDING SUPPLIER MODAL */}
        {payingSupplier && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md border border-border shadow-2xl bg-card rounded-3xl overflow-hidden">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-950/40 p-6 border-b">
                <CardTitle className="text-lg font-black text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  {isUrdu ? 'سپلائر کو ادھار ادائیگی کریں' : 'Supplier Outstanding Payment'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {payingSupplier.name} | {isUrdu ? `ٹوٹل واجب الادا: Rs. ${payingSupplier.outstanding_balance}` : `Total Outstanding: Rs. ${payingSupplier.outstanding_balance}`}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePaySupplier}>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs">{isUrdu ? 'ادائیگی کی رقم (Rs.) *' : 'Payment Amount (Rs.) *'}</Label>
                    <Input 
                      type="number" 
                      required 
                      max={payingSupplier.outstanding_balance}
                      min="1"
                      placeholder="e.g. 5000"
                      value={payAmount} 
                      onChange={e => setPayAmount(e.target.value)} 
                      className="rounded-xl h-10 font-bold" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs">{isUrdu ? 'ادائیگی کا ذریعہ (Source Wallet) *' : 'Payment Source Wallet *'}</Label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold"
                      value={paySource}
                      onChange={e => setPaySource(e.target.value as any)}
                    >
                      <option value="Cash in Hand">{isUrdu ? `کیش ان ہینڈ (Rs. ${cashInHand})` : `Cash in Hand (Bal: Rs. ${cashInHand})`}</option>
                      <option value="Bank">{isUrdu ? `بینک اکاؤنٹ (Rs. ${bankBalance})` : `Bank Account (Bal: Rs. ${bankBalance})`}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs">{isUrdu ? 'ریمارکس / تفصیل' : 'Remarks'}</Label>
                    <Input 
                      placeholder={isUrdu ? 'مثال: بل نمبر 123 کی جزوی ادائیگی' : 'e.g. Bill #123 partial payment'} 
                      value={payRemarks} 
                      onChange={e => setPayRemarks(e.target.value)} 
                      className="rounded-xl h-10" 
                    />
                  </div>
                </CardContent>
                <div className="p-6 bg-muted/30 border-t flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" className="rounded-xl text-xs font-bold" onClick={() => setPayingSupplier(null)}>
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 h-9">
                    {isUrdu ? 'رقم ادا کریں' : 'Post Payment'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}
