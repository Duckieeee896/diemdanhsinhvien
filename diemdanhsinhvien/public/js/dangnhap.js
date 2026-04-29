import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { firebaseConfig } from "../inc/config.js";

// Nếu đã đăng nhập rồi thì cho vô thẳng trang chủ
if (sessionStorage.getItem("isLoggedIn") === "true") {
    window.location.href = "index.html";
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-message');

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const btn = e.target.querySelector('button');
    
    btn.textContent = "Đang xác thực..."; btn.disabled = true;
    errorMsg.textContent = ""; // Xóa dòng lỗi cũ (nếu có)

    try {
        // 1. Xác thực qua Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;
        
        // 2. Lấy thông tin từ Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let fullname = "Người dùng mới";

        if (userDoc.exists()) {
            fullname = userDoc.data().fullname || fullname;
        } else {
            // TỰ ĐỘNG CỨU HỘ: Nếu tạo tk bằng tay trên Firebase, tự tạo dữ liệu Firestore
            await setDoc(doc(db, "users", user.uid), {
                fullname: fullname,
                email: email,
                role: "admin"
            });
        }

        // 3. Đăng nhập thành công -> Lưu dữ liệu để hiển thị Navbar
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("fullname", fullname);
        sessionStorage.setItem("userEmail", user.email);
        
        errorMsg.style.color = "#2ecc71";
        errorMsg.textContent = "Đăng nhập thành công! Đang chuyển trang...";
        
        setTimeout(() => { window.location.href = "index.html"; }, 1000);

    } catch (error) {
        errorMsg.style.color = "#e74c3c";
        console.error("Lỗi đăng nhập:", error); // Báo lỗi chi tiết vào Console
        
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            errorMsg.textContent = "Sai email hoặc mật khẩu!";
        } else {
            errorMsg.textContent = "Lỗi: " + error.message;
        }
    } finally {
        btn.textContent = "Đăng Nhập"; btn.disabled = false;
    }
});