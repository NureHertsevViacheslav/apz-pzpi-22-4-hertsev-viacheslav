const API_BASE = "http://localhost:3000/api";

let rooms = [];
let users = [];
let bookings = [];
let editRoomId = null;
let editUserId = null;
let editBookingIndex = null;

async function checkAdminAccess() {
  const id = localStorage.getItem("currentUserId");
  if (!id) {
    alert("Not logged in");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/${id}`);
    if (!res.ok) throw new Error("User not found");
    const user = await res.json();
    if (user.role !== "admin") throw new Error("Not admin");
  } catch (err) {
    console.error("Access error:", err);
    alert("Access denied");
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await checkAdminAccess();
  loadAllData();
  updateContent();
});

function loadAllData() {
  Promise.all([
    fetch(`${API_BASE}/rooms`).then(res => res.json()),
    fetch(`${API_BASE}/users`).then(res => res.json()),
    fetch(`${API_BASE}/bookings`).then(res => res.json())
  ])
    .then(([roomData, userData, bookingData]) => {
      rooms = roomData;
      users = userData;
      bookings = bookingData;
      renderRooms();
      renderUsers();
      renderAllBookings();
    })
    .catch(err => {
      console.error("Failed to load data", err);
      alert("Помилка завантаження даних з сервера");
    });
}

function renderRooms() {
  const tbody = document.querySelector("#roomTable tbody");
  const minCap = parseInt(document.getElementById("capacityFilter").value) || 0;
  tbody.innerHTML = "";

  rooms.filter(r => r.capacity >= minCap).forEach(room => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${room.id}</td>
      <td>${room.name}</td>
      <td>${room.capacity}</td>
      <td>${room.available_seats}</td>
      <td>
        <button onclick="editRoom(${room.id})">✏️</button>
        <button onclick="deleteRoom(${room.id})">🗑️</button>
      </td>`;
    tbody.appendChild(row);
  });
  updateContent();
}

function showRoomForm(room = null) {
  document.getElementById("roomFormModal").style.display = "block";
  document.getElementById("formTitle").textContent = room ? "Edit Room" : "Add Room";
  document.getElementById("roomNameInput").value = room?.name || "";
  document.getElementById("roomCapacityInput").value = room?.capacity || "";
  document.getElementById("roomAvailableSeatsInput").value = room?.available_seats || "";
  editRoomId = room?.id || null;
}

function hideRoomForm() {
  document.getElementById("roomFormModal").style.display = "none";
  editRoomId = null;
}

function saveRoom() {
  const name = document.getElementById("roomNameInput").value.trim();
  const capacity = parseInt(document.getElementById("roomCapacityInput").value.trim());
  const available_seats = parseInt(document.getElementById("roomAvailableSeatsInput").value.trim());

  if (!name || isNaN(capacity) || isNaN(available_seats)) {
    alert("Please fill all fields correctly.");
    return;
  }

  const method = editRoomId ? "PUT" : "POST";
  const url = editRoomId ? `${API_BASE}/rooms/${editRoomId}` : `${API_BASE}/rooms`;

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, capacity, available_seats })
  }).then(loadAllData);
  hideRoomForm();
}

function deleteRoom(id) {
  if (confirm("Delete this room?")) {
    fetch(`${API_BASE}/rooms/${id}`, { method: "DELETE" })
      .then(loadAllData);
  }
}

