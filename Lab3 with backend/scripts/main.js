const API_BASE = "http://localhost:3000/api";

let rooms = [];
let selectedRoomId = null;

document.addEventListener("DOMContentLoaded", () => {
  checkUserAccess();
  loadRoomsFromServer();
  loadMyBookings();
  updateContent();
});

function checkUserAccess() {
  const id = localStorage.getItem("currentUserId");
  if (!id) {
    alert("Not logged in");
    window.location.href = "login.html";
  }
}

function loadRoomsFromServer() {
  fetch(`${API_BASE}/rooms`)
    .then(res => res.json())
    .then(data => {
      rooms = data;
      renderRoomList();
    })
    .catch(err => {
      console.error("Failed to load rooms:", err);
      alert("Помилка завантаження кімнат із сервера");
    });
}

function renderRoomList() {
  const list = document.getElementById("room-list");
  list.innerHTML = "";

  rooms.forEach(room => {
    const availableSeats = room.available_seats ?? 0;
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${i18next.t("roomName")}:</strong> ${room.name}<br/>
      <strong>${i18next.t("capacity")}:</strong> ${room.capacity}<br/>
      <strong>${i18next.t("available")}:</strong> ${availableSeats}<br/>
      <button onclick="openBooking(${room.id})">${i18next.t("book")}</button>
    `;
    list.appendChild(li);
  });

  updateContent();
}

function openBooking(roomId) {
  selectedRoomId = roomId;
  const room = rooms.find(r => r.id === roomId);
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("bookingStartDate").min = today;
  document.getElementById("bookingStartDate").value = today;
  document.getElementById("bookingEndDate").min = today;
  document.getElementById("bookingEndDate").value = today;

  if (!room || room.available_seats < 1) {
    alert("No seats available.");
    return;
  }

  document.getElementById("bookingRoomName").innerText = `${room.name} (${room.available_seats} seats available)`;
  document.getElementById("bookingSeats").max = room.available_seats;
  document.getElementById("bookingSeats").value = 1;
  document.getElementById("bookingModal").style.display = "flex";
}

function closeBooking() {
  document.getElementById("bookingModal").style.display = "none";
  selectedRoomId = null;
}

function confirmBooking() {
  const seatsToBook = parseInt(document.getElementById("bookingSeats").value);
  const startDate = document.getElementById("bookingStartDate").value;
  const endDate = document.getElementById("bookingEndDate").value;
  const room = rooms.find(r => r.id === selectedRoomId);

  if (!room || seatsToBook < 1 || seatsToBook > room.available_seats) {
    alert("Invalid number of seats.");
    return;
  }

  if (!startDate || !endDate || endDate < startDate) {
    alert("Invalid date range.");
    return;
  }

  const userId = localStorage.getItem("currentUserId");
  if (!userId) return alert("Not logged in");

  fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: parseInt(userId),
      room_id: room.id,
      seats: seatsToBook,
      start_date: startDate,
      end_date: endDate
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to book");
      return res.json();
    })
    .then(() => {
      alert("Room booked successfully!");
      closeBooking();
      loadRoomsFromServer();
      loadMyBookings();
    })
    .catch(err => {
      console.error(err);
      alert("Booking failed: " + err.message);
    });
}

function loadMyBookings() {
  const userId = localStorage.getItem("currentUserId");
  if (!userId) return;

  fetch(`${API_BASE}/bookings`)
    .then(res => res.json())
    .then(allBookings => {
      const myBookings = allBookings.filter(b => b.user_id == userId);
      renderMyBookings(myBookings);
    });
}

function renderMyBookings(bookings) {
  const container = document.getElementById("my-bookings");
  container.innerHTML = "";

  if (bookings.length === 0) {
    container.innerHTML = `<li>${i18next.t("noBookings") || "No bookings yet."}</li>`;
    return;
  }

  bookings.forEach(b => {
    const room = rooms.find(r => r.id === b.room_id);
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${room ? room.name : "Unknown Room"}</strong><br/>
      ${i18next.t("seats")}: ${b.seats}<br/>
      ${i18next.t("from")}: ${b.start_date} → ${i18next.t("to")}: ${b.end_date}<br/>
      <button onclick="cancelBooking(${b.id})">${i18next.t("cancel") || "Cancel"}</button>
    `;
    container.appendChild(li);
  });
}


function cancelBooking(id) {
  if (confirm("Cancel this booking?")) {
    fetch(`http://localhost:3000/api/bookings/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        alert("Booking cancelled.");
        loadRoomsFromServer();
        loadMyBookings();
      })
      .catch(err => {
        console.error("Cancel error:", err);
        alert("Failed to cancel booking.");
      });
  }
}


function logout() {
  localStorage.removeItem("currentUserId");
  window.location.href = "login.html";
}
