import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cadastro.css";

function Cadastro() {
  const navigate = useNavigate();

  // Estados para capturar os dados
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });

  // Função para lidar com as mudanças nos inputs
  const handleChange = (e) => {
    const { id, value, name, type } = e.target;
    if (type === 'radio') {
      setFormData({ ...formData, gender: id });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleCadastro = (e) => {
    e.preventDefault();

    // Validação básica de senha
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    // Pega os usuários atuais do localStorage
    const usuariosAtuais = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Verifica se o email já existe
    if (usuariosAtuais.find(u => u.email === formData.email)) {
      alert("Este e-mail já está cadastrado!");
      return;
    }

    // Cria o novo objeto de usuário
    const novoUsuario = {
      nome: `${formData.firstname} ${formData.lastname}`,
      email: formData.email,
      senha: formData.password,
      tipo: 'cliente', // Por padrão, cadastros no site são clientes
      telefone: formData.phone,
      genero: formData.gender
    };

    // Salva na lista
    usuariosAtuais.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuariosAtuais));

    alert("Cadastro realizado com sucesso! Agora faça seu login.");
    navigate("/"); // Volta para a tela de Login
  };

  return (
    <div className="cadastro-wrapper">
      <div className="form-container">
        <form onSubmit={handleCadastro}>
          <div className="Form-header">
            <h1>Cadastro</h1>
          </div>

          <div className="input-group">
            <div className="input-box">
              <label htmlFor="firstname">Primeiro Nome:</label>
              <input type="text" id="firstname" placeholder="Digite seu primeiro nome" onChange={handleChange} required />
            </div>

            <div className="input-box">
              <label htmlFor="lastname">Último Nome:</label>
              <input type="text" id="lastname" placeholder="Digite seu último nome" onChange={handleChange} required />
            </div>

            <div className="input-box">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" placeholder="Digite seu email" onChange={handleChange} required />
            </div>

            <div className="input-box">
              <label htmlFor="phone">Celular:</label>
              <input type="tel" id="phone" placeholder="XX XXXX-XXXX" onChange={handleChange} required />
            </div>

            <div className="input-box">
              <label htmlFor="password">Senha:</label>
              <input type="password" id="password" placeholder="*******" onChange={handleChange} required />
            </div>

            <div className="input-box">
              <label htmlFor="confirmPassword">Confirmar Senha:</label>
              <input type="password" id="confirmPassword" placeholder="*******" onChange={handleChange} required />
            </div>
          </div>

          <div className="gender-inputs">
            <div className="gender-title"><h6>Gênero:</h6></div>
            <div className="gender-group">
              <div className="gender-input">
                <input type="radio" id="female" name="gender" onChange={handleChange} />
                <label htmlFor="female">Feminino</label>
              </div>
              <div className="gender-input">
                <input type="radio" id="male" name="gender" onChange={handleChange} />
                <label htmlFor="male">Masculino</label>
              </div>
              <div className="gender-input">
                <input type="radio" id="other" name="gender" onChange={handleChange} />
                <label htmlFor="other">Outros</label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-cadastro">
            Cadastrar
          </button>

          <div className="login-link">
            <p>Já possui uma conta? <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Faça Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;