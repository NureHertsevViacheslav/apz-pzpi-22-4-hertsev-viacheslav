document.addEventListener("DOMContentLoaded", () => {
  updateContent(); 
  renderAllBookings();

});

let rooms = loadFromStorage() 
let users = loadUsersFromStorage() 
let editUserId = null;
let editBookingIndex = null;
let editRoomId = null;

function renderRooms() {
  const tbody = document.querySelector("#roomTable tbody");
  const minCap = parseInt(document.getElementById("capacityFilter").value) || 0;

  tbody.innerHTML = "";

  rooms
    .filter(room => room.capacity >= minCap)
    .forEach(room => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${room.id}</td>
        <td>${room.name}</td>
        <td>${room.capacity}</td>
        <td>${room.availableSeats}</td> <!-- Added available seats column -->
        <td>
          <button onclick="editRoom(${room.id})">✏️</button>
          <button onclick="deleteRoom(${room.id})">🗑️</button>
        </td>
      `;
      tbody.appendChild(row);
    });

  updateContent();
}

function applyFilter() {
  renderRooms();
}

function showRoomForm(room = null) {
  document.getElementById("roomFormModal").style.display = "block";
  document.getElementById("formTitle").textContent = room ? "Edit Room" : "Add Room";
  document.getElementById("roomNameInput").value = room ? room.name : "";
  document.getElementById("roomCapacityInput").value = room ? room.capacity : "";
  document.getElementById("roomAvailableSeatsInput").value = room ? room.availableSeats : ""; // Added available seats
  editRoomId = room ? room.id : null;
}
function hideRoomForm() {
  document.getElementById("roomFormModal").style.display = "none";
  editRoomId = null;
}

function saveRoom() {
  const name = document.getElementById("roomNameInput").value.trim();
  const capacity = parseInt(document.getElementById("roomCapacityInput").value.trim());
  const availableSeats = parseInt(document.getElementById("roomAvailableSeatsInput").value.trim());

  if (!name || isNaN(capacity) || isNaN(availableSeats)) {
    alert("Please fill all fields correctly.");
    return;
  }

  if (editRoomId) {
    const room = rooms.find(r => r.id === editRoomId);
    room.name = name;
    room.capacity = capacity;
    room.availableSeats = availableSeats;
  } else {
    const newId = rooms.length ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
    rooms.push({ id: newId, name, capacity, availableSeats });
  }

  hideRoomForm();
  renderRooms();
  saveToStorage();
}

function editRoom(id) {
  const room = rooms.find(r => r.id === id);
  if (room) {
    showRoomForm(room);
  }
}

function deleteRoom(id) {
  if (confirm("Delete this room?")) {
    rooms = rooms.filter(r => r.id !== id);
    renderRooms();
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem("rooms", JSON.stringify(rooms));
}

function loadFromStorage() {
  const data = localStorage.getItem("rooms");
  return data ? JSON.parse(data) : [];
}

function saveUsersToStorage() {
  localStorage.setItem("users", JSON.stringify(users));
}

function loadUsersFromStorage() {
  const data = localStorage.getItem("users");
  return data ? JSON.parse(data) : null;
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
      </td>
    `;
    tbody.appendChild(row);
  });

  updateContent();
}


function showUserForm(user = null) {
  document.getElementById("userFormModal").style.display = "block";
  document.getElementById("userFormTitle").textContent = user ? "Edit User" : "Add User";
  document.getElementById("usernameInput").value = user ? user.username : "";
  document.getElementById("emailInput").value = user ? user.email : "";
  document.getElementById("passwordInput").value = user ? user.password : "";
  document.getElementById("roleInput").value = user ? user.role : "user";
  editUserId = user ? user.id : null;
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

  if (editUserId) {
    const u = users.find(u => u.id === editUserId);
    u.username = username;
    u.email = email;
    u.password = password;
    u.role = role;
  } else {
    if (users.some(u => u.username === username || u.email === email)) {
      alert("Username or email already exists.");
      return;
    }
    const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    users.push({ id: newId, username, email, password, role });
  }

  saveUsersToStorage();
  hideUserForm();
  renderUsers();
}

