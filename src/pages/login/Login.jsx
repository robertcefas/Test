import React, { useState } from "react"; // <-- IMPORTANTE: useState adicionado aqui
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // Guardam o que o usuário digita nos campos
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Função para o botão "Entrar"
  const handleLoginNormal = () => {
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuarioEncontrado = usuarios.find(
      (usuario) => usuario.email === email && usuario.senha === senha,
    );

    if (!usuarioEncontrado) {
      alert("Usuário ou senha inválidos. Verifique seus dados ou cadastre-se.");
      return;
    }

    localStorage.setItem(
      "usuarioLogado",
      JSON.stringify({
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        tipo: usuarioEncontrado.tipo,
      }),
    );

    if (usuarioEncontrado.tipo === "manicure") {
      navigate("/painel-manicure");
    } else {
      navigate("/agenda-cliente");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1>Login</h1>

        <div className="login-input-group">
          <label>E-mail</label>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email} // <-- Liga a variável ao campo
            onChange={(e) => setEmail(e.target.value)} // <-- Salva o que foi digitado
          />
        </div>

        <div className="login-input-group">
          <label>Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha} // <-- Liga a variável ao campo
            onChange={(e) => setSenha(e.target.value)} // <-- Salva o que foi digitado
          />
        </div>

        {/* Adicionado o onClick para chamar a função do Admin */}
        <button className="btn-login" onClick={handleLoginNormal}>
          Entrar
        </button>

        <div className="signup-link">
          Não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
