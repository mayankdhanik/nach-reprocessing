import React, { useState } from "react";
import {
  formatCurrency,
  formatDateShort,
  getStatusColorClass,
  getFileTypeBadgeColor,
  copyToClipboard,
  downloadCSV,
} from "../utils/helpers";

const TransactionTable = ({
  transactions,
  selectedTransactions,
  onTransactionSelect,
  onSelectAll,
  onSort,
  sortConfig,
  loading,
}) => {
  const [copiedField, setCopiedField] = useState(null);

  const handleSort = (field) => {
    onSort(field);
  };

  const handleCopy = async (text, fieldId) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleDownloadCSV = () => {
    if (transactions.length === 0) return;

    const csvData = transactions.map((txn) => ({
      "Transaction Ref": txn.txnRefNo,
      "Mandate ID": txn.mandateId,
      "Account Number": txn.accountNo,
      Amount: txn.amount,
      Status: txn.status,
      "Error Code": txn.errorCode || "",
      "Error Description": txn.errorDesc || "",
      "File Name": txn.fileName,
      "File Type": txn.fileType,
      "Batch Number": txn.batchNo,
      "Processed Date": txn.processedDate,
    }));

    downloadCSV(
      csvData,
      `nach-transactions-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return "↕️";
    return sortConfig.direction === "asc" ? "⬆️" : "⬇️";
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No transactions found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or upload a new file.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            📋 Transaction List
          </h2>
          <p className="text-sm text-gray-600">
            {transactions.length} transactions • {selectedTransactions.length}{" "}
            selected
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadCSV}
            className="btn-secondary text-sm flex items-center space-x-2"
            disabled={transactions.length === 0}
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header w-12">
                <input
                  type="checkbox"
                  checked={
                    selectedTransactions.length === transactions.length &&
                    transactions.length > 0
                  }
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {[
                "status",
                "txnRefNo",
                "mandateId",
                "accountNo",
                "amount",
                "processedDate",
              ].map((field) => (
                <th
                  key={field}
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(field)}
                >
                  <div className="flex items-center space-x-1">
                    <span>
                      {field.charAt(0).toUpperCase() +
                        field.slice(1).replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-xs">{getSortIcon(field)}</span>
                  </div>
                </th>
              ))}
              <th className="table-header">File Type</th>
              <th className="table-header">Error Details</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="table-row transition-colors">
                <td className="table-cell">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={() => onTransactionSelect(transaction.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="table-cell">
                  <span className={getStatusColorClass(transaction.status)}>
                    {transaction.status}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-blue-600">
                      {transaction.txnRefNo}
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          transaction.txnRefNo,
                          `txn-${transaction.id}`
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 text-xs"
                      title="Copy transaction reference"
                    >
                      {copiedField === `txn-${transaction.id}` ? "✓" : "📋"}
                    </button>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <span>{transaction.mandateId}</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          transaction.mandateId,
                          `mandate-${transaction.id}`
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 text-xs"
                      title="Copy mandate ID"
                    >
                      {copiedField === `mandate-${transaction.id}` ? "✓" : "📋"}
                    </button>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {transaction.accountNo}
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          transaction.accountNo,
                          `account-${transaction.id}`
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 text-xs"
                      title="Copy account number"
                    >
                      {copiedField === `account-${transaction.id}` ? "✓" : "📋"}
                    </button>
                  </div>
                </td>
                <td className="table-cell">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="table-cell">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeBadgeColor(
                      transaction.fileType
                    )}`}
                  >
                    {transaction.fileType}
                  </span>
                </td>
                <td className="table-cell">
                  {transaction.errorCode || transaction.errorDesc ? (
                    <div className="space-y-1">
                      {transaction.errorCode && (
                        <div className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                          {transaction.errorCode}
                        </div>
                      )}
                      {transaction.errorDesc && (
                        <div
                          className="text-xs text-gray-600 max-w-xs truncate"
                          title={transaction.errorDesc}
                        >
                          {transaction.errorDesc}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No errors</span>
                  )}
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-600">
                    {formatDateShort(transaction.processedDate)}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        alert(
                          `Transaction Details:\n${JSON.stringify(
                            transaction,
                            null,
                            2
                          )}`
                        )
                      }
                      className="text-blue-600 hover:text-blue-800 text-xs"
                      title="View details"
                    >
                      👁️
                    </button>
                    {["ERROR", "STUCK", "FAILED"].includes(
                      transaction.status
                    ) && (
                      <button
                        onClick={() => onTransactionSelect(transaction.id)}
                        className="text-green-600 hover:text-green-800 text-xs"
                        title="Select for reprocessing"
                      >
                        🔄
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div>Showing {transactions.length} transactions</div>
        <div className="flex items-center space-x-4">
          <span>
            Total Amount:{" "}
            {formatCurrency(
              transactions.reduce(
                (sum, txn) => sum + (parseFloat(txn.amount) || 0),
                0
              )
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
