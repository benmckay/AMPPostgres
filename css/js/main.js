// Main application controller
class DashboardApp {
    constructor() {
        this.chartManager = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.isLoading = false;
        
        this.initializeApp();
    }

    // Initialize the application
    initializeApp() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    // Setup the application
    setup() {
        try {
            // Initialize charts
            this.chartManager = new ChartManager();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize table
            this.updateTable();
            
            // Update metrics display
            this.updateMetrics();
            
            console.log('Dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Filter event listeners
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const departmentFilter = document.getElementById('departmentFilter');
        const systemFilter = document.getElementById('systemFilter');

        if (startDateInput) {
            startDateInput.addEventListener('change', (e) => {
                this.handleFilterChange('startDate', e.target.value);
            });
        }

        if (endDateInput) {
            endDateInput.addEventListener('change', (e) => {
                this.handleFilterChange('endDate', e.target.value);
            });
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.handleFilterChange('department', e.target.value);
            });
        }

        if (systemFilter) {
            systemFilter.addEventListener('change', (e) => {
                this.handleFilterChange('system', e.target.value);
            });
        }

        // Upload button event
        const uploadBtn = document.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', this.handleLogoUpload.bind(this));
        }

        // Window resize event for chart responsiveness
        window.addEventListener('resize', this.debounce(() => {
            if (this.chartManager) {
                this.chartManager.resizeCharts();
            }
        }, 300));

