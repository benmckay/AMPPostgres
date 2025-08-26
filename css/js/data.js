// Sample data for the dashboard
const dashboardData = {
    // Sample requests data
    requests: [
        { id: 'REQ-2023-001', department: 'IT', system: 'System A', status: 'Approved', processingTime: '24h', createdAt: '2023-07-15' },
        { id: 'REQ-2023-002', department: 'Finance', system: 'Account Management', status: 'Pending', processingTime: '72h', createdAt: '2023-07-14' },
        { id: 'REQ-2023-003', department: 'Marketing', system: 'Data Reporting', status: 'Rejected', processingTime: '48h', createdAt: '2023-07-13' },
        { id: 'REQ-2023-004', department: 'Legal', system: 'System A', status: 'Approved', processingTime: '36h', createdAt: '2023-07-12' },
        { id: 'REQ-2023-005', department: 'Customer Service', system: 'Account Management', status: 'Cancelled', processingTime: '12h', createdAt: '2023-07-11' },
        { id: 'REQ-2023-006', department: 'IT', system: 'Data Reporting', status: 'Approved', processingTime: '48h', createdAt: '2023-07-10' },
        { id: 'REQ-2023-007', department: 'Finance', system: 'System A', status: 'Pending', processingTime: '96h', createdAt: '2023-07-09' },
        { id: 'REQ-2023-008', department: 'Marketing', system: 'Account Management', status: 'Approved', processingTime: '24h', createdAt: '2023-07-08' },
        { id: 'REQ-2023-009', department: 'IT', system: 'System A', status: 'Approved', processingTime: '18h', createdAt: '2023-07-07' },
        { id: 'REQ-2023-010', department: 'Legal', system: 'Data Reporting', status: 'Pending', processingTime: '60h', createdAt: '2023-07-06' },
        { id: 'REQ-2023-011', department: 'Finance', system: 'Account Management', status: 'Rejected', processingTime: '84h', createdAt: '2023-07-05' },
        { id: 'REQ-2023-012', department: 'Customer Service', system: 'System A', status: 'Approved', processingTime: '30h', createdAt: '2023-07-04' }
    ],

    // Monthly trend data
    monthlyTrend: {
        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        totalRequests: [320, 280, 340, 400, 380, 420, 390, 350, 410, 390],
        approvedRequests: [270, 240, 290, 340, 330, 360, 330, 300, 350, 330]
    },

    // Status distribution data
    statusDistribution: {
        labels: ['Approved', 'Pending', 'Rejected', 'Cancelled'],
        data: [55, 25, 15, 5],
        colors: ['#4299e1', '#667eea', '#9f7aea', '#a0aec0']
    },

    // Request types data
    requestTypes: {
        labels: ['System Access', 'Account Management', 'Data Reporting', 'Miscellaneous'],
        data: [40, 25, 15, 20],
        colors: ['#4299e1', '#667eea', '#9f7aea', '#a0aec0']
    },

    // Department data
    departmentData: {
        labels: ['IT', 'Finance', 'Marketing', 'Legal', 'Customer Service'],
        totalRequests: [120, 95, 80, 65, 45],
        approvedRequests: [100, 80, 68, 55, 38]
    },

    // Performance data
    performanceData: {
        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        processingTime: [70, 65, 60, 68, 72, 75, 78, 80, 82, 85],
        approvalRate: [75, 78, 80, 82, 81, 83, 84, 85, 86, 85]
    },

    // Current metrics
    metrics: {
        totalRequests: { value: '1.2K', change: '+22%', previous: '980', isPositive: true },
        pendingRequests: { value: '240', change: '+33%', previous: '180', isPositive: true },
        avgProcessingTime: { value: '48', change: '-33%', previous: '72', isPositive: true },
        approvalRate: { value: '85', change: '+10%', previous: '75', isPositive: true }
    }
};

// Data filtering and processing functions
class DataManager {
    constructor(data) {
        this.rawData = data;
        this.filteredData = { ...data };
        this.filters = {
            startDate: null,
            endDate: null,
            department: 'All',
            system: 'All'
        };
    }

