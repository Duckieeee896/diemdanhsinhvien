import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { firebaseConfig } from "../inc/config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById('profile-form');
const msgEl = document.getElementById('profile-message');
let currentUserUid = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUid = user.uid;
        document.getElementById('profile-email').value = user.email;

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                document.getElementById('profile-fullname').value = data.fullname || "";
                document.getElementById('profile-dob').value = data.dob || "";
                document.getElementById('profile-class').value = data.className || "";
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            msgEl.textContent = "Không thể tải dữ liệu hồ sơ.";
        }
    } else {
        window.location.href = 'dangnhap.html';
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUserUid) return;

    const btn = e.target.querySelector('button');
    btn.textContent = "Đang lưu..."; btn.disabled = true;

    const fullname = document.getElementById('profile-fullname').value.trim();
    const dob = document.getElementById('profile-dob').value;
    const className = document.getElementById('profile-class').value.trim();

    try {
        await updateDoc(doc(db, "users", currentUserUid), {
            fullname: fullname,
            dob: dob,
            className: className
        });

        sessionStorage.setItem("fullname", fullname);

        const greetingEl = document.getElementById('nav-user-greeting');
        if (greetingEl) {
            greetingEl.innerHTML = `Chào mừng <strong>${fullname}</strong> ▾`;
        }

        msgEl.style.color = "#2ecc71";
        msgEl.textContent = "Đã cập nhật thông tin thành công!";

        setTimeout(() => { msgEl.textContent = ""; }, 3000);

    } catch (error) {
        msgEl.style.color = "#e74c3c";
        msgEl.textContent = "Lỗi cập nhật: " + error.message;
    } finally {
        btn.textContent = "Cập nhật thông tin"; btn.disabled = false;
    }
});