console.log("Connecting to DB with:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: true, 
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.use(session({
  secret: "ette",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    sameSite: "lax"
  }
}));

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "postgres-service", 
  database: process.env.DB_NAME || "officespace",
  password: process.env.DB_PASSWORD || "12345",
  port: 5432,
});

app.post("/api/auth/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body); 
  const { username, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE username=$1 AND password=$2", [username, password]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  res.status(200).json({ user }); 
});

app.get("/api/users/:id", async (req, res) => {
  const id = req.params.id;
  const result = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(result.rows[0]);
});

app.get("/api/auth/current", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
  res.json(req.session.user);
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});


app.get("/api/rooms", async (req, res) => {
  const result = await pool.query("SELECT * FROM rooms ORDER BY id ASC");
  res.json(result.rows);
});

app.post("/api/rooms", async (req, res) => {
  const { name, capacity, available_seats } = req.body;
  await pool.query(
    "INSERT INTO rooms (name, capacity, available_seats) VALUES ($1, $2, $3)",
    [name, capacity, available_seats]
  );
  res.sendStatus(201);
});

app.put("/api/rooms/:id", async (req, res) => {
  const { name, capacity, available_seats } = req.body;
  const { id } = req.params;
  await pool.query(
    "UPDATE rooms SET name=$1, capacity=$2, available_seats=$3 WHERE id=$4",
    [name, capacity, available_seats, id]
  );
  res.sendStatus(200);
});

app.delete("/api/rooms/:id", async (req, res) => {
  await pool.query("DELETE FROM rooms WHERE id=$1", [req.params.id]);
  res.sendStatus(200);
});

app.get("/api/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
  res.json(result.rows);
});

app.post("/api/users", async (req, res) => {
  const { username, email, password, role } = req.body;
  await pool.query(
    "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)",
    [username, email, password, role]
  );
  res.sendStatus(201);
});

app.put("/api/users/:id", async (req, res) => {
  const { username, email, password, role } = req.body;
  const { id } = req.params;
  await pool.query(
    "UPDATE users SET username=$1, email=$2, password=$3, role=$4 WHERE id=$5",
    [username, email, password, role, id]
  );
  res.sendStatus(200);
});

app.delete("/api/users/:id", async (req, res) => {
  await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
  res.sendStatus(200);
});

app.get("/api/bookings", async (req, res) => {
  const result = await pool.query("SELECT * FROM bookings ORDER BY id ASC");
  res.json(result.rows);
});

app.post("/api/bookings", async (req, res) => {
  const { user_id, room_id, seats, start_date, end_date } = req.body;
  try {
    await pool.query(
      "INSERT INTO bookings (user_id, room_id, seats, start_date, end_date) VALUES ($1, $2, $3, $4, $5)",
      [user_id, room_id, seats, start_date, end_date]
    );
    await pool.query(
      "UPDATE rooms SET available_seats = available_seats - $1 WHERE id = $2",
      [seats, room_id]
    );
    res.status(201).json({ message: "Created" }); 
  } catch (err) {
    console.error("Booking insert error:", err);
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { seats, start_date, end_date } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Booking not found" });

    const booking = existing.rows[0];
    const delta = seats - booking.seats;

    await pool.query(
      "UPDATE rooms SET available_seats = available_seats - $1 WHERE id = $2",
      [delta, booking.room_id]
    );

    await pool.query(
      "UPDATE bookings SET seats=$1, start_date=$2, end_date=$3 WHERE id=$4",
      [seats, start_date, end_date, id]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  const id = req.params.id;
  const booking = await pool.query("SELECT * FROM bookings WHERE id=$1", [id]);
  if (booking.rows.length === 0) return res.sendStatus(404);
  const { room_id, seats } = booking.rows[0];
  await pool.query("DELETE FROM bookings WHERE id=$1", [id]);
  await pool.query(
    "UPDATE rooms SET available_seats = available_seats + $1 WHERE id = $2",
    [seats, room_id]
  );
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("Connecting to DB with:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});
  console.log("Server running on http://localhost:${PORT}");
});