        // Table sorting (if needed)
        this.setupTableSorting();
    }

    // Handle filter changes
    handleFilterChange(filterType, value) {
        if (this.isLoading) return;

        this.showLoading(true);
        
        try {
            // Apply filters
            const filters = { [filterType]: value };
            const filteredData = dataManager.applyFilters(filters);
            
            // Update all components
            this.updateMetrics();
            this.updateTable();
            this.updateCharts();
            
            console.log(`Filter applied: ${filterType} = ${value}`);
        } catch (error) {
            console.error('Error applying filter:', error);
            this.showError('Failed to apply filter');
        } finally {
            this.showLoading(false);
        }
    }

    // Update metrics display
    updateMetrics() {
        const metrics = dataManager.filteredData.metrics;
        
        // Update total requests
        const totalElement = document.getElementById('totalRequests');
        if (totalElement && metrics.totalRequests) {
            totalElement.textContent = metrics.totalRequests.value;
        }

        // Update pending requests
        const pendingElement = document.getElementById('pendingRequests');
        if (pendingElement && metrics.pendingRequests) {
            pendingElement.textContent = metrics.pendingRequests.value;
        }

        // Update average processing time
        const avgTimeElement = document.getElementById('avgProcessingTime');
        if (avgTimeElement && metrics.avgProcessingTime) {
            avgTimeElement.textContent = metrics.avgProcessingTime.value;
        }

        // Update approval rate
        const approvalElement = document.getElementById('approvalRate');
        if (approvalElement && metrics.approvalRate) {
            approvalElement.textContent = metrics.approvalRate.value;
        }
    }

    // Update table with filtered data
    updateTable() {
        const tableBody = document.getElementById('requestTableBody');
        if (!tableBody) return;

        const paginatedData = dataManager.getFilteredRequests(this.currentPage, this.itemsPerPage);
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add new rows
        paginatedData.data.forEach(request => {
            const row = this.createTableRow(request);
            tableBody.appendChild(row);
        });

        // Update pagination if implemented
        this.updatePagination(paginatedData);
    }

    // Create a table row element
    createTableRow(request) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${this.escapeHtml(request.id)}</td>
            <td>${this.escapeHtml(request.department)}</td>
            <td>${this.escapeHtml(request.system)}</td>
            <td>
                <span class="status-badge status-${request.status.toLowerCase()}">
                    ${this.escapeHtml(request.status)}
                </span>
            </td>
            <td>${this.escapeHtml(request.processingTime)}</td>
        `;
        
        // Add click event for row details (if needed)
        row.addEventListener('click', () => {
            this.showRequestDetails(request);
        });
        
        return row;
    }

    // Update charts with filtered data
    updateCharts() {
        if (!this.chartManager) return;

        try {
            // Get updated data for charts
            const statusDistribution = dataManager.getStatusDistribution();
            const systemDistribution = dataManager.getSystemDistribution();
            
            // Update charts
            this.chartManager.updateCharts({
                statusDistribution,
                requestTypes: systemDistribution,
                departmentData: { /* would be calculated from filtered data */ }
            });
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    // Setup table sorting functionality
    setupTableSorting() {
        const headers = document.querySelectorAll('#requestsTable th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                this.sortTable(index, header.textContent.trim());
            });
        });
    }

    // Sort table by column
    sortTable(columnIndex, columnName) {
        // Implementation for table sorting
        console.log(`Sorting by column ${columnIndex}: ${columnName}`);
        // This would involve sorting the filtered data and updating the table
    }

    // Update pagination controls
    updatePagination(paginatedData) {
        // Implementation for pagination controls
        // This would create/update pagination buttons
        console.log(`Page ${paginatedData.page} of ${paginatedData.totalPages}`);
    }

    // Handle logo upload
    handleLogoUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Handle logo upload
                console.log('Logo file selected:', file.name);
                // In a real app, you'd upload this to a server
                this.showSuccess('Logo uploaded successfully');
            }
        });
        
        input.click();
    }

    // Show request details modal/popup
    showRequestDetails(request) {
        // Implementation for showing detailed request information
        console.log('Showing details for request:', request.id);
        
        // In a real app, you might show a modal with detailed information
        alert(`Request Details:\n\nID: ${request.id}\nDepartment: ${request.department}\nSystem: ${request.system}\nStatus: ${request.status}\nProcessing Time: ${request.processingTime}`);
    }

    // Show loading state
    showLoading(isLoading) {
        this.isLoading = isLoading;
        const mainContent = document.querySelector('.main-content');
        
        if (mainContent) {
            if (isLoading) {
                mainContent.classList.add('loading');
            } else {
                mainContent.classList.remove('loading');
            }
        }
    }

    // Show error message
    showError(message) {
        console.error(message);
        // In a real app, you'd show a proper error notification
        // For now, just use alert
        alert(`Error: ${message}`);
    }

    // Show success message
    showSuccess(message) {
        console.log(message);
        // In a real app, you'd show a proper success notification
        alert(`Success: ${message}`);
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Export data functionality
    exportData(format = 'csv') {
        try {
            const data = dataManager.exportData(format);
            this.downloadData(data, `access_requests.${format}`);
            this.showSuccess(`Data exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export data');
        }
    }

    // Download data as file
    downloadData(data, filename) {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Refresh dashboard data
    refreshData() {
        this.showLoading(true);
        
        // Simulate API call delay
        setTimeout(() => {
            try {
                // In a real app, you'd fetch fresh data from the server
                console.log('Refreshing dashboard data...');
                
                // Reset filters and update display
                dataManager.applyFilters({
                    startDate: null,
                    endDate: null,
                    department: 'All',
                    system: 'All'
                });
                
                this.updateMetrics();
                this.updateTable();
                this.updateCharts();
                
                // Update last updated timestamp
                const timestamp = document.querySelector('.data-updated');
                if (timestamp) {
                    const now = new Date();
                    timestamp.textContent = `Data Last Updated on | ${now.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}`;
                }
                
                this.showSuccess('Dashboard data refreshed');
            } catch (error) {
                console.error('Refresh error:', error);
                this.showError('Failed to refresh data');
            } finally {
                this.showLoading(false);
            }
        }, 1000);
    }

    // Cleanup resources
    destroy() {
        if (this.chartManager) {
            this.chartManager.destroyCharts();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.debounce);
        
        console.log('Dashboard destroyed');
    }
}

// Initialize the application when the script loads
let dashboardApp;

// Make sure all dependencies are loaded before initializing
function initializeDashboard() {
    if (typeof Chart !== 'undefined' && typeof dataManager !== 'undefined') {
        dashboardApp = new DashboardApp();
    } else {
        // Retry after a short delay if dependencies aren't ready
        setTimeout(initializeDashboard, 100);
    }
}

// Start initialization
initializeDashboard();

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardApp };
}

// Global functions that might be called from HTML
window.exportData = (format) => {
    if (dashboardApp) {
        dashboardApp.exportData(format);
    }
};

window.refreshDashboard = () => {
    if (dashboardApp) {
        dashboardApp.refreshData();
    }
};

// Handle page visibility changes to pause/resume updates
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Dashboard hidden - pausing updates');
    } else {
        console.log('Dashboard visible - resuming updates');
    }
});

// Handle beforeunload to cleanup resources
window.addEventListener('beforeunload', () => {
    if (dashboardApp) {
        dashboardApp.destroy();
    }
});