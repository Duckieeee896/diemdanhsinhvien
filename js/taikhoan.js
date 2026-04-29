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

// 1. Lắng nghe trạng thái đăng nhập từ Firebase
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUid = user.uid;
        document.getElementById('profile-email').value = user.email; // Đổ email vào ô input

        // Lấy thông tin chi tiết từ bảng "users" trên Firestore
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
        // Nếu mở trang này mà chưa đăng nhập -> Đá về trang đăng nhập
        window.location.href = 'dangnhap.html';
    }
});

// 2. Xử lý khi bấm nút "Cập nhật thông tin"
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUserUid) return;

    const btn = e.target.querySelector('button');
    btn.textContent = "Đang lưu..."; btn.disabled = true;

    const fullname = document.getElementById('profile-fullname').value.trim();
    const dob = document.getElementById('profile-dob').value;
    const className = document.getElementById('profile-class').value.trim();

    try {
        // Cập nhật dữ liệu lên Firestore
        await updateDoc(doc(db, "users", currentUserUid), {
            fullname: fullname,
            dob: dob,
            className: className
        });

        // Lưu tên mới vào Session để thanh Navbar cập nhật tên ngay lập tức
        sessionStorage.setItem("fullname", fullname);
        
        // Sửa lại tên trên Navbar mà không cần tải lại trang
        const greetingEl = document.getElementById('nav-user-greeting');
        if (greetingEl) {
            greetingEl.innerHTML = `Chào mừng <strong>${fullname}</strong> ▾`;
        }

        msgEl.style.color = "#2ecc71";
        msgEl.textContent = "Đã cập nhật thông tin thành công!";
        
        // Xóa dòng thông báo sau 3 giây cho đẹp
        setTimeout(() => { msgEl.textContent = ""; }, 3000);

    } catch (error) {
        msgEl.style.color = "#e74c3c";
        msgEl.textContent = "Lỗi cập nhật: " + error.message;
    } finally {
        btn.textContent = "Cập nhật thông tin"; btn.disabled = false;
    }
});