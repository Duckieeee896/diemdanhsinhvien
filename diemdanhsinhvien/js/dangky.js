import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { firebaseConfig } from "../inc/config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const fullname = document.getElementById('reg-fullname').value.trim();
    const dob = document.getElementById('reg-dob').value;
    const className = document.getElementById('reg-class').value.trim();
    const msgEl = document.getElementById('reg-message');

    const btn = e.target.querySelector('button');
    btn.textContent = "Đang xử lý..."; btn.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            fullname: fullname,
            dob: dob,
            className: className,
            email: email,
            role: "admin"
        });

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("fullname", fullname);
        sessionStorage.setItem("userEmail", user.email);

        msgEl.style.color = "#2ecc71";
        msgEl.textContent = "Đăng ký thành công! Đang vào trang chủ...";
        
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);

    } catch (error) {
        msgEl.style.color = "#e74c3c";
        if (error.code === 'auth/email-already-in-use') { msgEl.textContent = "Email này đã được sử dụng!"; } 
        else if (error.code === 'auth/weak-password') { msgEl.textContent = "Mật khẩu phải ít nhất 6 ký tự!"; } 
        else { msgEl.textContent = "Lỗi: " + error.message; }
    } finally {
        btn.textContent = "Đăng Ký Ngay"; btn.disabled = false;
    }
});