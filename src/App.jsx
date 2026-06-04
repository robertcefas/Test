import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PainelManicure from './pages/painel-manicure/PainelManicure';
import Login from './pages/login/Login';
import Cadastro from './pages/cadastro/Cadastro';
import AgendaCliente from './pages/agenda-cliente/AgendaCliente';


function App() {
  
  useEffect(() => {
    // Lógica de Carga Inicial de Serviços/Produtos
    const servicosSalvos = localStorage.getItem('servicos');

    // Se a lista estiver vazia, ele cadastra esses serviços padrão
    if (!servicosSalvos) {
      const listaInicial = [
        { id: 1, nome: "Pé e Mão", preco: "50.00" },
        { id: 2, nome: "Mão", preco: "30.00" },
        { id: 3, nome: "Pé", preco: "30.00" },
        { id: 4, nome: "Alongamento em Gel", preco: "120.00" },
        { id: 5, nome: "Manutenção em Gel", preco: "80.00" },
        { id: 6, nome: "Remoção de Alongamento", preco: "40.00" },
        { id: 7, nome: "Esmaltação em Gel", preco: "45.00" },
        { id: 8, nome: "Banho de Gel", preco: "70.00" }
      ];

      localStorage.setItem('servicos', JSON.stringify(listaInicial));
      console.log("Serviços iniciais carregados no banco local.");
    }
    
    // Configuração inicial da Agenda (caso não exista)
    if (!localStorage.getItem('configAgenda')) {
      const configPadrao = {
        datasBloqueadas: [],
        horaInicio: "09:00",
        horaFim: "18:00"
      };
      localStorage.setItem('configAgenda', JSON.stringify(configPadrao));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rota inicial: Login */}
        <Route path="/" element={<Login />} />
        
        {/* Rota de Cadastro */}
        <Route path="/cadastro" element={<Cadastro />} />
        
        {/* Rota da Agenda (Cliente logado) */}
        <Route path="/agenda-cliente" element={<AgendaCliente />} />
        
        {/* Rota do Painel (Manicure/Admin logado) */}
        <Route path="/painel-manicure" element={<PainelManicure />} />
      </Routes>
    </Router>
  );
}

export default App;