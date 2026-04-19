/**
 * VITAL LAB - Unified Core Logic
 * Handles: Auth, Navigation, Dashboard Stats, and Medical Reports
 */

const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Global UI (Icons, Nav, Logout)
    initGlobalUI();

    // 2. Page-Specific Router
    const currentPage = document.body.getAttribute("data-page");

    switch (currentPage) {
        case "home":
            // Index.html logic handled in global UI
            break;
        case "dashboard":
            loadDashboardData();
            break;
        case "booking":
            initBookingLogic();
            break;
        case "reports":
            loadReportsPage();
            break;
        case "profile":
            loadProfileData();
            break;
        case "signup":
            initSignupLogic();
            break;
        case "login":
            initLoginLogic();
            break;
    }
});

/** --- GLOBAL UI & LOGOUT --- **/
function initGlobalUI() {
    if (typeof feather !== 'undefined') feather.replace();

    // Highlight Active Link
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(link => {
        if (link.getAttribute("href") === path) link.classList.add("active");
    });

    // Global Logout
    const logoutBtn = document.getElementById("globalLogoutBtn") || document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem("loggedInUser");
                sessionStorage.clear();
                window.location.href = "login.html";
            }
        };
    }
}

/** --- AUTHENTICATION --- **/
function initSignupLogic() {
    const form = document.getElementById("signupForm");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = {
            name: document.getElementById("signupName").value,
            email: document.getElementById("signupEmail").value,
            password: document.getElementById("signupPassword").value,
            phone: document.getElementById("signupPhone").value,
            gender: document.getElementById("signupGender").value,
            address: document.getElementById("signupAddress").value
        };
        try {
            const res = await fetch(`${API_BASE}/api/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user)
            });
            if (res.ok) { alert("Account Created! ✅"); window.location.href = "login.html"; }
            else { alert("Signup failed: " + await res.text()); }
        } catch (err) { alert("Backend Server Offline 🚨"); }
    });
}

function initLoginLogic() {
    const form = document.getElementById("loginForm") || document.getElementById("loginBtn");
    if (!form) return;
    const handleLogin = async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                const user = await res.json();
                localStorage.setItem("loggedInUser", JSON.stringify(user));
                window.location.href = "dashboard.html";
            } else { alert("Invalid Credentials ❌"); }
        } catch (err) { alert("Connect to Backend failed."); }
    };
    form.tagName === "FORM" ? form.onsubmit = handleLogin : form.onclick = handleLogin;
}

/** --- DASHBOARD & REPORTS --- **/
function loadDashboardData() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) { window.location.href = "login.html"; return; }
    
    document.getElementById("dashUserName").textContent = user.name;

    fetch(`${API_BASE}/api/bookings/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("statTotalBookings").textContent = data.length;
            document.getElementById("statReportsReady").textContent = data.length;
            const list = document.getElementById("recentBookingsList");
            if (data.length > 0) {
                list.innerHTML = data.slice(-3).reverse().map(b => `
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee;">
                        <span><strong>${b.testName}</strong><br><small>${b.date}</small></span>
                        <span style="color:green; font-weight:bold;">Paid</span>
                    </div>
                `).join('');
            }
        });
}

function loadReportsPage() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const list = document.getElementById("reportList");
    if (!user || !list) return;

    fetch(`${API_BASE}/api/bookings/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) { list.innerHTML = "<li>No reports found.</li>"; return; }
            list.innerHTML = data.map(b => `
                <li class="report-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:white; margin-bottom:10px; border-radius:10px; border:1px solid #e2e8f0;">
                    <div><strong>${b.testName}</strong><br><small class="muted">${b.date}</small></div>
                    <button class="btn secondary" onclick="openReport('${b.testName}', '${b.date}')">View Report</button>
                </li>
            `).join('');
            feather.replace();
        });
}

/** --- SCIENTIFIC DATA GENERATOR --- **/
window.openReport = function(testName, date) {
    const modal = document.getElementById("reportModal");
    const tbody = document.getElementById("reportData");
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    // Scientific Data Map
    const ranges = {
        "CBC": [{ p: "Hemoglobin", u: "g/dL", min: 13.5, max: 17.5 }, { p: "WBC Count", u: "cells/mcL", min: 4500, max: 11000 }],
        "Lipid": [{ p: "Cholesterol", u: "mg/dL", min: 125, max: 200 }, { p: "Triglycerides", u: "mg/dL", min: 50, max: 150 }],
        "Default": [{ p: "Blood Sugar", u: "mg/dL", min: 70, max: 100 }]
    };

    const key = testName.includes("CBC") ? "CBC" : testName.includes("Lipid") ? "Lipid" : "Default";
    const params = ranges[key];

    document.getElementById("viewTestName").textContent = testName;
    document.getElementById("viewPatientName").textContent = user.name;
    document.getElementById("viewDate").textContent = "Date: " + date;

    tbody.innerHTML = params.map(item => {
        const val = (item.min + (Math.random() * (item.max - item.min))).toFixed(1);
        return `<tr><td>${item.p}</td><td><strong>${val}</strong></td><td>${item.u}</td><td>${item.min}-${item.max}</td></tr>`;
    }).join('');

    modal.style.display = "block";
};

window.closeModal = () => document.getElementById("reportModal").style.display = "none";

function loadProfileData() {
    const u = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!u) return;
    const map = { "pName": u.name, "pEmail": u.email, "pPhone": u.phone, "pGender": u.gender, "pAddress": u.address };
    for (let id in map) if (document.getElementById(id)) document.getElementById(id).textContent = map[id] || "N/A";
}

async function loadAllUsers() {
    try {
        const response = await fetch('/api/users/all');
        const users = await response.json();

        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = ''; // Clear old data

        users.forEach(user => {
            const row = `<tr>
                <td>${user.id}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td><button class="delete-btn" onclick="deleteUser(${user.id})">Remove</button></td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading users:", error);
    }
}