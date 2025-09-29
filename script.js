// Categories with emojis
const categories = [
    "🍔 Food and Groceries",
    "🚗 Transportation",
    "🏠 Rent and Household",
    "🧾 Utilities and Bills",
    "📱 Phone Recharge and Internet",
    "🎓 Education Fees and Books",
    "🖊️ Stationery and Supplies",
    "💊 Healthcare and Medicines",
    "🪒 Personal Care and Grooming",
    "👕 Clothing and Accessories",
    "🎬 Entertainment and Subscriptions",
    "🎁 Gifts and Donations",
    "💰 Savings and Investments",
    "🤷‍♂️ Miscellaneous/Others"
];

// Initialize the application
class ExpenseTracker {
    constructor() {
        this.transactions = this.loadTransactions();
        this.categoryChart = null;
        this.trendChart = null;
        this.init();
    }

    init() {
        this.populateCategories();
        this.setupEventListeners();
        this.updateDate();
        this.renderTransactions();
        this.updateSummary();
        this.renderCharts();
    }

    // Load transactions from localStorage
    loadTransactions() {
        const saved = localStorage.getItem('expenseTrackerTransactions');
        return saved ? JSON.parse(saved) : [];
    }

    // Save transactions to localStorage
    saveTransactions() {
        localStorage.setItem('expenseTrackerTransactions', JSON.stringify(this.transactions));
    }

    // Populate category dropdown
    populateCategories() {
        const categorySelect = document.getElementById('entryCategory');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // Set current date as default
    updateDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entryDate').value = today;
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById('entryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        document.getElementById('timeFrame').addEventListener('change', () => {
            this.handleFilterChange();
        });

        document.getElementById('typeFilter').addEventListener('change', () => {
            this.handleFilterChange();
        });

        document.getElementById('monthFilter').addEventListener('change', () => {
            this.handleFilterChange();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Show/hide month filter based on timeframe
        document.getElementById('timeFrame').addEventListener('change', (e) => {
            const monthContainer = document.getElementById('monthFilterContainer');
            monthContainer.style.display = e.target.value === 'monthly' ? 'flex' : 'none';
        });
    }

    // Add new transaction
    addTransaction() {
        const form = document.getElementById('entryForm');
        const formData = new FormData(form);

        const transaction = {
            id: Date.now().toString(),
            type: document.getElementById('entryType').value,
            category: document.getElementById('entryCategory').value,
            item: document.getElementById('entryItem').value,
            amount: parseFloat(document.getElementById('entryAmount').value),
            note: document.getElementById('entryNote').value,
            date: document.getElementById('entryDate').value,
            timestamp: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveTransactions();
        this.renderTransactions();
        this.updateSummary();
        this.renderCharts();
        
        form.reset();
        this.updateDate();
        
        // Show success message
        this.showToast('Transaction added successfully!', 'success');
    }

    // Delete transaction
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.renderTransactions();
            this.updateSummary();
            this.renderCharts();
            this.showToast('Transaction deleted successfully!', 'success');
        }
    }

    // Handle filter changes
    handleFilterChange() {
        this.renderTransactions();
        this.updateSummary();
        this.renderCharts();
    }

    // Get filtered transactions based on current filters
    getFilteredTransactions() {
        const timeFrame = document.getElementById('timeFrame').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const monthFilter = document.getElementById('monthFilter').value;

        let filtered = this.transactions;

        // Filter by timeframe
        const now = new Date();
        if (timeFrame === 'weekly') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(t => new Date(t.date) >= oneWeekAgo);
        } else if (timeFrame === 'monthly' && monthFilter !== 'all') {
            filtered = filtered.filter(t => new Date(t.date).getMonth() === parseInt(monthFilter));
        } else if (timeFrame === 'yearly') {
            filtered = filtered.filter(t => new Date(t.date).getFullYear() === 2025);
        }

        // Filter by type
        if (typeFilter !== 'all') {
            filtered = filtered.filter(t => t.type === typeFilter);
        }

