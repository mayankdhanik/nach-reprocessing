package com.nach.listener;

import com.nach.util.DatabaseConnection;
import com.nach.util.ApplicationConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.ResultSet;
import java.util.Properties;
import java.io.InputStream;

/**
 * Application Context Listener - CONNECTIVITY AND VALIDATION ONLY
 * NO table creation - assumes database is already set up
 * Works with any database (Oracle, H2, MySQL, PostgreSQL, etc.)
 */
@WebListener
public class ApplicationContextListener implements ServletContextListener {
    
    private static final String APP_CONFIG_KEY = "applicationConfig";
    private static final String DB_STATUS_KEY = "databaseStatus";
    
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext context = sce.getServletContext();
        
        System.out.println("=== NACH Reprocessing System Starting ===");
        System.out.println("Note: Database tables must be created separately before starting the application");
        
        try {
            // 1. Load application configuration
            loadApplicationConfiguration(context);
            
            // 2. Test database connectivity
            testDatabaseConnectivity(context);
            
            // 3. Validate required tables exist
            validateDatabaseSchema(context);
            
            // 4. Load reference data into cache
            loadReferenceDataCache(context);
            
            // 5. Setup application directories
            setupApplicationDirectories(context);
            
            // 6. Initialize application services
            initializeApplicationServices(context);
            
            // 7. Log startup completion
            logStartupInfo(context);
            
        } catch (Exception e) {
            System.err.println("=== APPLICATION STARTUP FAILED ===");
            System.err.println("Error: " + e.getMessage());
            System.err.println("Please check:");
            System.err.println("1. Database is running and accessible");
            System.err.println("2. Database tables are created (run setup scripts)");
            System.err.println("3. Database connection properties are correct");
            System.err.println("4. Application has necessary permissions");
            e.printStackTrace();
            throw new RuntimeException("Application startup failed", e);
        }
        
        System.out.println("=== NACH Reprocessing System Started Successfully ===");
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        ServletContext context = sce.getServletContext();
        
        System.out.println("=== NACH Reprocessing System Shutting Down ===");
        
        try {
            // 1. Cleanup application services
            cleanupApplicationServices(context);
            
            // 2. Clear application cache
            clearApplicationCache(context);
            
            // 3. Log shutdown completion
            System.out.println("Application cache cleared");
            
        } catch (Exception e) {
            System.err.println("Error during application shutdown: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== NACH Reprocessing System Shutdown Complete ===");
    }
    
    /**
     * Load application configuration from properties file
     */
    private void loadApplicationConfiguration(ServletContext context) {
        try {
            Properties appProperties = new Properties();
            InputStream configStream = context.getResourceAsStream("/WEB-INF/classes/application.properties");
            
            if (configStream != null) {
                appProperties.load(configStream);
                configStream.close();
                System.out.println("✓ Application properties loaded successfully");
            } else {
                // Load default configuration
                appProperties = getDefaultConfiguration();
                System.out.println("⚠ Using default application configuration (application.properties not found)");
            }
            
            ApplicationConfig config = new ApplicationConfig(appProperties);
            context.setAttribute(APP_CONFIG_KEY, config);
            
        } catch (Exception e) {
            System.err.println("✗ Failed to load application configuration: " + e.getMessage());
            // Set default configuration as fallback
            context.setAttribute(APP_CONFIG_KEY, new ApplicationConfig(getDefaultConfiguration()));
        }
    }
    
    /**
     * Test database connectivity
     */
    private void testDatabaseConnectivity(ServletContext context) {
        try {
            System.out.println("Testing database connectivity...");
            
            // Test basic connection
            boolean connected = DatabaseConnection.testConnection();
            if (!connected) {
                throw new RuntimeException("Database connection test failed");
            }
            
            System.out.println("✓ Database connection successful");
            System.out.println("  Database Type: " + DatabaseConnection.getDatabaseType());
            System.out.println("  Environment: " + DatabaseConnection.getEnvironment());
            
            context.setAttribute(DB_STATUS_KEY, "CONNECTED");
            
        } catch (Exception e) {
            System.err.println("✗ Database connectivity test failed: " + e.getMessage());
            context.setAttribute(DB_STATUS_KEY, "FAILED");
            throw new RuntimeException("Database connectivity test failed", e);
        }
    }
    
