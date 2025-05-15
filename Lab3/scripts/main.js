


document.addEventListener("DOMContentLoaded", () => {
    loadRooms();
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "user") {
    alert("Please log in as a user");
    window.location.href = "login.html";
    return;
  }

    loadRooms();
  renderMyBookings();
  updateContent();
});
  
function renderRoomList(rooms) {
    const list = document.getElementById("room-list");
    list.innerHTML = "";
  
    rooms.forEach(room => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${i18next.t("roomName")}:</strong> ${room.name}<br/>
        <strong>${i18next.t("capacity")}:</strong> ${room.capacity}<br/>
        <button onclick="alert('${i18next.t("book")}: ${room.name}')">
          ${i18next.t("book")}
        </button>
      `;
      list.appendChild(li);
    });
}
  
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
let selectedRoomId = null;

function loadRooms() {
  const raw = localStorage.getItem("rooms");
  rooms = raw ? JSON.parse(raw) : [];


  console.log(rooms);  
  renderRoomList(rooms);
}



function renderRoomList(rooms) {
  const list = document.getElementById("room-list");
  list.innerHTML = "";

  rooms.forEach(room => {
    const availableSeats = room.availableSeats !== undefined ? room.availableSeats : 0;  
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

  if (!room || room.availableSeats < 1) {
    alert("No seats available.");
    return;
  }

  document.getElementById("bookingRoomName").innerText = `${room.name} (${room.availableSeats} seats available)`;
  document.getElementById("bookingSeats").max = room.availableSeats;
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

  if (!room || seatsToBook < 1 || seatsToBook > room.availableSeats) {
    alert("Invalid number of seats.");
    return;
  }

  if (!startDate || !endDate) {
    alert("Please select both dates.");
    return;
  }

  if (endDate < startDate) {
    alert("End date must be after start date.");
    return;
  }

  const user = JSON.parse(localStorage.getItem("currentUser"));
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

  bookings.push({
    userId: user.id,
    roomId: room.id,
    seats: seatsToBook,
    startDate: startDate,
    endDate: endDate
  });

  room.availableSeats -= seatsToBook;
  localStorage.setItem("rooms", JSON.stringify(rooms));
  localStorage.setItem("bookings", JSON.stringify(bookings));

  alert("Room booked successfully!");
  closeBooking();
  renderRoomList(rooms);
  renderMyBookings();
}


function renderMyBookings() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const myBookings = bookings.filter(b => b.userId === user.id);
  const container = document.getElementById("my-bookings");
  container.innerHTML = "";

  if (myBookings.length === 0) {
    container.innerHTML = `<li>${i18next.t("noBookings") || "No bookings yet."}</li>`;
    return;
  }

myBookings.forEach((b, index) => {
  const room = rooms.find(r => r.id === b.roomId);
  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${room ? room.name : "Unknown Room"}</strong><br/>
    ${i18next.t("seats")}: ${b.seats}<br/>
    ${i18next.t("from")}: ${b.startDate} → ${i18next.t("to")}: ${b.endDate}
    <button onclick="cancelBooking(${index})">🗑️ ${i18next.t("cancel") || "Cancel"}</button>
  `;
  container.appendChild(li);
});
}

function cancelBooking(index) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  let bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

  const myBookings = bookings.filter(b => b.userId === user.id);

  const b = myBookings[index];
  if (!b) return;

  const room = rooms.find(r => r.id === b.roomId);
  if (room) {
    room.availableSeats += b.seats;
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }

  bookings = bookings.filter(
    bk => !(bk.userId === b.userId && bk.roomId === b.roomId && bk.date === b.date && bk.seats === b.seats)
  );
  localStorage.setItem("bookings", JSON.stringify(bookings));

  alert(i18next.t("bookingCancelled") || "Booking cancelled");
  renderRoomList(rooms);
  renderMyBookings();
}
