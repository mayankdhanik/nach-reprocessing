import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import FileUpload from "./components/FileUpload";
import TransactionTable from "./components/TransactionTables";
import SearchFilter from "./components/SearchFilter";
import { nachAPI, mockData } from "./services/api";
import {
  filterTransactions,
  sortTransactions,
  calculateStats,
  showNotification,
} from "./utils/helpers";
import "./styles/index.css";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [filters, setFilters] = useState({
    status: "ALL",
    fileType: "ALL",
    search: "",
    dateFrom: "",
    dateTo: "",
  });
  const [sortConfig, setSortConfig] = useState({
    field: "processedDate",
    direction: "desc",
  });
  const [stats, setStats] = useState({});
  const [useMockData, setUseMockData] = useState(true); // Toggle for development

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  // Update filtered transactions when transactions or filters change
  useEffect(() => {
    const filtered = filterTransactions(transactions, filters);
    const sorted = sortTransactions(
      filtered,
      sortConfig.field,
      sortConfig.direction
    );
    setFilteredTransactions(sorted);
    setStats(calculateStats(sorted));
  }, [transactions, filters, sortConfig]);

  // Load transactions from API or mock data
  const loadTransactions = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        // Use mock data for development
        setTimeout(() => {
          setTransactions(mockData.transactions);
          setLoading(false);
          showNotification("Mock data loaded successfully", "success");
        }, 1000);
      } else {
        // Use real API
        const response = await nachAPI.getAllTransactions();
        setTransactions(response.data);
        showNotification("Transactions loaded successfully", "success");
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      showNotification("Failed to load transactions", "error");
      // Fallback to mock data
      setTransactions(mockData.transactions);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      if (useMockData) {
        // Simulate file upload with mock data
        setTimeout(() => {
          const newTransactions = [
            ...transactions,
            {
              id: transactions.length + 1,
              txnRefNo: `BDBL${Date.now()}`,
              mandateId: `BDBLNACH${Date.now()}`,
              fileName: file.name,
              accountNo: "20300000015701",
              amount: 1500.0,
              status: "SUCCESS",
              errorCode: null,
              errorDesc: null,
              processedDate: new Date().toISOString().split("T")[0],
              batchNo: "AB05",
              fileType: file.name.includes("DR") ? "DR" : "CR",
            },
          ];
          setTransactions(newTransactions);
          setUploading(false);
          showNotification(
            `File "${file.name}" uploaded successfully`,
            "success"
          );
        }, 2000);
      } else {
        // Use real API
        const response = await nachAPI.uploadFile(file);
        showNotification(response.data.message, "success");
        await loadTransactions(); // Refresh transactions
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showNotification("Failed to upload file", "error");
      setUploading(false);
    }
  };

  // Handle transaction selection
  const handleTransactionSelect = (transactionId) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  // Handle select all transactions
  const handleSelectAllTransactions = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map((txn) => txn.id));
    }
  };

  // Handle reprocess selected transactions
  const handleReprocessTransactions = async () => {
    if (selectedTransactions.length === 0) {
      showNotification("Please select transactions to reprocess", "warning");
      return;
    }

    setReprocessing(true);
    try {
      if (useMockData) {
        // Simulate reprocessing with mock data
        setTimeout(() => {
          const updatedTransactions = transactions.map((txn) =>
            selectedTransactions.includes(txn.id)
              ? {
                  ...txn,
                  status: "REPROCESSED",
                  errorCode: null,
                  errorDesc: null,
                }
              : txn
          );
          setTransactions(updatedTransactions);
          setSelectedTransactions([]);
          showNotification(
            `${selectedTransactions.length} transactions reprocessed successfully`,
            "success"
          );
          setReprocessing(false);
        }, 2000);
      } else {
        // Use real API
        const response = await nachAPI.reprocessTransactions(
          selectedTransactions
        );
        showNotification(response.data.message, "success");
        setSelectedTransactions([]);
        await loadTransactions(); // Refresh transactions
      }
    } catch (error) {
      console.error("Error reprocessing transactions:", error);
      showNotification("Failed to reprocess transactions", "error");
      setReprocessing(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Handle sort changes
  const handleSortChange = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    loadTransactions();
    setSelectedTransactions([]);
    setFilters({
      status: "ALL",
      fileType: "ALL",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                NACH Reprocessing System
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and reprocess NACH transaction files
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Development Mode Toggle */}
              <div className="flex items-center">
                <label className="text-sm text-gray-600 mr-2">Mock Data:</label>
                <button
                  onClick={() => setUseMockData(!useMockData)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useMockData ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useMockData ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary flex items-center"
              >
                {loading ? <div className="spinner mr-2"></div> : null}
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Dashboard Stats */}
          <Dashboard stats={stats} loading={loading} />

          {/* File Upload Section */}
          <FileUpload onFileUpload={handleFileUpload} uploading={uploading} />

          {/* Search and Filter Section */}
          <SearchFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            transactionCount={filteredTransactions.length}
            totalCount={transactions.length}
          />

          {/* Action Bar */}
          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAllTransactions}
                  className="btn-secondary text-sm"
                  disabled={filteredTransactions.length === 0}
                >
                  {selectedTransactions.length ===
                    filteredTransactions.length &&
                  filteredTransactions.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedTransactions.length} of {filteredTransactions.length}{" "}
                  selected
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReprocessTransactions}
                  disabled={selectedTransactions.length === 0 || reprocessing}
                  className={`flex items-center space-x-2 ${
                    selectedTransactions.length === 0 || reprocessing
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "btn-success"
                  } px-4 py-2 rounded-lg font-medium transition-colors`}
                >
                  {reprocessing ? (
                    <>
                      <div className="spinner"></div>
                      <span>Reprocessing...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Reprocess Selected</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <TransactionTable
            transactions={filteredTransactions}
            selectedTransactions={selectedTransactions}
            onTransactionSelect={handleTransactionSelect}
            onSelectAll={handleSelectAllTransactions}
            onSort={handleSortChange}
            sortConfig={sortConfig}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