    /**
     * Validate that all required database tables exist
     */
    private void validateDatabaseSchema(ServletContext context) {
        try {
            System.out.println("Validating database schema...");
            
            boolean tablesValid = DatabaseConnection.validateRequiredTables();
            if (!tablesValid) {
                throw new RuntimeException("Required database tables are missing. Please run database setup scripts first.");
            }
            
            System.out.println("✓ All required database tables validated successfully");
            
            // Additional validation - check if tables have data structure we expect
            validateTableStructure();
            
            System.out.println("✓ Database schema validation completed");
            
        } catch (Exception e) {
            System.err.println("✗ Database schema validation failed: " + e.getMessage());
            System.err.println("Required tables: NACH_TRANSACTIONS, NACH_FILE_UPLOADS, NACH_REPROCESS_AUDIT, NACH_ERROR_CONFIG");
            System.err.println("Please run the database setup scripts before starting the application");
            throw new RuntimeException("Database schema validation failed", e);
        }
    }
    
    /**
     * Validate table structure by checking key columns exist
     */
    private void validateTableStructure() {
        try (Connection conn = DatabaseConnection.getConnection()) {
            // Test key columns in main table
            Statement stmt = conn.createStatement();
            
            // This query will fail if essential columns don't exist
            ResultSet rs = stmt.executeQuery(
                "SELECT id, txn_ref_no, mandate_id, account_no, amount, status " +
                "FROM NACH_TRANSACTIONS WHERE 1=0"
            );
            rs.close();
            
            // Test error config table
            rs = stmt.executeQuery(
                "SELECT error_code, error_description, is_reprocessable " +
                "FROM NACH_ERROR_CONFIG WHERE 1=0"
            );
            rs.close();
            
            stmt.close();
            System.out.println("✓ Database table structure validated");
            
        } catch (SQLException e) {
            throw new RuntimeException("Database table structure validation failed. Required columns may be missing: " + e.getMessage());
        }
    }
    
    /**
     * Load reference data into application cache
     */
    private void loadReferenceDataCache(ServletContext context) {
        try {
            System.out.println("Loading reference data into cache...");
            
            // Load error configurations into cache for quick access
            loadErrorConfigCache(context);
            
            System.out.println("✓ Reference data loaded into cache");
            
        } catch (Exception e) {
            System.err.println("⚠ Failed to load reference data cache: " + e.getMessage());
            // Non-critical error - application can still work without cache
        }
    }
    
    /**
     * Load error configurations into memory cache
     */
    private void loadErrorConfigCache(ServletContext context) {
        try (Connection conn = DatabaseConnection.getConnection()) {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(
                "SELECT error_code, error_description, is_reprocessable, retry_count " +
                "FROM NACH_ERROR_CONFIG ORDER BY error_code"
            );
            
            java.util.Map<String, java.util.Map<String, Object>> errorConfigCache = new java.util.HashMap<>();
            int count = 0;
            
            while (rs.next()) {
                String errorCode = rs.getString("error_code");
                java.util.Map<String, Object> config = new java.util.HashMap<>();
                config.put("description", rs.getString("error_description"));
                config.put("reprocessable", rs.getBoolean("is_reprocessable"));
                config.put("retryCount", rs.getInt("retry_count"));
                
                errorConfigCache.put(errorCode, config);
                count++;
            }
            
            context.setAttribute("errorConfigCache", errorConfigCache);
            rs.close();
            stmt.close();
            
            System.out.println("  ✓ Error configuration cache loaded: " + count + " entries");
            
        } catch (SQLException e) {
            System.err.println("  ✗ Failed to load error config cache: " + e.getMessage());
            // Set empty cache as fallback
            context.setAttribute("errorConfigCache", new java.util.HashMap<>());
        }
    }
    
