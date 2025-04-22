// Set active nav link based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav a.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Check if the current path starts with the link's path
        // but exclude root path for other links
        if (linkPath !== '/' && currentPath.startsWith(linkPath)) {
            link.classList.add('active');
        } else if (linkPath === '/' && currentPath === '/') {
            link.classList.add('active');
        }
    });

    // Auto-dismiss alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
}); 