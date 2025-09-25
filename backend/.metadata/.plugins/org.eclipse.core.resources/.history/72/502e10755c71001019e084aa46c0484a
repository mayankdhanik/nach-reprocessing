package com.nach.dao;

import com.nach.model.NachTransaction;
import com.nach.util.DatabaseConnection;
import com.nach.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Enterprise-grade DAO using Oracle stored procedures
 * All complex queries and business logic moved to database level
 * Java layer is thin - just calls stored procedures
 */
public class NachTransactionDAO {
    
    private static final Logger logger = LoggerFactory.getLogger(NachTransactionDAO.class);
    
    /**
     * Get all transactions using stored procedure
     * @return List of all transactions
     */
    public List<NachTransaction> getAllTransactions() {
        List<NachTransaction> transactions = new ArrayList<>();
        Connection conn = null;
        CallableStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_get_all_transactions(?)}");
            stmt.registerOutParameter(1, Types.REF_CURSOR);
            
            stmt.execute();
            rs = (ResultSet) stmt.getObject(1);
            
            while (rs.next()) {
                transactions.add(mapResultSetToTransaction(rs));
            }
            
            logger.info("Retrieved {} transactions using stored procedure", transactions.size());
            
        } catch (SQLException e) {
            logger.error("Error calling sp_get_all_transactions", e);
        } finally {
            DatabaseConnection.closeResources(conn, stmt, rs);
        }
        
        return transactions;
    }
    
    /**
     * Get transactions by list of IDs using stored procedure
     * @param ids List of transaction IDs
     * @return List of transactions matching the IDs
     */
    public List<NachTransaction> getTransactionsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            logger.debug("Empty or null ID list provided");
            return new ArrayList<>();
        }
        
        List<NachTransaction> transactions = new ArrayList<>();
        Connection conn = null;
        CallableStatement stmt = null;
        ResultSet rs = null;
        
        try {
            // Convert list to comma-separated string
            String idsString = String.join(",", ids.stream().map(String::valueOf).toArray(String[]::new));
            
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_get_transactions_by_ids(?, ?)}");
            stmt.setString(1, idsString);
            stmt.registerOutParameter(2, Types.REF_CURSOR);
            
            stmt.execute();
            rs = (ResultSet) stmt.getObject(2);
            
            while (rs.next()) {
                transactions.add(mapResultSetToTransaction(rs));
            }
            
            logger.info("Retrieved {} transactions for {} IDs using stored procedure", 
                       transactions.size(), ids.size());
            
        } catch (SQLException e) {
            logger.error("Error calling sp_get_transactions_by_ids for IDs: {}", ids, e);
        } finally {
            DatabaseConnection.closeResources(conn, stmt, rs);
        }
        
        return transactions;
    }
    
    /**
     * Get transactions by status using stored procedure
     * @param status Transaction status
     * @return List of transactions with the specified status
     */
    public List<NachTransaction> getTransactionsByStatus(String status) {
        List<NachTransaction> transactions = new ArrayList<>();
        Connection conn = null;
        CallableStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_get_transactions_by_status(?, ?)}");
            stmt.setString(1, status);
            stmt.registerOutParameter(2, Types.REF_CURSOR);
            
            stmt.execute();
            rs = (ResultSet) stmt.getObject(2);
            
            while (rs.next()) {
                transactions.add(mapResultSetToTransaction(rs));
            }
            
            logger.info("Retrieved {} transactions with status: {} using stored procedure", 
                       transactions.size(), status);
            
        } catch (SQLException e) {
            logger.error("Error calling sp_get_transactions_by_status for status: {}", status, e);
        } finally {
            DatabaseConnection.closeResources(conn, stmt, rs);
        }
        
        return transactions;
    }
    
    /**
     * Get reprocessable transactions using stored procedure
     * @return List of transactions that can be reprocessed
     */
    public List<NachTransaction> getReprocessableTransactions() {
        List<NachTransaction> transactions = new ArrayList<>();
        Connection conn = null;
        CallableStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_get_reprocessable_transactions(?)}");
            stmt.registerOutParameter(1, Types.REF_CURSOR);
            
            stmt.execute();
            rs = (ResultSet) stmt.getObject(1);
            
            while (rs.next()) {
                transactions.add(mapResultSetToTransaction(rs));
            }
            
            logger.info("Retrieved {} reprocessable transactions using stored procedure", 
                       transactions.size());
            
        } catch (SQLException e) {
            logger.error("Error calling sp_get_reprocessable_transactions", e);
        } finally {
            DatabaseConnection.closeResources(conn, stmt, rs);
        }
        
        return transactions;
    }
    
    /**
     * Search transactions by multiple criteria using stored procedure
     * @param searchTerm Search term (matches txn_ref_no, mandate_id, account_no)
     * @param status Status filter (null for all)
     * @param fileType File type filter (null for all)
     * @param dateFrom Start date filter (null for no limit)
     * @param dateTo End date filter (null for no limit)
     * @param limit Maximum number of results
     * @return List of matching transactions
     */
    public List<NachTransaction> searchTransactions(String searchTerm, String status, String fileType, 
                                                   Date dateFrom, Date dateTo, int limit) {
        List<NachTransaction> transactions = new ArrayList<>();
        Connection conn = null;
        CallableStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_search_transactions(?, ?, ?, ?, ?, ?, ?)}");
            
            stmt.setString(1, searchTerm);
            stmt.setString(2, status);
            stmt.setString(3, fileType);
            stmt.setDate(4, dateFrom != null ? new java.sql.Date(dateFrom.getTime()) : null);
            stmt.setDate(5, dateTo != null ? new java.sql.Date(dateTo.getTime()) : null);
            stmt.setInt(6, limit);
            stmt.registerOutParameter(7, Types.REF_CURSOR);
            
            stmt.execute();
            rs = (ResultSet) stmt.getObject(7);
            
            while (rs.next()) {
                transactions.add(mapResultSetToTransaction(rs));
            }
            
            logger.info("Search returned {} transactions using stored procedure " +
                       "(term: {}, status: {}, fileType: {}, limit: {})", 
                       transactions.size(), searchTerm, status, fileType, limit);
            
        } catch (SQLException e) {
            logger.error("Error calling sp_search_transactions", e);
        } finally {
            DatabaseConnection.closeResources(conn, stmt, rs);
        }
        
        return transactions;
    }
    
    /**
     * Get transactions by date range using stored procedure
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of transactions in the date range
     */
    public List<NachTransaction> getTransactionsByDateRange(Date startDate, Date endDate) {
        List<NachTransaction> transactions = new ArrayList<>();
        Connection conn = null;
        CallableStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_get_transactions_by_date_range(?, ?, ?)}");
            stmt.setDate(1, new java.sql.Date(startDate.getTime()));
            stmt.setDate(2, new java.sql.Date(endDate.getTime()));
            stmt.registerOutParameter(3, Types.REF_CURSOR);
            
            stmt.execute();
            rs = (ResultSet) stmt.getObject(3);
            
            while (rs.next()) {
                transactions.add(mapResultSetToTransaction(rs));
            }
            
            logger.info("Retrieved {} transactions between {} and {} using stored procedure", 
                       transactions.size(), startDate, endDate);
            
        } catch (SQLException e) {
            logger.error("Error calling sp_get_transactions_by_date_range", e);
        } finally {
            DatabaseConnection.closeResources(conn, stmt, rs);
        }
        
        return transactions;
    }
    
    /**
     * Get transaction by transaction reference number using stored procedure
     * @param txnRefNo Transaction reference number
     * @return Transaction or null if not found
     */
    public NachTransaction getTransactionByTxnRefNo(String txnRefNo) {
        Connection conn = null;
        CallableStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_get_transaction_by_ref_no(?, ?)}");
            stmt.setString(1, txnRefNo);
            stmt.registerOutParameter(2, Types.REF_CURSOR);
            
            stmt.execute();
            rs = (ResultSet) stmt.getObject(2);
            
            if (rs.next()) {
                NachTransaction transaction = mapResultSetToTransaction(rs);
                logger.debug("Found transaction with txnRefNo: {} using stored procedure", txnRefNo);
                return transaction;
            } else {
                logger.debug("No transaction found with txnRefNo: {}", txnRefNo);
                return null;
            }
            
        } catch (SQLException e) {
            logger.error("Error calling sp_get_transaction_by_ref_no for txnRefNo: {}", txnRefNo, e);
            return null;
        } finally {
            DatabaseConnection.closeResources(conn, stmt, rs);
        }
    }
    
    /**
     * Insert a new transaction using stored procedure
     * @param transaction Transaction to insert
     * @return true if successful, false otherwise
     */
    public boolean insertTransaction(NachTransaction transaction) {
        Connection conn = null;
        CallableStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_insert_transaction(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");
            
            stmt.setString(1, transaction.getTxnRefNo());
            stmt.setString(2, transaction.getMandateId());
            stmt.setString(3, transaction.getFileName());
            stmt.setString(4, transaction.getAccountNo());
            stmt.setBigDecimal(5, transaction.getAmount());
            stmt.setString(6, transaction.getStatus());
            stmt.setString(7, transaction.getErrorCode());
            stmt.setString(8, transaction.getErrorDesc());
            stmt.setString(9, transaction.getBatchNo());
            stmt.setString(10, transaction.getFileType());
            stmt.registerOutParameter(11, Types.NUMERIC); // p_success
            stmt.registerOutParameter(12, Types.VARCHAR);  // p_error_msg
            
            stmt.execute();
            
            int success = stmt.getInt(11);
            String errorMsg = stmt.getString(12);
            
            if (success == 1) {
                logger.info("Successfully inserted transaction: {} using stored procedure", 
                           transaction.getTxnRefNo());
                return true;
            } else {
                logger.warn("Failed to insert transaction: {} - Error: {}", 
                           transaction.getTxnRefNo(), errorMsg);
                return false;
            }
            
        } catch (SQLException e) {
            logger.error("Error calling sp_insert_transaction for: {}", transaction.getTxnRefNo(), e);
            return false;
        } finally {
            DatabaseConnection.closeResources(conn, stmt, null);
        }
    }
    
    /**
     * Bulk insert transactions using stored procedure (to be implemented)
     * For now, calls single insert multiple times
     * @param transactions List of transactions to insert
     * @return Number of successfully inserted transactions
     */
    public int insertTransactions(List<NachTransaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            logger.debug("Empty transaction list provided for bulk insert");
            return 0;
        }
        
        int successCount = 0;
        
        // For now, use individual inserts
        // TODO: Implement bulk insert stored procedure for better performance
        for (NachTransaction transaction : transactions) {
            if (insertTransaction(transaction)) {
                successCount++;
            }
        }
        
        logger.info("Bulk inserted {} out of {} transactions", successCount, transactions.size());
        return successCount;
    }
    
    /**
     * Update transaction status using stored procedure
     * @param id Transaction ID
     * @param status New status
     * @param errorCode Error code (can be null)
     * @param errorDesc Error description (can be null)
     * @return true if successful, false otherwise
     */
    public boolean updateTransactionStatus(Long id, String status, String errorCode, String errorDesc) {
        Connection conn = null;
        CallableStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_update_transaction_status(?, ?, ?, ?, ?, ?)}");
            
            stmt.setLong(1, id);
            stmt.setString(2, status);
            stmt.setString(3, errorCode);
            stmt.setString(4, errorDesc);
            stmt.registerOutParameter(5, Types.NUMERIC); // p_success
            stmt.registerOutParameter(6, Types.VARCHAR);  // p_error_msg
            
            stmt.execute();
            
            int success = stmt.getInt(5);
            String errorMsg = stmt.getString(6);
            
            if (success == 1) {
                logger.info("Updated transaction {} status to: {} using stored procedure", id, status);
                return true;
            } else {
                logger.warn("Failed to update transaction {} status - Error: {}", id, errorMsg);
                return false;
            }
            
        } catch (SQLException e) {
            logger.error("Error calling sp_update_transaction_status for ID: {}", id, e);
            return false;
        } finally {
            DatabaseConnection.closeResources(conn, stmt, null);
        }
    }
    
    /**
     * Update transaction status (overloaded method for backward compatibility)
     * @param id Transaction ID
     * @param status New status
     * @return true if successful, false otherwise
     */
    public boolean updateTransactionStatus(Long id, String status) {
        return updateTransactionStatus(id, status, null, null);
    }
    
    /**
     * Reprocess multiple transactions using stored procedure
     * @param ids List of transaction IDs
     * @param userId User performing the reprocessing
     * @param reason Reason for reprocessing
     * @return Number of successfully reprocessed transactions
     */
    public int reprocessTransactions(List<Long> ids, String userId, String reason) {
        if (ids == null || ids.isEmpty()) {
            logger.debug("Empty ID list provided for reprocessing");
            return 0;
        }
        
        Connection conn = null;
        CallableStatement stmt = null;
        
        try {
            // Convert list to comma-separated string
            String idsString = String.join(",", ids.stream().map(String::valueOf).toArray(String[]::new));
            
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call PKG_NACH_TRANSACTION.sp_reprocess_transactions(?, ?, ?, ?, ?)}");
            
            stmt.setString(1, idsString);
            stmt.setString(2, userId != null ? userId : "SYSTEM");
            stmt.setString(3, reason != null ? reason : "Bulk reprocessing");
            stmt.registerOutParameter(4, Types.NUMERIC); // p_success_count
            stmt.registerOutParameter(5, Types.VARCHAR);  // p_error_msg
            
            stmt.execute();
            
            int successCount = stmt.getInt(4);
            String errorMsg = stmt.getString(5);
            
            if (errorMsg != null) {
                logger.warn("Reprocessing completed with warnings: {}", errorMsg);
            }
            
            logger.info("Reprocessed {} out of {} transactions using stored procedure", 
                       successCount, ids.size());
            
            return successCount;
            
        } catch (SQLException e) {
            logger.error("Error calling sp_reprocess_transactions for IDs: {}", ids, e);
            return 0;
        } finally {
            DatabaseConnection.closeResources(conn, stmt, null);
        }
    }
    
    /**
     * Check if transaction exists using stored procedure function
     * @param txnRefNo Transaction reference number
     * @return true if exists, false otherwise
     */
    public boolean transactionExists(String txnRefNo) {
        Connection conn = null;
        CallableStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{? = call PKG_NACH_TRANSACTION.fn_transaction_exists(?)}");
            stmt.registerOutParameter(1, Types.NUMERIC);
            stmt.setString(2, txnRefNo);
            
            stmt.execute();
            
            int result = stmt.getInt(1);
            return result == 1;
            
        } catch (SQLException e) {
            logger.error("Error calling fn_transaction_exists for txnRefNo: {}", txnRefNo, e);
            return false;
        } finally {
            DatabaseConnection.closeResources(conn, stmt, null);
        }
    }
    
    /**
     * Get transaction count by status using stored procedure function
     * @param status Status to count
     * @return Number of transactions with the specified status
     */
    public int getTransactionCountByStatus(String status) {
        Connection conn = null;
        CallableStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{? = call PKG_NACH_TRANSACTION.fn_get_count_by_status(?)}");
            stmt.registerOutParameter(1, Types.NUMERIC);
            stmt.setString(2, status);
            
            stmt.execute();
            
            return stmt.getInt(1);
            
        } catch (SQLException e) {
            logger.error("Error calling fn_get_count_by_status for status: {}", status, e);
            return 0;
        } finally {
            DatabaseConnection.closeResources(conn, stmt, null);
        }
    }
    
    /**
     * Get total amount by status using stored procedure function
     * @param status Status to sum
     * @return Total amount for transactions with the specified status
     */
    public BigDecimal getTotalAmountByStatus(String status) {
        Connection conn = null;
        CallableStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{? = call PKG_NACH_TRANSACTION.fn_get_total_amount_by_status(?)}");
            stmt.registerOutParameter(1, Types.NUMERIC);
            stmt.setString(2, status);
            
            stmt.execute();
            
            BigDecimal result = stmt.getBigDecimal(1);
            return result != null ? result : BigDecimal.ZERO;
            
        } catch (SQLException e) {
            logger.error("Error calling fn_get_total_amount_by_status for status: {}", status, e);
            return BigDecimal.ZERO;
        } finally {
            DatabaseConnection.closeResources(conn, stmt, null);
        }
    }
    
    /**
     * Get dashboard statistics using stored procedure
     * @return DashboardStats object with counts and amounts
     */
    public DashboardStats getDashboardStats() {
        Connection conn = null;
        CallableStatement stmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            stmt = conn.prepareCall("{call SP_GET_DASHBOARD_STATS(?, ?, ?, ?, ?, ?)}");
            
            stmt.registerOutParameter(1, Types.NUMERIC); // success_count
            stmt.registerOutParameter(2, Types.NUMERIC); // error_count
            stmt.registerOutParameter(3, Types.NUMERIC); // stuck_count
            stmt.registerOutParameter(4, Types.NUMERIC); // failed_count
            stmt.registerOutParameter(5, Types.NUMERIC); // total_amount
            stmt.registerOutParameter(6, Types.NUMERIC); // error_amount
            
            stmt.execute();
            
            DashboardStats stats = new DashboardStats();
            stats.successCount = stmt.getInt(1);
            stats.errorCount = stmt.getInt(2);
            stats.stuckCount = stmt.getInt(3);
            stats.failedCount = stmt.getInt(4);
            stats.totalAmount = stmt.getBigDecimal(5);
            stats.errorAmount = stmt.getBigDecimal(6);
            
            logger.debug("Retrieved dashboard statistics using stored procedure");
            return stats;
            
        } catch (SQLException e) {
            logger.error("Error calling SP_GET_DASHBOARD_STATS", e);
            return new DashboardStats(); // Return empty stats on error
        } finally {
            DatabaseConnection.closeResources(conn, stmt, null);
        }
    }
    
    /**
     * Map ResultSet to NachTransaction object
     * @param rs ResultSet from database query
     * @return NachTransaction object
     * @throws SQLException if mapping fails
     */
    private NachTransaction mapResultSetToTransaction(ResultSet rs) throws SQLException {
        NachTransaction transaction = new NachTransaction();
        
        transaction.setId(rs.getLong("id"));
        transaction.setTxnRefNo(rs.getString("txn_ref_no"));
        transaction.setMandateId(rs.getString("mandate_id"));
        transaction.setFileName(rs.getString("file_name"));
        transaction.setAccountNo(rs.getString("account_no"));
        transaction.setAmount(rs.getBigDecimal("amount"));
        transaction.setStatus(rs.getString("status"));
        transaction.setErrorCode(rs.getString("error_code"));
        transaction.setErrorDesc(rs.getString("error_desc"));
        transaction.setProcessedDate(rs.getTimestamp("processed_date"));
        transaction.setBatchNo(rs.getString("batch_no"));
        transaction.setFileType(rs.getString("file_type"));
        
        // Set created_date and updated_date if available
        try {
            transaction.setCreatedDate(rs.getTimestamp("created_date"));
            transaction.setUpdatedDate(rs.getTimestamp("updated_date"));
        } catch (SQLException e) {
            // These columns might not be selected in all queries
            logger.debug("created_date or updated_date columns not available in result set");
        }
        
        return transaction;
    }
    
    /**
     * Dashboard statistics data class
     */
    public static class DashboardStats {
        public int successCount;
        public int errorCount;
        public int stuckCount;
        public int failedCount;
        public BigDecimal totalAmount = BigDecimal.ZERO;
        public BigDecimal errorAmount = BigDecimal.ZERO;
        
        public int getTotalTransactions() {
            return successCount + errorCount + stuckCount + failedCount;
        }
        
        public double getSuccessPercentage() {
            int total = getTotalTransactions();
            return total > 0 ? (successCount * 100.0 / total) : 0.0;
        }
        
        public double getErrorPercentage() {
            int total = getTotalTransactions();
            return total > 0 ? ((errorCount + stuckCount + failedCount) * 100.0 / total) : 0.0;
        }
    }
}