    /**
     * Setup application directories for file uploads and logs
     */
    private void setupApplicationDirectories(ServletContext context) {
        try {
            System.out.println("Setting up application directories...");
            
            ApplicationConfig config = (ApplicationConfig) context.getAttribute(APP_CONFIG_KEY);
            
            // Create upload directory
            String uploadDir = config.getUploadDirectory();
            java.io.File uploadFolder = new java.io.File(uploadDir);
            if (!uploadFolder.exists()) {
                uploadFolder.mkdirs();
                System.out.println("  ✓ Created upload directory: " + uploadDir);
            } else {
                System.out.println("  ✓ Upload directory exists: " + uploadDir);
            }
            
            // Create logs directory
            java.io.File logsFolder = new java.io.File("logs");
            if (!logsFolder.exists()) {
                logsFolder.mkdirs();
                System.out.println("  ✓ Created logs directory");
            } else {
                System.out.println("  ✓ Logs directory exists");
            }
            
            // Create temp directory for processing
            java.io.File tempFolder = new java.io.File("temp");
            if (!tempFolder.exists()) {
                tempFolder.mkdirs();
                System.out.println("  ✓ Created temp directory");
            } else {
                System.out.println("  ✓ Temp directory exists");
            }
            
        } catch (Exception e) {
            System.err.println("⚠ Failed to setup application directories: " + e.getMessage());
            // Non-critical error - application can still work
        }
    }
    
    /**
     * Initialize application services
     */
    private void initializeApplicationServices(ServletContext context) {
        try {
            System.out.println("Initializing application services...");
            
            // Initialize any background services, schedulers, etc.
            // For now, just placeholder
            
            System.out.println("✓ Application services initialized");
            
        } catch (Exception e) {
            System.err.println("⚠ Failed to initialize application services: " + e.getMessage());
            // Non-critical error
        }
    }
    
    /**
     * Log startup information
     */
    private void logStartupInfo(ServletContext context) {
        ApplicationConfig config = (ApplicationConfig) context.getAttribute(APP_CONFIG_KEY);
        
        System.out.println();
        System.out.println("=== Application Startup Information ===");
        System.out.println("Application Name: " + config.getApplicationName());
        System.out.println("Version: " + config.getVersion());
        System.out.println("Environment: " + config.getEnvironment());
        System.out.println("Database Type: " + DatabaseConnection.getDatabaseType());
        System.out.println("Database Status: " + context.getAttribute(DB_STATUS_KEY));
        System.out.println("Upload Directory: " + config.getUploadDirectory());
        System.out.println("Max Upload Size: " + (config.getMaxUploadSize() / 1024 / 1024) + " MB");
        System.out.println("Startup Time: " + new java.util.Date());
        System.out.println("==========================================");
        System.out.println();
    }
    
    /**
     * Get default configuration properties
     */
    private Properties getDefaultConfiguration() {
        Properties props = new Properties();
        props.setProperty("app.name", "NACH Reprocessing System");
        props.setProperty("app.version", "1.0.0");
        props.setProperty("app.environment", "development");
        props.setProperty("upload.max.size", "10485760"); // 10MB
        props.setProperty("upload.temp.dir", System.getProperty("java.io.tmpdir"));
        props.setProperty("upload.allowed.extensions", "txt");
        return props;
    }
    
    /**
     * Cleanup application services
     */
    private void cleanupApplicationServices(ServletContext context) {
        try {
            // Cleanup schedulers, background services, etc.
            System.out.println("Application services cleaned up");
        } catch (Exception e) {
            System.err.println("Error cleaning up application services: " + e.getMessage());
        }
    }
    
    /**
     * Clear application cache and temporary data
     */
    private void clearApplicationCache(ServletContext context) {
        try {
            context.removeAttribute(APP_CONFIG_KEY);
            context.removeAttribute(DB_STATUS_KEY);
            context.removeAttribute("errorConfigCache");
            System.out.println("Application cache cleared");
        } catch (Exception e) {
            System.err.println("Error clearing application cache: " + e.getMessage());
        }
    }
}