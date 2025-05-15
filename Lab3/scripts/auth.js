
document.addEventListener("DOMContentLoaded", () => {
initializeDefaultAdmin();
});

function initializeDefaultAdmin() {
  const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
  if (existingUsers.length === 0) {
    const admin = {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      password: "admin",
      role: "admin"
    };
    localStorage.setItem("users", JSON.stringify([admin]));
    console.log("Default admin created.");
  }
}