    // Apply filters to the data
    applyFilters(filters = {}) {
        this.filters = { ...this.filters, ...filters };
        
        // Filter requests based on current filters
        let filteredRequests = [...this.rawData.requests];

        // Date filtering
        if (this.filters.startDate && this.filters.endDate) {
            filteredRequests = filteredRequests.filter(request => {
                const requestDate = new Date(request.createdAt);
                const startDate = new Date(this.filters.startDate);
                const endDate = new Date(this.filters.endDate);
                return requestDate >= startDate && requestDate <= endDate;
            });
        }

        // Department filtering
        if (this.filters.department && this.filters.department !== 'All') {
            filteredRequests = filteredRequests.filter(request => 
                request.department === this.filters.department
            );
        }

        // System filtering
        if (this.filters.system && this.filters.system !== 'All') {
            filteredRequests = filteredRequests.filter(request => 
                request.system === this.filters.system
            );
        }

        this.filteredData.requests = filteredRequests;
        this.updateMetrics();
        return this.filteredData;
    }

    // Update metrics based on filtered data
    updateMetrics() {
        const requests = this.filteredData.requests;
        const total = requests.length;
        const pending = requests.filter(r => r.status === 'Pending').length;
        const approved = requests.filter(r => r.status === 'Approved').length;
        
        // Calculate average processing time
        const processingTimes = requests.map(r => parseInt(r.processingTime.replace('h', '')));
        const avgTime = processingTimes.length > 0 
            ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
            : 0;

        // Calculate approval rate
        const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

        // Update metrics (in a real app, you'd compare with previous period)
        this.filteredData.metrics = {
            totalRequests: { value: total.toString(), change: '+22%', previous: '980', isPositive: true },
            pendingRequests: { value: pending.toString(), change: '+33%', previous: '180', isPositive: true },
            avgProcessingTime: { value: avgTime.toString(), change: '-33%', previous: '72', isPositive: true },
            approvalRate: { value: approvalRate.toString(), change: '+10%', previous: '75', isPositive: true }
        };
    }

    // Get department statistics
    getDepartmentStats() {
        const requests = this.filteredData.requests;
        const departments = [...new Set(requests.map(r => r.department))];
        
        return departments.map(dept => {
            const deptRequests = requests.filter(r => r.department === dept);
            const approved = deptRequests.filter(r => r.status === 'Approved').length;
            
            return {
                department: dept,
                total: deptRequests.length,
                approved: approved
            };
        });
    }

    // Get status distribution
    getStatusDistribution() {
        const requests = this.filteredData.requests;
        const statusCounts = {
            'Approved': 0,
            'Pending': 0,
            'Rejected': 0,
            'Cancelled': 0
        };

        requests.forEach(request => {
            if (statusCounts.hasOwnProperty(request.status)) {
                statusCounts[request.status]++;
            }
        });

        const total = requests.length;
        return {
            labels: Object.keys(statusCounts),
            data: Object.values(statusCounts).map(count => 
                total > 0 ? Math.round((count / total) * 100) : 0
            ),
            colors: ['#4299e1', '#667eea', '#9f7aea', '#a0aec0']
        };
    }

    // Get system distribution
    getSystemDistribution() {
        const requests = this.filteredData.requests;
        const systemCounts = {};

        requests.forEach(request => {
            systemCounts[request.system] = (systemCounts[request.system] || 0) + 1;
        });

        const total = requests.length;
        return {
            labels: Object.keys(systemCounts),
            data: Object.values(systemCounts).map(count => 
                total > 0 ? Math.round((count / total) * 100) : 0
            ),
            colors: ['#4299e1', '#667eea', '#9f7aea', '#a0aec0']
        };
    }

    // Get filtered requests for table
    getFilteredRequests(page = 1, limit = 10) {
        const start = (page - 1) * limit;
        const end = start + limit;
        
        return {
            data: this.filteredData.requests.slice(start, end),
            total: this.filteredData.requests.length,
            page,
            totalPages: Math.ceil(this.filteredData.requests.length / limit)
        };
    }

    // Export filtered data
    exportData(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.filteredData.requests, null, 2);
        } else if (format === 'csv') {
            const headers = ['Request ID', 'Department', 'System', 'Status', 'Processing Time', 'Created At'];
            const csvData = this.filteredData.requests.map(request => [
                request.id,
                request.department,
                request.system,
                request.status,
                request.processingTime,
                request.createdAt
            ]);
            
            return [headers, ...csvData].map(row => row.join(',')).join('\n');
        }
    }
}

// Initialize data manager
const dataManager = new DataManager(dashboardData);

// Utility functions for data formatting
const formatters = {
    // Format large numbers
    formatNumber: (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // Format percentage
    formatPercentage: (num) => {
        return num.toFixed(1) + '%';
    },

    // Format processing time
    formatProcessingTime: (hours) => {
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
        }
        return `${hours}h`;
    },

    // Format date
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dashboardData, DataManager, formatters };
}