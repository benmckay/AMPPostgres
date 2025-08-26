// Chart.js configuration and initialization
class ChartManager {
    constructor() {
        this.charts = {};
        this.chartConfigs = this.getChartConfigs();
        this.initializeCharts();
    }

    // Get all chart configurations
    getChartConfigs() {
        return {
            // Monthly trend line chart
            trendChart: {
                type: 'line',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: '#667eea',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            },

            // Status distribution doughnut chart
            statusChart: {
                type: 'doughnut',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: {
                                    size: 12
                                },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map((label, i) => {
                                            const value = data.datasets[0].data[i];
                                            return {
                                                text: `${label} (${value}%)`,
                                                fillStyle: data.datasets[0].backgroundColor[i],
                                                strokeStyle: data.datasets[0].backgroundColor[i],
                                                pointStyle: 'circle',
                                                hidden: false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed}%`;
                                }
                            }
                        }
                    }
                }
            },

            // Request types doughnut chart
            typesChart: {
                type: 'doughnut',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: {
                                    size: 12
                                },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map((label, i) => {
                                            const value = data.datasets[0].data[i];
                                            return {
                                                text: `${label} (${value}%)`,
                                                fillStyle: data.datasets[0].backgroundColor[i],
                                                strokeStyle: data.datasets[0].backgroundColor[i],
                                                pointStyle: 'circle',
                                                hidden: false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed}%`;
                                }
                            }
                        }
                    }
                }
            },

            // Department bar chart
            departmentChart: {
                type: 'bar',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            },

            // Performance combo chart
            performanceChart: {
                type: 'bar',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.dataset.yAxisID === 'y1') {
                                        label += context.parsed.y + '%';
                                    } else {
                                        label += context.parsed.y + 'h';
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Processing Time (hours)',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Approval Rate (%)',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    // Initialize all charts
    initializeCharts() {
        // Set Chart.js defaults
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = '#4a5568';
        Chart.defaults.borderColor = 'rgba(0,0,0,0.1)';

        // Initialize each chart
        this.createTrendChart();
        this.createStatusChart();
        this.createTypesChart();
        this.createDepartmentChart();
        this.createPerformanceChart();
    }

    // Create monthly trend chart
    createTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const data = dashboardData.monthlyTrend;
        this.charts.trendChart = new Chart(ctx, {
            ...this.chartConfigs.trendChart,
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Total Requests',
                    data: data.totalRequests,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }, {
                    label: 'Approved Requests',
                    data: data.approvedRequests,
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#38a169',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            }
        });
    }

    // Create status distribution chart
    createStatusChart() {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        const data = dashboardData.statusDistribution;
        this.charts.statusChart = new Chart(ctx, {
            ...this.chartConfigs.statusChart,
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.colors,
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff'
                }]
            }
        });
    }

    // Create request types chart
    createTypesChart() {
        const ctx = document.getElementById('typesChart');
        if (!ctx) return;

        const data = dashboardData.requestTypes;
        this.charts.typesChart = new Chart(ctx, {
            ...this.chartConfigs.typesChart,
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.colors,
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff'
                }]
            }
        });
    }

    // Create department chart
    createDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;

        const data = dashboardData.departmentData;
        this.charts.departmentChart = new Chart(ctx, {
            ...this.chartConfigs.departmentChart,
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Total Requests',
                    data: data.totalRequests,
                    backgroundColor: '#667eea',
                    borderRadius: 4,
                    borderSkipped: false
                }, {
                    label: 'Approved Requests',
                    data: data.approvedRequests,
                    backgroundColor: '#38a169',
                    borderRadius: 4,
                    borderSkipped: false
                }]
            }
        });
    }

    // Create performance chart
    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        const data = dashboardData.performanceData;
        this.charts.performanceChart = new Chart(ctx, {
            ...this.chartConfigs.performanceChart,
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Processing Time (hours)',
                    data: data.processingTime,
                    backgroundColor: '#667eea',
                    yAxisID: 'y',
                    borderRadius: 4,
                    borderSkipped: false
                }, {
                    label: 'Approval Rate (%)',
                    data: data.approvalRate,
                    type: 'line',
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    pointBackgroundColor: '#38a169',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: false
                }]
            }
        });
    }

    // Update charts with new data
    updateCharts(newData) {
        // Update trend chart
        if (this.charts.trendChart && newData.monthlyTrend) {
            this.charts.trendChart.data.labels = newData.monthlyTrend.labels;
            this.charts.trendChart.data.datasets[0].data = newData.monthlyTrend.totalRequests;
            this.charts.trendChart.data.datasets[1].data = newData.monthlyTrend.approvedRequests;
            this.charts.trendChart.update();
        }

        // Update status chart
        if (this.charts.statusChart && newData.statusDistribution) {
            this.charts.statusChart.data.labels = newData.statusDistribution.labels;
            this.charts.statusChart.data.datasets[0].data = newData.statusDistribution.data;
            this.charts.statusChart.update();
        }

        // Update types chart
        if (this.charts.typesChart && newData.requestTypes) {
            this.charts.typesChart.data.labels = newData.requestTypes.labels;
            this.charts.typesChart.data.datasets[0].data = newData.requestTypes.data;
            this.charts.typesChart.update();
        }

        // Update department chart
        if (this.charts.departmentChart && newData.departmentData) {
            const deptStats = dataManager.getDepartmentStats();
            this.charts.departmentChart.data.labels = deptStats.map(d => d.department);
            this.charts.departmentChart.data.datasets[0].data = deptStats.map(d => d.total);
            this.charts.departmentChart.data.datasets[1].data = deptStats.map(d => d.approved);
            this.charts.departmentChart.update();
        }
    }

    // Destroy all charts
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    // Resize charts
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartManager };
}