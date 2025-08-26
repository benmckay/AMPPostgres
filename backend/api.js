const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'access_request_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
const validateDateRange = (req, res, next) => {
    const { startDate, endDate } = req.query;
    
    if (startDate && !isValidDate(startDate)) {
        return res.status(400).json({ error: 'Invalid start date format' });
    }
    
    if (endDate && !isValidDate(endDate)) {
        return res.status(400).json({ error: 'Invalid end date format' });
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: 'Start date cannot be after end date' });
    }
    
    next();
};

const isValidDate = (dateString) => {
    return !isNaN(Date.parse(dateString));
};

// API Routes

// Dashboard metrics endpoint
app.get('/api/dashboard/metrics', validateDateRange, asyncHandler(async (req, res) => {
    const { startDate, endDate, department, system } = req.query;
    
    let query = `
        SELECT 
            COUNT(*) as total_requests,
            COUNT(*) FILTER (WHERE status = 'Pending') as pending_requests,
            COUNT(*) FILTER (WHERE status = 'Approved') as approved_requests,
            COUNT(*) FILTER (WHERE status = 'Rejected') as rejected_requests,
            COUNT(*) FILTER (WHERE status = 'Cancelled') as cancelled_requests,
            ROUND(AVG(processing_time_hours), 2) as avg_processing_time,
            ROUND(
                (COUNT(*) FILTER (WHERE status = 'Approved')::numeric / 
                 NULLIF(COUNT(*) FILTER (WHERE status IN ('Approved', 'Rejected')), 0) * 100), 
                2
            ) as approval_rate,
            ROUND(
                (COUNT(*) FILTER (WHERE sla_met = true)::numeric / 
                 NULLIF(COUNT(*) FILTER (WHERE status IN ('Approved', 'Rejected', 'Cancelled')), 0) * 100), 
                2
            ) as sla_met_rate
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN systems s ON ar.system_id = s.id
        WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (startDate) {
        query += ` AND ar.submitted_at >= $${++paramCount}`;
        params.push(startDate);
    }
    
    if (endDate) {
        query += ` AND ar.submitted_at <= $${++paramCount}`;
        params.push(endDate + ' 23:59:59');
    }
    
    if (department && department !== 'All') {
        query += ` AND d.name = $${++paramCount}`;
        params.push(department);
    }
    
    if (system && system !== 'All') {
        query += ` AND s.name = $${++paramCount}`;
        params.push(system);
    }
    
    const result = await pool.query(query, params);
    const metrics = result.rows[0];
    
    // Calculate previous period metrics for comparison
    const prevPeriodQuery = query.replace('WHERE 1=1', 'WHERE 1=1');
    // Add logic for previous period comparison here
    
    res.json({
        current: metrics,
        // previous: prevMetrics, // Would calculate previous period
        timestamp: new Date().toISOString()
    });
}));

// Monthly trend data endpoint
app.get('/api/dashboard/monthly-trend', validateDateRange, asyncHandler(async (req, res) => {
    const { startDate, endDate, department, system } = req.query;
    
    let query = `
        SELECT 
            TO_CHAR(DATE_TRUNC('month', ar.submitted_at), 'Mon') as month,
            DATE_TRUNC('month', ar.submitted_at) as month_date,
            COUNT(*) as total_requests,
            COUNT(*) FILTER (WHERE ar.status = 'Approved') as approved_requests,
            COUNT(*) FILTER (WHERE ar.status = 'Rejected') as rejected_requests,
            COUNT(*) FILTER (WHERE ar.status = 'Pending') as pending_requests,
            ROUND(AVG(ar.processing_time_hours), 2) as avg_processing_time
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN systems s ON ar.system_id = s.id
        WHERE ar.submitted_at >= CURRENT_DATE - INTERVAL '12 months'
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (startDate) {
        query += ` AND ar.submitted_at >= $${++paramCount}`;
        params.push(startDate);
    }
    
    if (endDate) {
        query += ` AND ar.submitted_at <= $${++paramCount}`;
        params.push(endDate + ' 23:59:59');
    }
    
    if (department && department !== 'All') {
        query += ` AND d.name = $${++paramCount}`;
        params.push(department);
    }
    
    if (system && system !== 'All') {
        query += ` AND s.name = $${++paramCount}`;
        params.push(system);
    }
    
    query += ` GROUP BY DATE_TRUNC('month', ar.submitted_at) ORDER BY month_date`;
    
    const result = await pool.query(query, params);
    
    res.json({
        data: result.rows,
        timestamp: new Date().toISOString()
    });
}));

