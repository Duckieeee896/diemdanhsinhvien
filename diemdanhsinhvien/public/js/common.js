async function loadComponents() {
    // Tải Navbar
    const navEl = document.getElementById('navbar-placeholder');
    if (navEl) {
        try {
            const res = await fetch('inc/navbar.html');
            navEl.innerHTML = await res.text();
            
            const fullname = sessionStorage.getItem('fullname'); // Lấy tên thật từ lúc đăng nhập
            const greetingEl = document.getElementById('nav-user-greeting');
            
            if (greetingEl && fullname) {
                greetingEl.innerHTML = `Chào mừng <strong>${fullname}</strong> ▾`;
            }
            if (greetingEl) {
                greetingEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('nav-dropdown-menu').classList.toggle('show');
                });
            }
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-dropdown')) {
                    const dropdown = document.getElementById('nav-dropdown-menu');
                    if (dropdown && dropdown.classList.contains('show')) {
                        dropdown.classList.remove('show');
                    }
                }
            });
            
            const logoutBtn = document.getElementById('logout-btn-nav');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    sessionStorage.clear();
                    window.location.href = 'dangnhap.html';
                });
            }
        } catch (e) { console.error("Lỗi tải Navbar:", e); }
    }
    const footerEl = document.getElementById('footer-placeholder');
    if (footerEl) {
        try {
            const res = await fetch('inc/footer.html');
            footerEl.innerHTML = await res.text();
        } catch (e) { console.error("Lỗi tải Footer:", e); }
    }
}

document.addEventListener('DOMContentLoaded', loadComponents);