function renderUsers() {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.password}</td>
      <td>${user.role}</td>
      <td>
        <button onclick="editUser(${user.id})">✏️</button>
        <button onclick="deleteUser(${user.id})">🗑️</button>
      </td>`;
    tbody.appendChild(row);
  });
  updateContent();
}

function showUserForm(user = null) {
  document.getElementById("userFormModal").style.display = "block";
  document.getElementById("userFormTitle").textContent = user ? "Edit User" : "Add User";
  document.getElementById("usernameInput").value = user?.username || "";
  document.getElementById("emailInput").value = user?.email || "";
  document.getElementById("passwordInput").value = user?.password || "";
  document.getElementById("roleInput").value = user?.role || "user";
  editUserId = user?.id || null;
}

function hideUserForm() {
  document.getElementById("userFormModal").style.display = "none";
  editUserId = null;
}

function saveUser() {
  const username = document.getElementById("usernameInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  const role = document.getElementById("roleInput").value;

  if (!username || !email || !password) {
    alert("Fill all fields!");
    return;
  }

  const method = editUserId ? "PUT" : "POST";
  const url = editUserId ? `${API_BASE}/users/${editUserId}` : `${API_BASE}/users`;

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role })
  }).then(loadAllData);
  hideUserForm();
}

function deleteUser(id) {
  if (confirm("Delete this user?")) {
    fetch(`${API_BASE}/users/${id}`, { method: "DELETE" })
      .then(loadAllData);
  }
}

function renderAllBookings() {
  const tbody = document.querySelector("#bookingTable tbody");
  tbody.innerHTML = "";

  bookings.forEach(booking => {
    const user = users.find(u => u.id === booking.user_id);
    const room = rooms.find(r => r.id === booking.room_id);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user?.username || "?"}</td>
      <td>${room?.name || "?"}</td>
      <td>${booking.seats}</td>
      <td>${booking.start_date}</td>
      <td>${booking.end_date}</td>
      <td>
      <button onclick="editBooking(${booking.id})">✏️</button>
      <button onclick="deleteBooking(${booking.id})">🗑️</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function deleteBooking(id) {
  fetch(`${API_BASE}/bookings/${id}`, { method: "DELETE" })
    .then(loadAllData);
}

function logout() {
  fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" })
    .then(() => {
      localStorage.removeItem("currentUserId");
      window.location.href = "login.html";
    });
}

function clearAllStorage() {
  alert("Ця функція більше неактивна — дані зберігаються на сервері.");
}

window.editBooking = async function (bookingId) {
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) {
    alert("Бронювання не знайдено");
    return;
  }

  const room = rooms.find(r => r.id === booking.room_id);
  if (!room) {
    alert("Кімната не знайдена");
    return;
  }

  editBookingIndex = booking.id;

  const totalAvailable = room.available_seats + booking.seats;

  document.getElementById("bookingInfoText").innerText =
    `Room: ${room.name}, Current seats: ${booking.seats}, Total available: ${totalAvailable}`;

  document.getElementById("editBookingSeats").value = booking.seats;
  document.getElementById("editBookingSeats").max = totalAvailable;
  const startDateFormatted = new Date(booking.start_date).toISOString().split("T")[0];
const endDateFormatted = new Date(booking.end_date).toISOString().split("T")[0];

document.getElementById("editBookingStartDate").value = startDateFormatted;
document.getElementById("editBookingEndDate").value = endDateFormatted;


  const today = new Date().toISOString().split("T")[0];
  document.getElementById("editBookingStartDate").min = today;
  document.getElementById("editBookingEndDate").min = today;

  document.getElementById("bookingFormModal").style.display = "flex";
};

window.saveBookingEdit = function () {
  const seats = parseInt(document.getElementById("editBookingSeats").value);
  const start_date = document.getElementById("editBookingStartDate").value;
  const end_date = document.getElementById("editBookingEndDate").value;

  const booking = bookings.find(b => b.id === editBookingIndex);
  if (!booking) {
    alert("Booking not found");
    return;
  }

  booking.seats = seats;
  booking.start_date = start_date;
  booking.end_date = end_date;

  fetch(`${API_BASE}/bookings/${editBookingIndex}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ seats, start_date, end_date })
})
.then(() => {
  hideBookingForm();
  loadAllData();
})
.catch(err => {
  console.error("Booking update failed", err);
  alert("Не вдалося оновити бронювання.");
});

  hideBookingForm();
  loadAllData();
};

window.hideBookingForm = function () {
  document.getElementById("bookingFormModal").style.display = "none";
  editBookingIndex = null;
};


window.editRoom = function(id) {
    const room = rooms.find(r => r.id === id);
  if (room) showRoomForm(room);
};

window.editUser = function(id) {
  const user = users.find(u => u.id === id);
  if (user) showUserForm(user);
};