// Status distribution endpoint
app.get('/api/dashboard/status-distribution', validateDateRange, asyncHandler(async (req, res) => {
    const { startDate, endDate, department, system } = req.query;
    
    let query = `
        SELECT 
            ar.status,
            COUNT(*) as count,
            ROUND((COUNT(*)::numeric / SUM(COUNT(*)) OVER()) * 100, 2) as percentage
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN systems s ON ar.system_id = s.id
        WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (startDate) {
        query += ` AND ar.submitted_at >= $${++paramCount}`;
        params.push(startDate);
    }
    
    if (endDate) {
        query += ` AND ar.submitted_at <= $${++paramCount}`;
        params.push(endDate + ' 23:59:59');
    }
    
    if (department && department !== 'All') {
        query += ` AND d.name = $${++paramCount}`;
        params.push(department);
    }
    
    if (system && system !== 'All') {
        query += ` AND s.name = $${++paramCount}`;
        params.push(system);
    }
    
    query += ` GROUP BY ar.status ORDER BY count DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
        data: result.rows,
        timestamp: new Date().toISOString()
    });
}));

// Request types distribution endpoint
app.get('/api/dashboard/request-types', validateDateRange, asyncHandler(async (req, res) => {
    const { startDate, endDate, department, system } = req.query;
    
    let query = `
        SELECT 
            ar.request_type,
            COUNT(*) as count,
            ROUND((COUNT(*)::numeric / SUM(COUNT(*)) OVER()) * 100, 2) as percentage
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN systems s ON ar.system_id = s.id
        WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (startDate) {
        query += ` AND ar.submitted_at >= $${++paramCount}`;
        params.push(startDate);
    }
    
    if (endDate) {
        query += ` AND ar.submitted_at <= $${++paramCount}`;
        params.push(endDate + ' 23:59:59');
    }
    
    if (department && department !== 'All') {
        query += ` AND d.name = $${++paramCount}`;
        params.push(department);
    }
    
    if (system && system !== 'All') {
        query += ` AND s.name = $${++paramCount}`;
        params.push(system);
    }
    
    query += ` GROUP BY ar.request_type ORDER BY count DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
        data: result.rows,
        timestamp: new Date().toISOString()
    });
}));

// Department performance endpoint
app.get('/api/dashboard/department-performance', validateDateRange, asyncHandler(async (req, res) => {
    const { startDate, endDate, system } = req.query;
    
    let query = `
        SELECT 
            d.name as department_name,
            d.code as department_code,
            COUNT(ar.*) as total_requests,
            COUNT(*) FILTER (WHERE ar.status = 'Approved') as approved_requests,
            COUNT(*) FILTER (WHERE ar.status = 'Rejected') as rejected_requests,
            COUNT(*) FILTER (WHERE ar.status = 'Pending') as pending_requests,
            ROUND(AVG(ar.processing_time_hours), 2) as avg_processing_time,
            ROUND(
                (COUNT(*) FILTER (WHERE ar.status = 'Approved')::numeric / 
                 NULLIF(COUNT(*) FILTER (WHERE ar.status IN ('Approved', 'Rejected')), 0) * 100), 
                2
            ) as approval_rate
        FROM departments d
        LEFT JOIN access_requests ar ON d.id = ar.department_id
        LEFT JOIN systems s ON ar.system_id = s.id
        WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (startDate) {
        query += ` AND (ar.submitted_at >= $${++paramCount} OR ar.submitted_at IS NULL)`;
        params.push(startDate);
    }
    
    if (endDate) {
        query += ` AND (ar.submitted_at <= $${++paramCount} OR ar.submitted_at IS NULL)`;
        params.push(endDate + ' 23:59:59');
    }
    
    if (system && system !== 'All') {
        query += ` AND (s.name = $${++paramCount} OR s.name IS NULL)`;
        params.push(system);
    }
    
    query += ` GROUP BY d.id, d.name, d.code ORDER BY total_requests DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
        data: result.rows,
        timestamp: new Date().toISOString()
    });
}));

