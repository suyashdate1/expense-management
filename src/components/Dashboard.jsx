import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function Dashboard({ onViewAll }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formMessageType, setFormMessageType] = useState("");

  const emptyForm = {
    title: "",
    amount: "",
    category: "",
    date: "",
    description: "",
    paymentMethod: "",
  };

  const [expenseForm, setExpenseForm] = useState(emptyForm);

  // =========================
  // Category Chart Data
  // =========================

  const categoryData = Object.values(
    expenses.reduce((acc, expense) => {
      const category = expense.category || "Other";
      const amount = Number(expense.amount) || 0;

      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
        };
      }

      acc[category].value += amount;

      return acc;
    }, {})
  );

  // =========================
  // Monthly Chart Data
  // =========================

  const monthlyData = Object.values(
    expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);

      const month = date.toLocaleString("en-IN", {
        month: "short",
        year: "numeric",
      });

      const amount = Number(expense.amount) || 0;

      if (!acc[month]) {
        acc[month] = {
          month,
          amount: 0,
          sortDate: new Date(
            date.getFullYear(),
            date.getMonth(),
            1
          ),
        };
      }

      acc[month].amount += amount;

      return acc;
    }, {})
  ).sort((a, b) => a.sortDate - b.sortDate);

  // =========================
  // Chart Colors
  // =========================

  const chartColors = [
    "#3b82f6",
    "#22c55e",
    "#f97316",
    "#a855f7",
    "#ef4444",
    "#14b8a6",
    "#eab308",
    "#64748b",
  ];

  // =========================
  // Fetch Expenses
  // =========================

  const fetchExpenses = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:8081/api/expenses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses(response.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError("Session expired. Please login again.");
      } else {
        setError("Unable to load expenses.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // =========================
  // Form Change
  // =========================

  const handleExpenseChange = (e) => {
    setExpenseForm({
      ...expenseForm,
      [e.target.name]: e.target.value,
    });

    setFormMessage("");
  };

  // =========================
  // Open Add Modal
  // =========================

  const openAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm(emptyForm);
    setFormMessage("");
    setShowExpenseModal(true);
  };

  // =========================
  // Open Edit Modal
  // =========================

  const openEditExpense = (expense) => {
    setEditingExpense(expense);

    setExpenseForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
      paymentMethod: expense.paymentMethod,
    });

    setFormMessage("");
    setShowExpenseModal(true);
  };

  // =========================
  // Save Expense
  // =========================

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setFormMessage("");

    try {
      const token = localStorage.getItem("token");

      const expenseData = {
        title: expenseForm.title,
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date,
        description: expenseForm.description,
        paymentMethod: expenseForm.paymentMethod,
      };

      if (editingExpense) {
        await axios.put(
          `http://localhost:8081/api/expenses/${editingExpense.id}`,
          expenseData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFormMessage("Expense updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8081/api/expenses",
          expenseData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFormMessage("Expense added successfully!");
      }

      setFormMessageType("success");

      await fetchExpenses();

      setTimeout(() => {
        setShowExpenseModal(false);
        setEditingExpense(null);
        setFormMessage("");
        setExpenseForm(emptyForm);
      }, 800);
    } catch (error) {
      console.error(error);

      if (error.response) {
        setFormMessage(
          error.response.data.message || "Unable to save expense."
        );
      } else {
        setFormMessage("Unable to connect to the backend.");
      }

      setFormMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Delete Expense
  // =========================

  const handleDeleteExpense = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:8081/api/expenses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchExpenses();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError("You are not allowed to delete this expense.");
      } else {
        setError("Unable to delete expense.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // Close Modal
  // =========================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowExpenseModal(false);
    setEditingExpense(null);
    setFormMessage("");
    setExpenseForm(emptyForm);
  };

  // =========================
  // Logout
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // =========================
  // Currency
  // =========================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // =========================
  // Calculations
  // =========================

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);

      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );

  const averageExpense =
    expenses.length > 0
      ? totalExpenses / expenses.length
      : 0;

  const recentExpenses = expenses
    .slice()
    .sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm">
                ₹
              </div>

              <div>
                <h1 className="font-bold text-slate-900 text-lg">
                  Expense Manager
                </h1>

                <p className="text-xs text-slate-500">
                  Financial Dashboard
                </p>
              </div>

            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition"
            >
              Logout
            </button>

          </div>
        </div>
      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Dashboard
            </h2>

            <p className="text-slate-500 mt-1">
              Here's an overview of your spending.
            </p>
          </div>

          <button
            onClick={openAddExpense}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/20 transition"
          >
            + Add Expense
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">

            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>

          </div>
        )}

        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Total */}

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Expenses
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mt-3">
                  {loading
                    ? "Loading..."
                    : formatCurrency(totalExpenses)}
                </h3>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                ₹
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-3">
              All recorded expenses
            </p>

          </div>

          {/* Monthly */}

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  This Month
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mt-3">
                  {loading
                    ? "Loading..."
                    : formatCurrency(monthlyExpenses)}
                </h3>
              </div>

              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                ↗
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-3">
              Current month spending
            </p>

          </div>

          {/* Transactions */}

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Transactions
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mt-3">
                  {loading ? "..." : expenses.length}
                </h3>
              </div>

              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                #
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-3">
              Total transactions
            </p>

          </div>

          {/* Average */}

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Average Expense
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mt-3">
                  {loading
                    ? "Loading..."
                    : formatCurrency(averageExpense)}
                </h3>
              </div>

              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                ≈
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-3">
              Average per transaction
            </p>

          </div>

        </div>

        {/* =========================
            SPENDING BY CATEGORY
        ========================= */}

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Spending by Category
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              See where your money is being spent
            </p>
          </div>

          <div className="w-full h-80">

            {categoryData.length > 0 ? (

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >

                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          chartColors[index % chartColors.length]
                        }
                      />
                    ))}

                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      `₹${Number(value).toFixed(2)}`,
                      "Amount",
                    ]}
                  />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-gray-500">
                No expense data available
              </div>

            )}

          </div>

        </div>

        {/* =========================
            MONTHLY EXPENSE ANALYTICS
        ========================= */}

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Monthly Expense Analytics
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Track how your spending changes month by month
            </p>
          </div>

          <div className="w-full h-80">

            {monthlyData.length > 0 ? (

              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `₹${Number(value).toFixed(2)}`,
                      "Expenses",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />

                </LineChart>
              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-gray-500">
                No expense data available
              </div>

            )}

          </div>

        </div>

        {/* =========================
            EXPENSE TABLE
        ========================= */}

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="flex items-center justify-between p-6 border-b border-slate-100">

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Recent Expenses
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Your latest transactions
              </p>
            </div>

            <div className="flex items-center gap-4">

              <button
                onClick={onViewAll}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                View All →
              </button>

              <span className="text-sm font-semibold text-blue-600">
                {expenses.length} records
              </span>

            </div>

          </div>

          {loading ? (

            <div className="py-16 text-center text-slate-500">
              Loading expenses...
            </div>

          ) : expenses.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-16 px-6">

              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mb-4">
                ₹
              </div>

              <h4 className="font-semibold text-slate-800">
                No expenses yet
              </h4>

              <p className="text-sm text-slate-500 mt-1 text-center">
                Add your first expense to start tracking your spending.
              </p>

              <button
                onClick={openAddExpense}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                + Add Expense
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Expense
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Category
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Date
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Amount
                    </th>

                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentExpenses.map((expense) => (

                    <tr
                      key={expense.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-4">

                        <p className="font-semibold text-slate-800 text-sm">
                          {expense.title}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {expense.paymentMethod}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {expense.category}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {expense.date}
                      </td>

                      <td className="px-6 py-4 text-right">

                        <span className="font-bold text-slate-800">
                          {formatCurrency(expense.amount)}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() => openEditExpense(expense)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteExpense(expense.id)
                            }
                            disabled={deletingId === expense.id}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 text-xs font-semibold transition"
                          >
                            {deletingId === expense.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showExpenseModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">

          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  {editingExpense
                    ? "Edit Expense"
                    : "Add New Expense"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingExpense
                    ? "Update your transaction details"
                    : "Record a new transaction"}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-lg transition"
              >
                ×
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleExpenseSubmit}
              className="p-6 space-y-5"
            >

              {/* Title + Amount */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Expense Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={expenseForm.title}
                    onChange={handleExpenseChange}
                    placeholder="e.g. Grocery shopping"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Amount
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="amount"
                      value={expenseForm.amount}
                      onChange={handleExpenseChange}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                      className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>

              </div>

              {/* Category + Date */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={expenseForm.category}
                    onChange={handleExpenseChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >

                    <option value="">
                      Select category
                    </option>

                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">
                      Entertainment
                    </option>
                    <option value="Health">Health</option>
                    <option value="Education">
                      Education
                    </option>
                    <option value="Other">Other</option>

                  </select>

                </div>

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={handleExpenseChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

              </div>

              {/* Payment */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={expenseForm.paymentMethod}
                  onChange={handleExpenseChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >

                  <option value="">
                    Select payment method
                  </option>

                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">
                    Credit Card
                  </option>
                  <option value="Debit Card">
                    Debit Card
                  </option>
                  <option value="Net Banking">
                    Net Banking
                  </option>
                  <option value="Other">Other</option>

                </select>

              </div>

              {/* Description */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={expenseForm.description}
                  onChange={handleExpenseChange}
                  placeholder="Add some details about this expense..."
                  rows="3"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none resize-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                ></textarea>

              </div>

              {/* Message */}

              {formMessage && (

                <div
                  className={`p-3 rounded-xl text-sm text-center font-medium ${
                    formMessageType === "success"
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-red-50 text-red-700 border border-red-100"
                  }`}
                >
                  {formMessage}
                </div>

              )}

              {/* Buttons */}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm transition"
                >
                  {saving
                    ? "Saving..."
                    : editingExpense
                    ? "Update Expense"
                    : "Save Expense"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;