package com.nach.servlet;

import com.nach.dao.NachTransactionDAO;
import com.nach.model.NachTransaction;
import com.google.gson.Gson;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.List;

@WebServlet("/api/nach/transactions")
public class NachTransactionServlet extends HttpServlet {
    
    private NachTransactionDAO transactionDAO = new NachTransactionDAO();
    private Gson gson = new Gson();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Enable CORS
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET");
        
        PrintWriter out = response.getWriter();
        
        try {
            List<NachTransaction> transactions = transactionDAO.getAllTransactions();
            
            // Convert to JSON-friendly format
            StringBuilder jsonBuilder = new StringBuilder("[");
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            
            for (int i = 0; i < transactions.size(); i++) {
                NachTransaction txn = transactions.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\":").append(txn.getId()).append(",")
                    .append("\"txnRefNo\":\"").append(txn.getTxnRefNo()).append("\",")
                    .append("\"mandateId\":\"").append(txn.getMandateId()).append("\",")
                    .append("\"fileName\":\"").append(txn.getFileName()).append("\",")
                    .append("\"accountNo\":\"").append(txn.getAccountNo()).append("\",")
                    .append("\"amount\":").append(txn.getAmount()).append(",")
                    .append("\"status\":\"").append(txn.getStatus()).append("\",")
                    .append("\"errorCode\":\"").append(txn.getErrorCode() != null ? txn.getErrorCode() : "").append("\",")
                    .append("\"errorDesc\":\"").append(txn.getErrorDesc() != null ? txn.getErrorDesc() : "").append("\",")
                    .append("\"processedDate\":\"").append(dateFormat.format(txn.getProcessedDate())).append("\",")
                    .append("\"batchNo\":\"").append(txn.getBatchNo() != null ? txn.getBatchNo() : "").append("\"")
                    .append("}");
            }
            jsonBuilder.append("]");
            
            out.write(jsonBuilder.toString());
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\": \"Failed to fetch transactions: " + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }
}