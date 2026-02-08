console.log("✅ common.js LOADED");

// Backend API base
const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

  // ---------- SIGNUP ----------
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = {
        name: document.getElementById("signupName").value.trim(),
        email: document.getElementById("signupEmail").value.trim(),
        password: document.getElementById("signupPassword").value,
        phone: document.getElementById("signupPhone")?.value || "",
        gender: document.getElementById("signupGender")?.value || "",
        address: document.getElementById("signupAddress")?.value || ""
      };
      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user)
        });
        if (res.ok) {
          const savedUser = await res.json();
          alert("Account created ✅");
          // store minimal profile? redirect to login
          window.location.href = "login.html";
        } else {
          const txt = await res.text();
          alert("Signup error: " + txt);
        }
      } catch (err) {
        console.error(err);
        alert("Network/server error during signup");
      }
      // Load recent bookings in dashboard
const recentBookingsDiv = document.getElementById("recentBookings");
if (recentBookingsDiv) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  fetch(`${API_BASE}/bookings/user/${user.id}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) {
        recentBookingsDiv.innerHTML = "<p>No bookings yet.</p>";
        return;
      }

      recentBookingsDiv.innerHTML = data.slice(-5).reverse().map(b => `
        <div style="padding:8px;border-bottom:1px solid #eee">
          <strong>${b.testName}</strong><br>
          ${b.date} at ${b.time}
        </div>
      `).join("");
    });
}

    });
  }

  // ---------- LOGIN ----------
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      if (!email || !password) { alert("Enter email & password"); return; }
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        // If backend returns user JSON (on success) — parse JSON
        if (res.ok) {
          const userObj = await res.json(); // { id, name, email, ... }
          userObj.password = undefined;
          localStorage.setItem("loggedInUser", JSON.stringify(userObj));
          alert("Login successful ✅");
          window.location.href = "dashboard.html";
        } else {
          const txt = await res.text();
          alert("Login failed: " + txt);
        }
      } catch (err) {
        console.error(err);
        alert("Server error during login");
      }
    });
  }

  // ---------- DASHBOARD name & recent ----------
  const userDisplay = document.getElementById("userDisplay");
  if (userDisplay) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) { window.location.href = "login.html"; return; }
    userDisplay.textContent = user.name || user.email;
  }

  // ---------- BOOKING FORM ----------
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!user) { alert("Please login"); window.location.href = "login.html"; return; }

      const testSelect = document.getElementById("testName");
      // test option values are like "Name|||Price" (booking.html uses that)
      const val = testSelect.value || "";
      const [testName, price] = val.split("|||");

      const booking = {
        name: document.getElementById("patientName").value.trim(),
        gender: document.getElementById("patientGender").value,
        phone: document.getElementById("patientPhone").value.trim(),
        email: document.getElementById("patientEmail").value.trim() || user.email,
        address: document.getElementById("patientAddress").value.trim(),
        testName: testName || document.getElementById("testName").value,
        price: Number(price) || 0,
        date: document.getElementById("testDate").value,
        time: document.getElementById("testTime").value
      };

      // Save pending booking (read by payment.html)
      sessionStorage.setItem("pendingBooking", JSON.stringify(booking));
      window.location.href = "payment.html";

      
    });
  }

 

  // ---------- RECEIPT PAGE ----------
  const receiptArea = document.getElementById("receiptArea");
  if (receiptArea) {
    const id = sessionStorage.getItem("lastReceiptId");
    const booking = JSON.parse(sessionStorage.getItem("lastBooking"));
    if (!id || !booking) {
      receiptArea.textContent = "No receipt found.";
    } else {
      receiptArea.innerHTML = `
        <div style="border:1px dashed #e6ecf2; padding:14px; border-radius:8px; background:#fff">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><strong>Vital Lab</strong><div class="muted">Receipt ID: ${id}</div></div>
            <div style="text-align:right">
              <div class="muted">${new Date().toLocaleString()}</div>
              <div style="font-weight:700;font-size:18px">₹${booking.price}</div>
            </div>
          </div>
          <hr style="margin:12px 0;border:none;border-top:1px solid #f0f3f6">
          <div><strong>Patient:</strong> ${booking.name}</div>
          <div><strong>Test:</strong> ${booking.testName}</div>
          <div style="margin-top:8px" class="muted">Thank you for choosing Vital Lab!</div>
        </div>
      `;

      document.getElementById('downloadReceipt')?.addEventListener('click', () => {
        const text = `Receipt: ${id}\nDate: ${new Date().toLocaleString()}\nPatient: ${booking.name}\nTest: ${booking.testName}\nAmount: ₹${booking.price}\n\nVital Lab`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${id}.txt`; a.click(); URL.revokeObjectURL(url);
      });
    }
  }


  // ---------------- REPORTS PAGE ----------------
const reportsDiv = document.getElementById("reportList");
if (reportsDiv) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  fetch(`${API_BASE.replace("/users","")}/bookings/user/${user.id}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) {
        reportsDiv.innerHTML = "<p>No reports yet.</p>";
        return;
      }

      reportsDiv.innerHTML = data.map(b => `
        <div style="padding:10px;border-bottom:1px solid #ddd">
          <strong>${b.testName}</strong><br>
          Date: ${b.date}<br>
          Status: <span style="color:green">${b.status}</span>
        </div>
      `).join("");
    })
    .catch(() => {
      reportsDiv.innerHTML = "<p>Error loading reports.</p>";
    });
}

// Profile page fill
if (document.getElementById("pName")) {
  const u = JSON.parse(localStorage.getItem("loggedInUser"));
  document.getElementById("pName").textContent = u.name;
  document.getElementById("pEmail").textContent = u.email;
  document.getElementById("pPhone").textContent = u.phone || "Not Provided";
  document.getElementById("pGender").textContent = u.gender || "Not Provided";
  document.getElementById("pAddress").textContent = u.address || "Not Provided";
}


// -------- DASHBOARD DATA --------
const recentDiv = document.getElementById("recentBookings");
const bookingsCount = document.getElementById("totalBookings");
const reportsCount = document.getElementById("totalReports");
const amountSpan = document.getElementById("totalAmount");

if (recentDiv && bookingsCount && reportsCount && amountSpan) {
  console.log("✅ Dashboard script running...");

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  fetch(`http://localhost:8080/api/bookings/user/${user.id}`)
    .then(res => res.json())
    .then(bookings => {

      // ✅ Counts
      bookingsCount.textContent = bookings.length;
      reportsCount.textContent = bookings.length;

      // ✅ Total Amount
      const totalAmount = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
      amountSpan.textContent = totalAmount;

      // ✅ Recent Bookings Section
      if (!bookings.length) {
        recentDiv.innerHTML = "<p>No bookings yet. Book a test to get started.</p>";
        return;
      }

      recentDiv.innerHTML = bookings.slice(-5).reverse().map(b => `
        <div style="padding:10px;border-bottom:1px solid #eee;">
          <strong>${b.testName}</strong><br>
          Date: ${b.date}<br>
          Amount: ₹${b.price || 0}<br>
          Status: <span style="color:green">${b.status}</span>
        </div>
      `).join("");
      
    })
    .catch(err => {
      console.error(err);
      recentDiv.innerHTML = "<p>Error loading bookings.</p>";
    });
}

// -------- LOGOUT --------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    sessionStorage.clear();
    window.location.href = "login.html";
  });
}

});
