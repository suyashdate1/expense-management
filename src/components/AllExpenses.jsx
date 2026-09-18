import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function AllExpenses({ onBack }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // General states
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [saving, setSaving] = useState(false);
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
  // Fetch Expenses
  // =========================

  const fetchExpenses = async () => {
    try {
      setLoading(true);
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
  // Delete Expense
  // =========================

  const handleDelete = async (id) => {
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

      setExpenses((previousExpenses) =>
        previousExpenses.filter(
          (expense) => expense.id !== id
        )
      );
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You are not allowed to delete this expense."
        );
      } else {
        setError("Unable to delete expense.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // Open Edit Modal
  // =========================

  const openEditModal = (expense) => {
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
    setFormMessageType("");
    setShowEditModal(true);
  };

  // =========================
  // Form Change
  // =========================

  const handleFormChange = (e) => {
    setExpenseForm({
      ...expenseForm,
      [e.target.name]: e.target.value,
    });

    setFormMessage("");
  };

  // =========================
  // Update Expense
  // =========================

  const handleUpdateExpense = async (e) => {
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

      const response = await axios.put(
        `http://localhost:8081/api/expenses/${editingExpense.id}`,
        expenseData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses((previousExpenses) =>
        previousExpenses.map((expense) =>
          expense.id === editingExpense.id
            ? response.data
            : expense
        )
      );

      setFormMessage("Expense updated successfully!");
      setFormMessageType("success");

      setTimeout(() => {
        setShowEditModal(false);
        setEditingExpense(null);
        setExpenseForm(emptyForm);
        setFormMessage("");
      }, 800);
    } catch (error) {
      console.error(error);

      if (error.response) {
        setFormMessage(
          error.response.data.message ||
            "Unable to update expense."
        );
      } else {
        setFormMessage(
          "Unable to connect to the backend."
        );
      }

      setFormMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Close Edit Modal
  // =========================

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);
    setEditingExpense(null);
    setExpenseForm(emptyForm);
    setFormMessage("");
  };

  // =========================
  // Filtering + Sorting
  // =========================

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search
    if (search.trim() !== "") {
      const searchText = search.toLowerCase();

      result = result.filter((expense) =>
        `${expense.title} ${expense.description} ${expense.category}`
          .toLowerCase()
          .includes(searchText)
      );
    }

    // Category
    if (category !== "All") {
      result = result.filter(
        (expense) => expense.category === category
      );
    }

    // Payment Method
    if (paymentMethod !== "All") {
      result = result.filter(
        (expense) =>
          expense.paymentMethod === paymentMethod
      );
    }

    // From Date
    if (fromDate !== "") {
      result = result.filter(
        (expense) => expense.date >= fromDate
      );
    }

    // To Date
    if (toDate !== "") {
      result = result.filter(
        (expense) => expense.date <= toDate
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.date) -
          new Date(a.date)
        );
      }

      if (sortOrder === "oldest") {
        return (
          new Date(a.date) -
          new Date(b.date)
        );
      }

      if (sortOrder === "high") {
        return (
          Number(b.amount) -
          Number(a.amount)
        );
      }

      if (sortOrder === "low") {
        return (
          Number(a.amount) -
          Number(b.amount)
        );
      }

      return 0;
    });

    return result;
  }, [
    expenses,
    search,
    category,
    paymentMethod,
    fromDate,
    toDate,
    sortOrder,
  ]);

  // =========================
  // Total Filtered Amount
  // =========================

  const totalFilteredAmount = filteredExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0
  );

  // =========================
  // Filter Options
  // =========================

  const categories = [
    "All",
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other",
  ];

  const paymentMethods = [
    "All",
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Other",
  ];

  // =========================
  // Clear Filters
  // =========================

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setPaymentMethod("All");
    setSortOrder("newest");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-6 py-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                ₹
              </div>

              <div>

                <h1 className="font-bold text-slate-900 text-lg">
                  Expense Manager
                </h1>

                <p className="text-xs text-slate-500">
                  All Expenses
                </p>

              </div>

            </div>

            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
            >
              ← Dashboard
            </button>

          </div>

        </div>

      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Heading */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-slate-900">
            All Expenses
          </h2>

          <p className="text-slate-500 mt-1">
            Search, filter and manage all your transactions.
          </p>

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
            SUMMARY
        ========================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Total Records
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-2">
              {expenses.length}
            </p>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Filtered Records
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-2">
              {filteredExpenses.length}
            </p>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Filtered Amount
            </p>

            <p className="text-2xl font-bold text-blue-600 mt-2">
              {formatCurrency(totalFilteredAmount)}
            </p>

          </div>

        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">

          {/* Main filters */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Search */}

            <div className="lg:col-span-2">

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search title, description or category..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            {/* Category */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

            </div>

            {/* Payment */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >

                {paymentMethods.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

            </div>

          </div>

          {/* Date + Sort filters */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">

            {/* Sort */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sort By
              </label>

              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value)
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >

                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>

                <option value="high">
                  Highest Amount
                </option>

                <option value="low">
                  Lowest Amount
                </option>

              </select>

            </div>

            {/* From Date */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(e.target.value)
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            {/* To Date */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(e.target.value)
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            {/* Clear */}

            <div className="flex items-end">

              <button
                onClick={clearFilters}
                className="w-full px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Clear Filters
              </button>

            </div>

            {/* Refresh */}

            <div className="flex items-end">

              <button
                onClick={fetchExpenses}
                className="w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
              >
                ↻ Refresh
              </button>

            </div>

          </div>

        </div>

        {/* =========================
            EXPENSE TABLE
        ========================= */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-100">

            <h3 className="text-lg font-bold text-slate-900">
              Transactions
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {filteredExpenses.length} transaction
              {filteredExpenses.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

          {loading ? (

            <div className="py-20 text-center text-slate-500">
              Loading expenses...
            </div>

          ) : filteredExpenses.length === 0 ? (

            <div className="py-20 text-center px-6">

              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
                ₹
              </div>

              <h4 className="font-semibold text-slate-800 mt-4">
                No expenses found
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                Try changing your search or filters.
              </p>

              <button
                onClick={clearFilters}
                className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
              >
                Clear Filters
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
                      Payment
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Date
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Amount
                    </th>

                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredExpenses.map((expense) => (

                    <tr
                      key={expense.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-4">

                        <p className="font-semibold text-slate-800 text-sm">
                          {expense.title}
                        </p>

                        <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">
                          {expense.description}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {expense.category}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {expense.paymentMethod}
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

                          {/* Edit */}

                          <button
                            onClick={() =>
                              openEditModal(expense)
                            }
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition"
                          >
                            Edit
                          </button>

                          {/* Delete */}

                          <button
                            onClick={() =>
                              handleDelete(expense.id)
                            }
                            disabled={
                              deletingId === expense.id
                            }
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
          EDIT MODAL
      ========================= */}

      {showEditModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">

          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Edit Expense
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Update your transaction details
                </p>

              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-lg transition"
              >
                ×
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleUpdateExpense}
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
                    onChange={handleFormChange}
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
                      onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >

                    <option value="">
                      Select category
                    </option>

                    <option value="Food">
                      Food
                    </option>

                    <option value="Travel">
                      Travel
                    </option>

                    <option value="Shopping">
                      Shopping
                    </option>

                    <option value="Bills">
                      Bills
                    </option>

                    <option value="Entertainment">
                      Entertainment
                    </option>

                    <option value="Health">
                      Health
                    </option>

                    <option value="Education">
                      Education
                    </option>

                    <option value="Other">
                      Other
                    </option>

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
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

              </div>

              {/* Payment Method */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={expenseForm.paymentMethod}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >

                  <option value="">
                    Select payment method
                  </option>

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Credit Card">
                    Credit Card
                  </option>

                  <option value="Debit Card">
                    Debit Card
                  </option>

                  <option value="Net Banking">
                    Net Banking
                  </option>

                  <option value="Other">
                    Other
                  </option>

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
                  onChange={handleFormChange}
                  placeholder="Add some details about this expense..."
                  rows="3"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none resize-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

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
                  onClick={closeEditModal}
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
                    ? "Updating..."
                    : "Update Expense"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AllExpenses;