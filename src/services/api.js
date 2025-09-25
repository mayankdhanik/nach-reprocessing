import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:8080/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      "Making API request:",
      config.method?.toUpperCase(),
      config.url
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("API response received:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "API error:",
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// API endpoints
export const nachAPI = {
  // Get all transactions
  getAllTransactions: () => {
    return api.get("/nach/transactions");
  },

  // Upload NACH file
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/nach/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Reprocess selected transactions
  reprocessTransactions: (transactionIds) => {
    return api.post("/nach/reprocess", {
      transactionIds: transactionIds,
    });
  },

  // Get transaction by ID
  getTransactionById: (id) => {
    return api.get(`/nach/transactions/${id}`);
  },

  // Get transactions by status
  getTransactionsByStatus: (status) => {
    return api.get(`/nach/transactions/status/${status}`);
  },

  // Search transactions
  searchTransactions: (searchTerm) => {
    return api.get(
      `/nach/transactions/search?q=${encodeURIComponent(searchTerm)}`
    );
  },
};

// Mock data for development (when backend is not ready)
export const mockData = {
  transactions: [
    {
      id: 1,
      txnRefNo: "BDBL2024030601001",
      mandateId: "BDBLNACH00000000444012005",
      fileName: "ACH-DR-BDBL-03062024-TPZ000433633-P3FC-INW.txt",
      accountNo: "20300000015696",
      amount: 5000.0,
      status: "ERROR",
      errorCode: "E001",
      errorDesc: "Insufficient Balance",
      processedDate: "2024-03-06",
      batchNo: "AB00",
      fileType: "DR",
    },
    {
      id: 2,
      txnRefNo: "BDBL2024030601002",
      mandateId: "BDBLNACH00000000444012006",
      fileName: "ACH-DR-BDBL-03062024-TPZ000433633-P3FC-INW.txt",
      accountNo: "20300000015697",
      amount: 3000.0,
      status: "STUCK",
      errorCode: "E002",
      errorDesc: "Technical Issue",
      processedDate: "2024-03-06",
      batchNo: "AB01",
      fileType: "DR",
    },
    {
      id: 3,
      txnRefNo: "BDBL2024030601003",
      mandateId: "BDBLNACH00000000444012007",
      fileName: "ACH-CR-BDBL-03062024-TPZ000433634-P3FC-INW.txt",
      accountNo: "20300000015698",
      amount: 7500.0,
      status: "FAILED",
      errorCode: "E003",
      errorDesc: "Invalid Mandate",
      processedDate: "2024-03-06",
      batchNo: "AB02",
      fileType: "CR",
    },
    {
      id: 4,
      txnRefNo: "BDBL2024030601004",
      mandateId: "BDBLNACH00000000444012008",
      fileName: "ACH-DR-BDBL-03062024-TPZ000433635-P3FC-INW.txt",
      accountNo: "20300000015699",
      amount: 2500.0,
      status: "SUCCESS",
      errorCode: null,
      errorDesc: null,
      processedDate: "2024-03-06",
      batchNo: "AB03",
      fileType: "DR",
    },
    {
      id: 5,
      txnRefNo: "BDBL2024030601005",
      mandateId: "BDBLNACH00000000444012009",
      fileName: "ACH-CR-BDBL-03062024-TPZ000433636-P3FC-INW.txt",
      accountNo: "20300000015700",
      amount: 4500.0,
      status: "REPROCESSED",
      errorCode: null,
      errorDesc: null,
      processedDate: "2024-03-06",
      batchNo: "AB04",
      fileType: "CR",
    },
  ],

  uploadResponse: {
    message: "File uploaded successfully",
    transactionCount: 10,
    successCount: 8,
    errorCount: 2,
  },

  reprocessResponse: {
    message: "Reprocessing completed",
    successCount: 3,
    totalCount: 5,
  },
};

export default api;