// Performance metrics endpoint
app.get('/api/dashboard/performance', validateDateRange, asyncHandler(async (req, res) => {
    const { startDate, endDate, department, system } = req.query;
    
    let query = `
        SELECT 
            TO_CHAR(DATE_TRUNC('month', ar.submitted_at), 'Mon') as month,
            DATE_TRUNC('month', ar.submitted_at) as month_date,
            ROUND(AVG(ar.processing_time_hours), 2) as avg_processing_time,
            ROUND(
                (COUNT(*) FILTER (WHERE ar.status = 'Approved')::numeric / 
                 NULLIF(COUNT(*) FILTER (WHERE ar.status IN ('Approved', 'Rejected')), 0) * 100), 
                2
            ) as approval_rate,
            ROUND(
                (COUNT(*) FILTER (WHERE ar.sla_met = true)::numeric / 
                 NULLIF(COUNT(*) FILTER (WHERE ar.status IN ('Approved', 'Rejected', 'Cancelled')), 0) * 100), 
                2
            ) as sla_met_rate
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN systems s ON ar.system_id = s.id
        WHERE ar.submitted_at >= CURRENT_DATE - INTERVAL '12 months'
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (startDate) {
        query += ` AND ar.submitted_at >= $${++paramCount}`;
        params.push(startDate);
    }
    
    if (endDate) {
        query += ` AND ar.submitted_at <= $${++paramCount}`;
        params.push(endDate + ' 23:59:59');
    }
    
    if (department && department !== 'All') {
        query += ` AND d.name = $${++paramCount}`;
        params.push(department);
    }
    
    if (system && system !== 'All') {
        query += ` AND s.name = $${++paramCount}`;
        params.push(system);
    }
    
    query += ` GROUP BY DATE_TRUNC('month', ar.submitted_at) ORDER BY month_date`;
    
    const result = await pool.query(query, params);
    
    res.json({
        data: result.rows,
        timestamp: new Date().toISOString()
    });
}));

// Access requests list endpoint with pagination
app.get('/api/requests', validateDateRange, asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        startDate, 
        endDate, 
        department, 
        system, 
        status,
        sortBy = 'submitted_at',
        sortOrder = 'DESC'
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Validate sort parameters
    const allowedSortFields = ['request_id', 'submitted_at', 'status', 'processing_time_hours'];
    const allowedSortOrders = ['ASC', 'DESC'];
    
    if (!allowedSortFields.includes(sortBy)) {
        return res.status(400).json({ error: 'Invalid sort field' });
    }
    
    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid sort order' });
    }
    
    let query = `
        SELECT 
            ar.request_id,
            ar.title,
            ar.status,
            ar.priority,
            ar.request_type,
            ar.processing_time_hours,
            ar.submitted_at,
            ar.completed_at,
            d.name as department_name,
            s.name as system_name,
            CONCAT(u.first_name, ' ', u.last_name) as requester_name,
            u.email as requester_email
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN systems s ON ar.system_id = s.id
        JOIN users u ON ar.requester_id = u.id
        WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (startDate) {
        query += ` AND ar.submitted_at >= $${++paramCount}`;
        params.push(startDate);
    }
    
    if (endDate) {
        query += ` AND ar.submitted_at <= $${++paramCount}`;
        params.push(endDate + ' 23:59:59');
    }
    
    if (department && department !== 'All') {
        query += ` AND d.name = $${++paramCount}`;
        params.push(department);
    }
    
    if (system && system !== 'All') {
        query += ` AND s.name = $${++paramCount}`;
        params.push(system);
    }
    
    if (status && status !== 'All') {
        query += ` AND ar.status = $${++paramCount}`;
        params.push(status);
    }
    
    // Get total count
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Add sorting and pagination
    query += ` ORDER BY ar.${sortBy} ${sortOrder.toUpperCase()}`;
    query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    res.json({
        data: result.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit))
        },
        timestamp: new Date().toISOString()
    });
}));

// Get single request details
app.get('/api/requests/:requestId', asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    
    const query = `
        SELECT 
            ar.*,
            d.name as department_name,
            s.name as system_name,
            s.description as system_description,
            CONCAT(u.first_name, ' ', u.last_name) as requester_name,
            u.email as requester_email,
            CONCAT(approver.first_name, ' ', approver.last_name) as assigned_to_name
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN systems s ON ar.system_id = s.id
        JOIN users u ON ar.requester_id = u.id
        LEFT JOIN users approver ON ar.assigned_to = approver.id
        WHERE ar.request_id = $1 OR ar.uuid::text = $1
    `;
    
    const result = await pool.query(query, [requestId]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
    }
    
    // Get comments for this request
    const commentsQuery = `
        SELECT 
            rc.*,
            CONCAT(u.first_name, ' ', u.last_name) as commenter_name
        FROM request_comments rc
        JOIN users u ON rc.user_id = u.id
        WHERE rc.request_id = $1
        ORDER BY rc.created_at ASC
    `;
    
    const commentsResult = await pool.query(commentsQuery, [result.rows[0].id]);
    
    res.json({
        request: result.rows[0],
        comments: commentsResult.rows,
        timestamp: new Date().toISOString()
    });
}));

// Create new access request
app.post('/api/requests', asyncHandler(async (req, res) => {
    const {
        requester_id,
        department_id,
        system_id,
        request_type,
        priority = 'Medium',
        title,
        description,
        business_justification,
        access_level = 'Standard',
        temporary_access = false,
        access_start_date,
        access_end_date
    } = req.body;
    
    // Validation
    if (!requester_id || !department_id || !system_id || !title || !business_justification) {
        return res.status(400).json({ 
            error: 'Missing required fields: requester_id, department_id, system_id, title, business_justification' 
        });
    }
    
    const query = `
        INSERT INTO access_requests (
            requester_id, department_id, system_id, request_type, priority,
            title, description, business_justification, access_level,
            temporary_access, access_start_date, access_end_date,
            created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
    `;
    
    const values = [
        requester_id, department_id, system_id, request_type, priority,
        title, description, business_justification, access_level,
        temporary_access, access_start_date, access_end_date,
        requester_id, requester_id
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
        message: 'Access request created successfully',
        request: result.rows[0],
        timestamp: new Date().toISOString()
    });
}));

