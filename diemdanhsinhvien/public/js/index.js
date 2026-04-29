// KIỂM TRA ĐĂNG NHẬP
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    alert("Vui lòng đăng nhập trước!");
    window.location.href = "dangnhap.html";
} else {
    const userName = sessionStorage.getItem("fullname");
if (userName) {
    document.getElementById("welcome-user").innerText = "Xin chào, " + userName + "!";
} else {
    document.getElementById("welcome-user").innerText = "Xin chào, bạn!";
}
}

// IMPORT CÁC THƯ VIỆN FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// LẤY CẤU HÌNH TỪ FILE BÊN NGOÀI
import { firebaseConfig } from "../inc/config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let students = [];
const studentListEl = document.getElementById('student-list');

// 1. TẢI DỮ LIỆU
async function loadStudentsFromFirebase() {
    try {
        students = [];
        const querySnapshot = await getDocs(collection(db, "students"));
        
        if (querySnapshot.empty) {
            studentListEl.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chưa có dữ liệu sinh viên. Hãy thêm mới!</td></tr>';
            updateStats();
            return;
        }

        querySnapshot.forEach((doc) => {
            students.push({ docId: doc.id, ...doc.data() });
        });
        renderStudents();
    } catch (error) {
        console.error(error);
        studentListEl.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Lỗi kết nối cơ sở dữ liệu.</td></tr>';
    }
}

// 2. TÍNH TOÁN THỐNG KÊ
function updateStats() {
    let total = students.length;
    let present = students.filter(s => s.status === 'present').length;
    let absent = students.filter(s => s.status === 'absent').length;
    let pending = total - present - absent;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-present').textContent = present;
    document.getElementById('stat-absent').textContent = absent;
    document.getElementById('stat-pending').textContent = pending;
}

// 3. HIỂN THỊ BẢNG
function renderStudents() {
    studentListEl.innerHTML = '';
    students.sort((a, b) => (a.id || "").localeCompare(b.id || ""));

    students.forEach((student, index) => {
        const tr = document.createElement('tr');
        let statusText = "Chưa điểm danh"; let statusClass = "pending";
        if (student.status === 'present') { statusText = "Có mặt"; statusClass = "present"; } 
        else if (student.status === 'absent') { statusText = "Vắng mặt"; statusClass = "absent"; }

        tr.innerHTML = `
            <td><strong>${student.id || "N/A"}</strong></td>
            <td>${student.name || "N/A"}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn btn-present" data-index="${index}" data-action="present">Có mặt</button>
                <button class="action-btn btn-absent" data-index="${index}" data-action="absent">Vắng</button>
                <button class="action-btn btn-delete" data-index="${index}" data-action="delete">Xóa</button>
            </td>
        `;
        studentListEl.appendChild(tr);
    });

    updateStats();

    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const index = this.getAttribute('data-index');
            const action = this.getAttribute('data-action');
            if (action === 'delete') {
                await deleteStudent(index);
            } else {
                this.textContent = "..."; this.disabled = true;
                await markAttendance(index, action);
            }
        });
    });
}

// 4. CẬP NHẬT TRẠNG THÁI (ĐIỂM DANH)
async function markAttendance(index, newStatus) {
    const student = students[index];
    try {
        await updateDoc(doc(db, "students", student.docId), { status: newStatus });
        students[index].status = newStatus;
        renderStudents();
    } catch (error) { alert("Lỗi điểm danh!"); renderStudents(); }
}

// 5. THÊM SINH VIÊN
document.getElementById('btn-add-student').addEventListener('click', async () => {
    const idInput = document.getElementById('new-sv-id');
    const nameInput = document.getElementById('new-sv-name');
    const id = idInput.value.trim(); const name = nameInput.value.trim();

    if (!id || !name) { alert("Nhập đủ MSSV và Tên!"); return; }

    const btn = document.getElementById('btn-add-student');
    btn.textContent = "Đang lưu..."; btn.disabled = true;

    try {
        const docRef = await addDoc(collection(db, "students"), { id: id, name: name, status: "pending" });
        students.push({ docId: docRef.id, id: id, name: name, status: "pending" });
        idInput.value = ''; nameInput.value = ''; 
        renderStudents();
    } catch (error) { alert("Lỗi khi thêm!"); } 
    finally { btn.textContent = "➕ Thêm Sinh Viên"; btn.disabled = false; }
});

// 6. XÓA SINH VIÊN
async function deleteStudent(index) {
    const student = students[index];
    if (confirm(`Bạn có chắc muốn xóa ${student.name}?`)) {
        try {
            await deleteDoc(doc(db, "students", student.docId));
            students.splice(index, 1);
            renderStudents();
        } catch (error) { alert("Lỗi khi xóa!"); }
    }
}

// Tải dữ liệu ban đầu
loadStudentsFromFirebase();