        return filtered;
    }

    // Render transactions table
    renderTransactions() {
        const tbody = document.getElementById('transactionsBody');
        const filteredTransactions = this.getFilteredTransactions();

        if (filteredTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No transactions found</td></tr>';
            return;
        }

        tbody.innerHTML = filteredTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(transaction => `
                <tr>
                    <td>${this.formatDate(transaction.date)}</td>
                    <td><span class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span></td>
                    <td>${transaction.category}</td>
                    <td>${transaction.item}</td>
                    <td class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">₹${transaction.amount.toLocaleString('en-IN')}</td>
                    <td>${transaction.note || '-'}</td>
                    <td><button class="delete-btn" onclick="expenseTracker.deleteTransaction('${transaction.id}')">Delete</button></td>
                </tr>
            `).join('');
    }

    // Update summary cards
    updateSummary() {
        const filteredTransactions = this.getFilteredTransactions();
        
        const totalIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpense;

        document.getElementById('totalIncome').textContent = `₹${totalIncome.toLocaleString('en-IN')}`;
        document.getElementById('totalExpense').textContent = `₹${totalExpense.toLocaleString('en-IN')}`;
        document.getElementById('totalBalance').textContent = `₹${balance.toLocaleString('en-IN')}`;
    }

    // Render charts
    renderCharts() {
        this.renderCategoryChart();
        this.renderTrendChart();
    }

    // Render category distribution chart
    renderCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        const filteredTransactions = this.getFilteredTransactions();
        
        // Destroy previous chart if exists
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        const expenseData = filteredTransactions.filter(t => t.type === 'expense');
        const categoryTotals = {};

        expenseData.forEach(transaction => {
            categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        this.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56',
                        '#9966FF', '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Expenses by Category',
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    // Render trend chart
    renderTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        const filteredTransactions = this.getFilteredTransactions();
        
        // Destroy previous chart if exists
        if (this.trendChart) {
            this.trendChart.destroy();
        }

        const timeFrame = document.getElementById('timeFrame').value;
        let labels = [];
        let incomeData = [];
        let expenseData = [];

        if (timeFrame === 'weekly') {
            // Last 7 days
            labels = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(this.formatDate(date.toISOString().split('T')[0]));
            }
        } else if (timeFrame === 'monthly') {
            // All months or specific month
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        } else if (timeFrame === 'yearly') {
            // All months of 2025
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        }

        // Calculate data based on timeframe
        if (timeFrame === 'weekly') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const dayIncome = filteredTransactions
                    .filter(t => t.type === 'income' && t.date === dateStr)
                    .reduce((sum, t) => sum + t.amount, 0);
                
                const dayExpense = filteredTransactions
                    .filter(t => t.type === 'expense' && t.date === dateStr)
                    .reduce((sum, t) => sum + t.amount, 0);
                
                incomeData.push(dayIncome);
                expenseData.push(dayExpense);
            }
        } else if (timeFrame === 'monthly') {
            // Simplified weekly breakdown for monthly view
            for (let week = 1; week <= 4; week++) {
                const weekIncome = filteredTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0) / 4;
                
                const weekExpense = filteredTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0) / 4;
                
                incomeData.push(weekIncome);
                expenseData.push(weekExpense);
            }
        } else if (timeFrame === 'yearly') {
            for (let month = 0; month < 12; month++) {
                const monthIncome = filteredTransactions
                    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === month)
                    .reduce((sum, t) => sum + t.amount, 0);
                
                const monthExpense = filteredTransactions
                    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === month)
                    .reduce((sum, t) => sum + t.amount, 0);
                
                incomeData.push(monthIncome);
                expenseData.push(monthExpense);
            }
        }

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#00b09b',
                        backgroundColor: 'rgba(0, 176, 155, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Income vs Expenses Trend',
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }

    // Export to CSV
    exportToCSV() {
        const filteredTransactions = this.getFilteredTransactions();
        
        if (filteredTransactions.length === 0) {
            this.showToast('No data to export!', 'error');
            return;
        }

        const headers = ['Date', 'Type', 'Category', 'Item', 'Amount', 'Note'];
        const csvData = filteredTransactions.map(t => [
            t.date,
            t.type,
            t.category,
            t.item,
            t.amount,
            t.note || ''
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    showToast(message, type) {
        // Create toast element
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00b09b' : '#ff6b6b'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 600;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTracker();
});