// Update request status
app.patch('/api/requests/:requestId/status', asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status, comments, updated_by } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update request status
        const updateQuery = `
            UPDATE access_requests 
            SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
            WHERE request_id = $3 OR uuid::text = $3
            RETURNING *
        `;
        
        const result = await client.query(updateQuery, [status, updated_by, requestId]);
        
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Request not found' });
        }
        
        // Add comment if provided
        if (comments) {
            const commentQuery = `
                INSERT INTO request_comments (request_id, user_id, comment_type, comment)
                VALUES ($1, $2, $3, $4)
            `;
            
            await client.query(commentQuery, [
                result.rows[0].id, 
                updated_by, 
                status === 'Approved' ? 'Approval' : status === 'Rejected' ? 'Rejection' : 'General',
                comments
            ]);
        }
        
        await client.query('COMMIT');
        
        res.json({
            message: 'Request status updated successfully',
            request: result.rows[0],
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}));

// Get filter options (departments, systems, statuses)
app.get('/api/filter-options', asyncHandler(async (req, res) => {
    const departmentsQuery = 'SELECT id, name, code FROM departments WHERE is_active = true ORDER BY name';
    const systemsQuery = 'SELECT id, name, code FROM systems WHERE is_active = true ORDER BY name';
    
    const [departments, systems] = await Promise.all([
        pool.query(departmentsQuery),
        pool.query(systemsQuery)
    ]);
    
    res.json({
        departments: departments.rows,
        systems: systems.rows,
        statuses: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        requestTypes: ['System Access', 'Account Management', 'Data Reporting', 'Miscellaneous'],
        priorities: ['Low', 'Medium', 'High', 'Critical'],
        timestamp: new Date().toISOString()
    });
}));

// Export data endpoint
app.get('/api/export', validateDateRange, asyncHandler(async (req, res) => {
    const { format = 'csv', startDate, endDate, department, system } = req.query;
    
    if (!['csv', 'json'].includes(format)) {
        return res.status(400).json({ error: 'Invalid format. Use csv or json' });
    }
    
    let query = `
        SELECT 
            ar.request_id,
            ar.title,
            ar.status,
            ar.priority,
            ar.request_type,
            ar.processing_time_hours,
            ar.submitted_at,
            ar.completed_at,
            d.name as department_name,
            s.name as system_name,
            CONCAT(u.first_name, ' ', u.last_name) as requester_name
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN systems s ON ar.system_id = s.id
        JOIN users u ON ar.requester_id = u.id
        WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (startDate) {
        query += ` AND ar.submitted_at >= $${++paramCount}`;
        params.push(startDate);
    }
    
    if (endDate) {
        query += ` AND ar.submitted_at <= $${++paramCount}`;
        params.push(endDate + ' 23:59:59');
    }
    
    if (department && department !== 'All') {
        query += ` AND d.name = $${++paramCount}`;
        params.push(department);
    }
    
    if (system && system !== 'All') {
        query += ` AND s.name = $${++paramCount}`;
        params.push(system);
    }
    
    query += ` ORDER BY ar.submitted_at DESC`;
    
    const result = await pool.query(query, params);
    
    if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=access_requests.json');
        res.json(result.rows);
    } else {
        // CSV format
        const csvHeader = 'Request ID,Title,Status,Priority,Type,Processing Time (hours),Submitted At,Completed At,Department,System,Requester\n';
        const csvData = result.rows.map(row => 
            `"${row.request_id}","${row.title}","${row.status}","${row.priority}","${row.request_type}","${row.processing_time_hours || ''}","${row.submitted_at}","${row.completed_at || ''}","${row.department_name}","${row.system_name}","${row.requester_name}"`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=access_requests.csv');
        res.send(csvHeader + csvData);
    }
}));

// Health check endpoint
app.get('/api/health', asyncHandler(async (req, res) => {
    const dbCheck = await pool.query('SELECT 1');
    
    res.json({
        status: 'healthy',
        database: dbCheck.rows.length > 0 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
}));

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    
    if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Resource already exists' });
    }
    
    if (error.code === '23503') { // Foreign key constraint violation
        return res.status(400).json({ error: 'Invalid reference to related resource' });
    }
    
    if (error.code === '22P02') { // Invalid input syntax
        return res.status(400).json({ error: 'Invalid input format' });
    }
    
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Access Request Dashboard API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;