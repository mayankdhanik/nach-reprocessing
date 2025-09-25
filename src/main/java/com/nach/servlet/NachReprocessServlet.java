package com.nach.servlet;

import com.nach.dao.NachTransactionDAO;
import com.nach.model.NachTransaction;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebServlet("/api/nach/reprocess")
public class NachReprocessServlet extends HttpServlet {
    
    private NachTransactionDAO transactionDAO = new NachTransactionDAO();
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Enable CORS
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Read request body
            StringBuilder jsonBuilder = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuilder.append(line);
            }
            
            String jsonData = jsonBuilder.toString();
            
            // Parse transaction IDs from JSON manually (simple parsing)
            List<Long> transactionIds = parseTransactionIds(jsonData);
            
            if (transactionIds.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\": \"No transaction IDs provided\"}");
                return;
            }
            
            // Get transactions to reprocess
            List<NachTransaction> transactions = transactionDAO.getTransactionsByIds(transactionIds);
            
            // Simulate reprocessing logic
            int successCount = 0;
            for (NachTransaction transaction : transactions) {
                if (reprocessTransaction(transaction)) {
                    transactionDAO.updateTransactionStatus(transaction.getId(), "REPROCESSED");
                    successCount++;
                }
            }
            
            response.setStatus(HttpServletResponse.SC_OK);
            out.write(String.format(
                "{\"message\": \"Reprocessing completed\", \"successCount\": %d, \"totalCount\": %d}",
                successCount, transactions.size()));
                
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\": \"Reprocessing failed: " + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }
    
    private List<Long> parseTransactionIds(String jsonData) {
        List<Long> ids = new ArrayList<>();
        
        // Simple regex to extract numbers from transactionIds array
        Pattern pattern = Pattern.compile("\"transactionIds\"\\s*:\\s*\\[(.*?)\\]");
        Matcher matcher = pattern.matcher(jsonData);
        
        if (matcher.find()) {
            String idsString = matcher.group(1);
            String[] idArray = idsString.split(",");
            
            for (String idStr : idArray) {
                try {
                    Long id = Long.parseLong(idStr.trim());
                    ids.add(id);
                } catch (NumberFormatException e) {
                    // Skip invalid IDs
                }
            }
        }
        
        return ids;
    }
    
    private boolean reprocessTransaction(NachTransaction transaction) {
        // Simulate reprocessing logic
        try {
            Thread.sleep(100); // Simulate processing time
            
            // Simple validation - if amount is positive and account is valid, mark as success
            if (transaction.getAmount().doubleValue() > 0 && 
                transaction.getAccountNo() != null && 
                transaction.getAccountNo().length() >= 10) {
                return true;
            }
            
            return false;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }
}