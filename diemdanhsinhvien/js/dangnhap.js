import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { firebaseConfig } from "../inc/config.js";

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
    errorMsg.textContent = "";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        let fullname = "Người dùng mới";

        if (userDoc.exists()) {
            fullname = userDoc.data().fullname || fullname;
        } else {
            await setDoc(doc(db, "users", user.uid), {
                fullname: fullname,
                email: email,
                role: "admin"
            });
        }

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("fullname", fullname);
        sessionStorage.setItem("userEmail", user.email);
        
        errorMsg.style.color = "#2ecc71";
        errorMsg.textContent = "Đăng nhập thành công! Đang chuyển trang...";
        
        setTimeout(() => { window.location.href = "index.html"; }, 1000);

    } catch (error) {
        errorMsg.style.color = "#e74c3c";
        console.error("Lỗi đăng nhập:", error);
        
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            errorMsg.textContent = "Sai email hoặc mật khẩu!";
        } else {
            errorMsg.textContent = "Lỗi: " + error.message;
        }
    } finally {
        btn.textContent = "Đăng Nhập"; btn.disabled = false;
    }
});