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

  // =========================
  // Monthly Budget
  // =========================

  const [monthlyBudget, setMonthlyBudget] = useState(10000);
  const [budgetInput, setBudgetInput] = useState(10000);
  const [showBudgetInput, setShowBudgetInput] = useState(false);

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

  // =========================
  // Fetch Budget
  // =========================

  const fetchBudget = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:8081/api/budget",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const amount = Number(response.data.amount);

      setMonthlyBudget(amount);
      setBudgetInput(amount);
    } catch (error) {
      console.error("Unable to load budget:", error);
    }
  };

  // =========================
  // Initial Data Load
  // =========================

  useEffect(() => {
    fetchExpenses();
    fetchBudget();
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
          error.response.data.message ||
            "Unable to save expense."
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

  // =========================
  // Average Monthly Spending
  // =========================

  const averageMonthlySpending =
    expenses.length > 0
      ? totalExpenses /
        Math.max(
          new Set(
            expenses.map((expense) => {
              const date = new Date(expense.date);
              return `${date.getFullYear()}-${date.getMonth()}`;
            })
          ).size,
          1
        )
      : 0;

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

  // =========================
  // Budget vs Actual
  // =========================

  const budgetPercentage =
    monthlyBudget > 0
      ? (monthlyExpenses / monthlyBudget) * 100
      : 0;

  const safeBudgetPercentage = Math.min(
    budgetPercentage,
    100
  );

  const remainingBudget =
    monthlyBudget - monthlyExpenses;

  const budgetExceeded =
    monthlyExpenses > monthlyBudget;

  // =========================
  // Save Monthly Budget
  // =========================

  const handleBudgetSave = async () => {
    const newBudget = Number(budgetInput);

    if (!newBudget || newBudget <= 0) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:8081/api/budget?amount=${newBudget}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedAmount = Number(response.data.amount);

      setMonthlyBudget(savedAmount);
      setBudgetInput(savedAmount);
      setShowBudgetInput(false);
    } catch (error) {
      console.error("Unable to save budget:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">

      {/* =========================
          MAIN
      ========================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Dashboard
            </h2>

            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              Here's an overview of your spending.
            </p>
          </div>

          <button
            onClick={openAddExpense}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/20 transition"
          >
            + Add Expense
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-3 justify-between">

            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="font-bold text-red-500 hover:text-red-700 dark:hover:text-red-300 shrink-0"
            >
              ×
            </button>

          </div>
        )}

        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {/* Total */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Expenses
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3 break-words">
                  {loading
                    ? "Loading..."
                    : formatCurrency(totalExpenses)}
                </h3>

              </div>

              <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                ₹
              </div>

            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              All recorded expenses
            </p>

          </div>

          {/* Monthly */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  This Month
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3 break-words">
                  {loading
                    ? "Loading..."
                    : formatCurrency(monthlyExpenses)}
                </h3>

              </div>

              <div className="w-10 h-10 shrink-0 rounded-xl bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center justify-center">
                ↗
              </div>

            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Current month spending
            </p>

          </div>

          {/* Transactions */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Transactions
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3">
                  {loading ? "..." : expenses.length}
                </h3>

              </div>

              <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                #
              </div>

            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Total transactions
            </p>

          </div>

          {/* Average */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Average Expense
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3 break-words">
                  {loading
                    ? "Loading..."
                    : formatCurrency(averageExpense)}
                </h3>

              </div>

              <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                ≈
              </div>

            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Average per transaction
            </p>

          </div>

        </div>

        {/* =========================
            MONTHLY BUDGET
        ========================= */}

        <div className="mt-6 sm:mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 transition-colors">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Monthly Budget
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Set a spending limit for the current month
              </p>
            </div>

            {!showBudgetInput && (
              <button
                onClick={() => {
                  setBudgetInput(monthlyBudget);
                  setShowBudgetInput(true);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-semibold transition"
              >
                Edit Budget
              </button>
            )}

          </div>

          {showBudgetInput ? (

            <div className="mt-5 flex flex-col sm:flex-row gap-3">

              <div className="relative flex-1">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold">
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={budgetInput}
                  onChange={(e) =>
                    setBudgetInput(e.target.value)
                  }
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Enter monthly budget"
                />

              </div>

              <div className="grid grid-cols-2 sm:flex gap-3">

                <button
                  onClick={handleBudgetSave}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
                >
                  Save Budget
                </button>

                <button
                  onClick={() => setShowBudgetInput(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition"
                >
                  Cancel
                </button>

              </div>

            </div>

          ) : (

            <>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-6">

                <div>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Spent this month
                  </p>

                  <h4 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {formatCurrency(monthlyExpenses)}
                  </h4>

                </div>

                <div className="sm:text-right">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Monthly limit
                  </p>

                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatCurrency(monthlyBudget)}
                  </p>

                </div>

              </div>

              <div className="mt-5">

                <div className="w-full h-3 sm:h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetExceeded
                        ? "bg-red-500"
                        : budgetPercentage >= 80
                        ? "bg-orange-500"
                        : "bg-blue-600"
                    }`}
                    style={{
                      width: `${safeBudgetPercentage}%`,
                    }}
                  ></div>

                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2">

                  <p
                    className={`text-sm font-semibold ${
                      budgetExceeded
                        ? "text-red-600 dark:text-red-400"
                        : budgetPercentage >= 80
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {budgetPercentage.toFixed(1)}% used
                  </p>

                  <p
                    className={`text-sm font-semibold sm:text-right ${
                      budgetExceeded
                        ? "text-red-600 dark:text-red-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {budgetExceeded
                      ? `${formatCurrency(
                          Math.abs(remainingBudget)
                        )} over budget`
                      : `${formatCurrency(
                          remainingBudget
                        )} remaining`}
                  </p>

                </div>

              </div>

            </>

          )}

        </div>

        {/* =========================
            BUDGET VS ACTUAL
        ========================= */}

        <div className="mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Monthly Budget
            </p>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(monthlyBudget)}
            </h3>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Your spending limit
            </p>

          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Actual Spending
            </p>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(monthlyExpenses)}
            </h3>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Spent during the current month
            </p>

          </div>

          <div
            className={`rounded-2xl border shadow-sm p-5 sm:p-6 ${
              budgetExceeded
                ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            }`}
          >

            <p
              className={`text-sm font-medium ${
                budgetExceeded
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {budgetExceeded
                ? "Budget Exceeded"
                : "Remaining Budget"}
            </p>

            <h3
              className={`text-2xl font-bold mt-2 ${
                budgetExceeded
                  ? "text-red-700 dark:text-red-300"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {formatCurrency(
                Math.abs(remainingBudget)
              )}
            </h3>

            <p
              className={`text-xs mt-2 ${
                budgetExceeded
                  ? "text-red-500 dark:text-red-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {budgetExceeded
                ? "Amount spent above your budget"
                : "Available for the rest of the month"}
            </p>

          </div>

        </div>

        {/* =========================
            AVERAGE MONTHLY SPENDING
        ========================= */}

        <div className="mt-5 sm:mt-6">

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Average Monthly Spending
            </p>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(averageMonthlySpending)}
            </h3>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Based on your recorded expenses
            </p>

          </div>

        </div>

        {/* =========================
            SPENDING BY CATEGORY
        ========================= */}

        <div className="mt-6 sm:mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">

          <div className="mb-4">

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Spending by Category
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              See where your money is being spent
            </p>

          </div>

          <div className="w-full h-72 sm:h-80">

            {categoryData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="65%"
                    label
                  >

                    {categoryData.map((entry, index) => (

                      <Cell
                        key={`cell-${index}`}
                        fill={
                          chartColors[
                            index % chartColors.length
                          ]
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

              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                No expense data available
              </div>

            )}

          </div>

        </div>

        {/* =========================
            MONTHLY EXPENSE ANALYTICS
        ========================= */}

        <div className="mt-6 sm:mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">

          <div className="mb-4">

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Monthly Expense Analytics
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track how your spending changes month by month
            </p>

          </div>

          <div className="w-full h-72 sm:h-80">

            {monthlyData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      `₹${value}`
                    }
                    width={55}
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
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                No expense data available
              </div>

            )}

          </div>

        </div>

        {/* =========================
            EXPENSE TABLE
        ========================= */}

        <div className="mt-6 sm:mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">

            <div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Expenses
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your latest transactions
              </p>

            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">

              <button
                onClick={onViewAll}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
              >
                View All →
              </button>

              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {expenses.length} records
              </span>

            </div>

          </div>

          {loading ? (

            <div className="py-16 text-center text-slate-500 dark:text-slate-400">
              Loading expenses...
            </div>

          ) : expenses.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-16 px-6">

              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-4 text-slate-700 dark:text-slate-200">
                ₹
              </div>

              <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                No expenses yet
              </h4>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
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

              <table className="w-full min-w-[720px]">

                <thead className="bg-slate-50 dark:bg-slate-800/70">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Expense
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Category
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Date
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Amount
                    </th>

                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentExpenses.map((expense) => (

                    <tr
                      key={expense.id}
                      className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                    >

                      <td className="px-6 py-4">

                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {expense.title}
                        </p>

                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {expense.paymentMethod}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                          {expense.category}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {expense.date}
                      </td>

                      <td className="px-6 py-4 text-right">

                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(
                            expense.amount
                          )}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() =>
                              openEditExpense(expense)
                            }
                            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-semibold transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteExpense(
                                expense.id
                              )
                            }
                            disabled={
                              deletingId === expense.id
                            }
                            className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-xs font-semibold transition"
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

        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-sm">

          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}

            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-800">

              <div className="min-w-0">

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {editingExpense
                    ? "Edit Expense"
                    : "Add New Expense"}
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {editingExpense
                    ? "Update your transaction details"
                    : "Record a new transaction"}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-lg transition"
              >
                ×
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleExpenseSubmit}
              className="p-5 sm:p-6 space-y-5"
            >

              {/* Title + Amount */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Expense Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={expenseForm.title}
                    onChange={handleExpenseChange}
                    placeholder="e.g. Grocery shopping"
                    required
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Amount
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold">
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
                      className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>

              </div>

              {/* Category + Date */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={expenseForm.category}
                    onChange={handleExpenseChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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

                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={handleExpenseChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

              </div>

              {/* Payment */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={expenseForm.paymentMethod}
                  onChange={handleExpenseChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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

                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={expenseForm.description}
                  onChange={handleExpenseChange}
                  placeholder="Add some details about this expense..."
                  rows="3"
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none resize-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                ></textarea>

              </div>

              {/* Message */}

              {formMessage && (

                <div
                  className={`p-3 rounded-xl text-sm text-center font-medium ${
                    formMessageType === "success"
                      ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900"
                      : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900"
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
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm transition"
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