function hideUserForm() {
  document.getElementById("userFormModal").style.display = "none";
  editUserId = null;
}

function editUser(id) {
  const user = users.find(u => u.id === id);
  if (user) {
    showUserForm(user);
  }
}

function deleteUser(id) {
  if (confirm("Delete this user?")) {
    users = users.filter(u => u.id !== id);
    saveUsersToStorage();
    renderUsers();
  }
}



  document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
    return;
  }

  renderUsers();
  renderRooms(); 
  updateContent();
});

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
function downloadJSON(filename, data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function createBackup() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

  downloadJSON("users_backup.json", users);
  downloadJSON("rooms_backup.json", rooms);
}

function importUsers(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      localStorage.setItem("users", JSON.stringify(imported));
      users = imported;
      renderUsers();
      alert("Users imported successfully.");
    } catch (err) {
      alert("Failed to import users: " + err.message);
    }
  };
  reader.readAsText(file);
}

function importRooms(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      localStorage.setItem("rooms", JSON.stringify(imported));
      rooms = imported;
      renderRooms();
      alert("Rooms imported successfully.");
    } catch (err) {
      alert("Failed to import rooms: " + err.message);
    }
  };
  reader.readAsText(file);
}

function renderAllBookings() {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const tbody = document.querySelector("#bookingTable tbody");
  tbody.innerHTML = "";

  bookings.forEach((b, index) => {
    const user = users.find(u => u.id === b.userId);
    const room = rooms.find(r => r.id === b.roomId);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user?.username || "?"}</td>
      <td>${room?.name || "?"}</td>
      <td>${b.seats}</td>
      <td>${b.startDate}</td>
      <td>${b.endDate}</td>
      <td>
        <button onclick="editBooking(${index})">✏️</button>
        <button onclick="deleteBooking(${index})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteBooking(index) {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const booking = bookings[index];
  if (!booking) return;

  const room = rooms.find(r => r.id === booking.roomId);
  if (room) {
    room.availableSeats += booking.seats;
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }

  bookings.splice(index, 1);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  renderAllBookings();
  renderRooms(); 
}

function editBooking(index) {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const booking = bookings[index];
  const room = rooms.find(r => r.id === booking.roomId);
  if (!booking || !room) return;

  editBookingIndex = index;
  const totalAvailable = room.availableSeats + booking.seats;

  document.getElementById("bookingInfoText").innerText =
    `Room: ${room.name}, Current seats: ${booking.seats}, Total available: ${totalAvailable}`;

  document.getElementById("editBookingSeats").value = booking.seats;
  document.getElementById("editBookingSeats").max = totalAvailable;

  document.getElementById("editBookingStartDate").value = booking.startDate;
  document.getElementById("editBookingEndDate").value = booking.endDate;

  document.getElementById("editBookingStartDate").min = new Date().toISOString().split("T")[0];
  document.getElementById("editBookingEndDate").min = new Date().toISOString().split("T")[0];

  document.getElementById("bookingFormModal").style.display = "flex";
}


function hideBookingForm() {
  document.getElementById("bookingFormModal").style.display = "none";
  editBookingIndex = null;
}

function saveBookingEdit() {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const booking = bookings[editBookingIndex];
  const room = rooms.find(r => r.id === booking.roomId);

  const newSeats = parseInt(document.getElementById("editBookingSeats").value);
  const newStartDate = document.getElementById("editBookingStartDate").value;
  const newEndDate = document.getElementById("editBookingEndDate").value;

  const totalAvailable = room.availableSeats + booking.seats;

  if (!newSeats || newSeats < 1 || newSeats > totalAvailable) {
    alert("Invalid seat number");
    return;
  }

  if (!newStartDate || !newEndDate || newEndDate < newStartDate) {
    alert("Invalid date range");
    return;
  }

  room.availableSeats = totalAvailable - newSeats;

  booking.seats = newSeats;
  booking.startDate = newStartDate;
  booking.endDate = newEndDate;

  localStorage.setItem("bookings", JSON.stringify(bookings));
  localStorage.setItem("rooms", JSON.stringify(rooms));

  hideBookingForm();
  renderAllBookings();
  renderRooms();
}

