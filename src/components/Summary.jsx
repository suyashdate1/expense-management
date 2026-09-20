import { useEffect, useState } from "react";
import axios from "axios";

function Summary() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const expenseResponse = await axios.get(
        "http://localhost:8081/api/expenses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const budgetResponse = await axios.get(
        "http://localhost:8081/api/budget",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses(expenseResponse.data);
      setBudget(budgetResponse.data.amount);
    } catch (error) {
      console.error("Error loading summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthExpenses = expenses
    .filter((expense) => {
      const date = new Date(expense.date);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce(
      (total, expense) => total + expense.amount,
      0
    );

  const remainingBudget = budget - thisMonthExpenses;

  const numberOfMonths = new Set(
    expenses.map((expense) => {
      const date = new Date(expense.date);
      return `${date.getFullYear()}-${date.getMonth()}`;
    })
  ).size;

  const averageMonthlySpending =
    numberOfMonths > 0
      ? totalExpenses / numberOfMonths
      : 0;

  const categoryTotals = {};

  expenses.forEach((expense) => {
    categoryTotals[expense.category] =
      (categoryTotals[expense.category] || 0) +
      expense.amount;
  });

  const topCategory =
    Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    )[0] || null;

  const highestExpense =
    expenses.length > 0
      ? expenses.reduce((highest, expense) =>
          expense.amount > highest.amount
            ? expense
            : highest
        )
      : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <p className="text-slate-500 dark:text-slate-400">
          Loading summary...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">

      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Financial Summary
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Get a quick overview of your expenses and budget.
          </p>

        </div>

        {/* Summary Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Total Expenses */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Expenses
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(totalExpenses)}
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              All recorded expenses
            </p>

          </div>

          {/* This Month */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              This Month
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(thisMonthExpenses)}
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Current month's spending
            </p>

          </div>

          {/* Monthly Budget */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Monthly Budget
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(budget)}
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Your current budget
            </p>

          </div>

          {/* Remaining Budget */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Remaining Budget
            </p>

            <h2
              className={`text-2xl font-bold mt-2 ${
                remainingBudget >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(remainingBudget)}
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Budget remaining this month
            </p>

          </div>

          {/* Average Monthly Spending */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Average Monthly Spending
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(averageMonthlySpending)}
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Based on recorded expenses
            </p>

          </div>

          {/* Top Category */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Top Spending Category
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {topCategory
                ? topCategory[0]
                : "N/A"}
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {topCategory
                ? formatCurrency(topCategory[1])
                : "No expenses recorded"}
            </p>

          </div>

          {/* Highest Expense */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Highest Expense
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {highestExpense
                ? formatCurrency(
                    highestExpense.amount
                  )
                : "₹0"}
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {highestExpense
                ? highestExpense.title
                : "No expenses recorded"}
            </p>

          </div>

          {/* Total Transactions */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Transactions
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {expenses.length}
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Recorded expenses
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Summary;