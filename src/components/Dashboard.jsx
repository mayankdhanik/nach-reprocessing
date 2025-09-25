import React from "react";
import { formatCurrency } from "../utils/helpers";

const Dashboard = ({ stats, loading }) => {
  const statCards = [
    {
      title: "Total Transactions",
      value: stats.total || 0,
      color: "bg-blue-500",
      icon: "📊",
      subtext: `Total Amount: ${formatCurrency(stats.totalAmount || 0)}`,
    },
    {
      title: "Successful",
      value: stats.success || 0,
      color: "bg-green-500",
      icon: "✅",
      subtext: `Amount: ${formatCurrency(stats.successAmount || 0)}`,
    },
    {
      title: "Failed/Error",
      value: (stats.error || 0) + (stats.failed || 0),
      color: "bg-red-500",
      icon: "❌",
      subtext: `Amount: ${formatCurrency(stats.errorAmount || 0)}`,
    },
    {
      title: "Stuck/Pending",
      value: stats.stuck || 0,
      color: "bg-yellow-500",
      icon: "⏸️",
      subtext: "Require Reprocessing",
    },
    {
      title: "Reprocessed",
      value: stats.reprocessed || 0,
      color: "bg-purple-500",
      icon: "🔄",
      subtext: "Successfully Reprocessed",
    },
  ];

  const successRate =
    stats.total > 0
      ? (
          (((stats.success || 0) + (stats.reprocessed || 0)) / stats.total) *
          100
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="card animate-pulse p-4 bg-white rounded-lg shadow"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="card hover:shadow-md transition-shadow fade-in p-4 bg-white rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{card.subtext}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-white text-xl`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {successRate}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {formatCurrency(
                (stats.successAmount || 0) + (stats.errorAmount || 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Total Value Processed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {(stats.error || 0) + (stats.stuck || 0) + (stats.failed || 0)}
            </div>
            <div className="text-sm text-gray-600">Requiring Attention</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
