import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Cria o admin se não existir
const configurarAdmin = () => {
  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  if (!usuarios.find((u) => u.email === "admin@estudio.com")) {
    usuarios.push({
      nome: "Admin Manicure",
      email: "admin@estudio.com",
      senha: "123",
      tipo: "manicure",
    });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
};

configurarAdmin();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
