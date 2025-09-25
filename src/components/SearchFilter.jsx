import React, { useState } from "react";
import { debounce } from "../utils/helpers";

const SearchFilter = ({
  filters,
  onFilterChange,
  transactionCount,
  totalCount,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    onFilterChange({ search: value });
  }, 300);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    onFilterChange({
      status: "ALL",
      fileType: "ALL",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters =
    filters.status !== "ALL" ||
    filters.fileType !== "ALL" ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🔍 Search & Filter
          </h2>
          <p className="text-sm text-gray-600">
            Showing {transactionCount} of {totalCount} transactions
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="btn-secondary text-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Transactions
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search by transaction ref, mandate ID, account number..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input pl-10"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  onFilterChange({ search: "" });
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-gray-400 hover:text-gray-600">✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="form-input"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="ERROR">Error</option>
            <option value="STUCK">Stuck</option>
            <option value="FAILED">Failed</option>
            <option value="REPROCESSED">Reprocessed</option>
          </select>
        </div>

        {/* File Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Type
          </label>
          <select
            value={filters.fileType}
            onChange={(e) => handleFilterChange("fileType", e.target.value)}
            className="form-input"
          >
            <option value="ALL">All Types</option>
            <option value="DR">Debit (DR)</option>
            <option value="CR">Credit (CR)</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Second Row for Date To and Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            className="form-input"
          />
        </div>

        {/* Quick Filter Buttons */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange("status", "ERROR")}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.status === "ERROR"
                  ? "bg-red-100 text-red-800 border-red-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Errors Only
            </button>
            <button
              onClick={() => handleFilterChange("status", "STUCK")}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.status === "STUCK"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Stuck Only
            </button>
            <button
              onClick={() => handleFilterChange("status", "SUCCESS")}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.status === "SUCCESS"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Success Only
            </button>
            <button
              onClick={() => handleFilterChange("fileType", "DR")}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.fileType === "DR"
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Debit Only
            </button>
            <button
              onClick={() => handleFilterChange("fileType", "CR")}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.fileType === "CR"
                  ? "bg-purple-100 text-purple-800 border-purple-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Credit Only
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Active Filters:
            </span>
            <span className="text-xs text-gray-500">
              {transactionCount} results found
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.status !== "ALL" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange("status", "ALL")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.fileType !== "ALL" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Type: {filters.fileType}
                <button
                  onClick={() => handleFilterChange("fileType", "ALL")}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Search: "{filters.search}"
                <button
                  onClick={() => {
                    setSearchTerm("");
                    handleFilterChange("search", "");
                  }}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Date Range
                <button
                  onClick={() => {
                    handleFilterChange("dateFrom", "");
                    handleFilterChange("dateTo", "");
                  }}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
