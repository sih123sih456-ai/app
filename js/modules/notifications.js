// Notification System
const Notifications = {
    container: null,

    // Initialize notifications
    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.createContainer();
        }
    },

    // Create notification container if it doesn't exist
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    // Show notification
    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Create toast content
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${icon}"></i>
                <span>${Utils.sanitizeHtml(message)}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    },

    // Remove notification
    remove(toast) {
        if (toast && toast.parentNode) {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    },

    // Get icon for notification type
    getIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-bell';
        }
    },

    // Success notification
    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    },

    // Error notification
    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    },

    // Warning notification
    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    },

    // Info notification
    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    },

    // Clear all notifications
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    },

    // Show loading notification
    showLoading(message = 'Loading...') {
        const toast = this.show(message, 'info', 0);
        toast.classList.add('loading');
        return toast;
    },

    // Hide loading notification
    hideLoading(toast) {
        if (toast) {
            this.remove(toast);
        }
    }
};

// Make Notifications globally available
window.Notifications = Notifications;
