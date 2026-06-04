import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AgendaCliente.css";

function AgendaCliente() {
  const navigate = useNavigate();
  const [servicos, setServicos] = useState([]);
  const [agendamento, setAgendamento] = useState({
    servico: "",
    data: "",
    hora: "",
  });
  const [meusAgendamentos, setMeusAgendamentos] = useState([]);
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [configAgenda, setConfigAgenda] = useState(null);
  const [mostrarHoras, setMostrarHoras] = useState(false);
  const [agendadoComSucesso, setAgendadoComSucesso] = useState(false);

  const dataRef = new Date();
  const mesAtual = dataRef.getMonth();
  const anoAtual = dataRef.getFullYear();
  const proximoMesData = new Date(anoAtual, mesAtual + 1);
  const mesMax = proximoMesData.getMonth();
  const anoMax = proximoMesData.getFullYear();

  const [mesAtivo, setMesAtivo] = useState(mesAtual);
  const [anoAtivo, setAnoAtivo] = useState(anoAtual);
  const [diasVisiveis, setDiasVisiveis] = useState([]);

  const ajustarMes = (mes, ano, delta) => {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 0) {
      novoMes = 11;
      novoAno -= 1;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno += 1;
    }
    return { novoMes, novoAno };
  };

  const podeVoltar = mesAtivo !== mesAtual || anoAtivo !== anoAtual;
  const podeAvancar = mesAtivo !== mesMax || anoAtivo !== anoMax;

  const alterarMes = (delta) => {
    const { novoMes, novoAno } = ajustarMes(mesAtivo, anoAtivo, delta);
    const isAntesAtual =
      novoAno < anoAtual || (novoAno === anoAtual && novoMes < mesAtual);
    const isDepoisMax =
      novoAno > anoMax || (novoAno === anoMax && novoMes > mesMax);
    if (!isAntesAtual && !isDepoisMax) {
      setMesAtivo(novoMes);
      setAnoAtivo(novoAno);
      setAgendamento((prev) => ({ ...prev, hora: "" }));
    }
  };

  const usuarioLogado = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null",
  );

  // Função para carregar dados do LocalStorage
  const carregarDados = () => {
    if (!usuarioLogado) return;

    const agendamentosDB = JSON.parse(
      localStorage.getItem("agendamentos") || "[]",
    );
    const filtrados = agendamentosDB.filter(
      (a) => a.clienteEmail === usuarioLogado.email,
    );
    setTodosAgendamentos(Array.isArray(agendamentosDB) ? agendamentosDB : []);
    setMeusAgendamentos(filtrados);

    const servicosDB = JSON.parse(localStorage.getItem("servicos") || "[]");
    setServicos(Array.isArray(servicosDB) ? servicosDB : []);

    const config = JSON.parse(localStorage.getItem("configAgenda") || "{}");
    setConfigAgenda(config);
  };

  useEffect(() => {
    if (!usuarioLogado) {
      navigate("/");
    } else {
      carregarDados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ultimoDia = new Date(anoAtivo, mesAtivo + 1, 0).getDate();
    const hoje = new Date();
    const agora = Date.now();
    hoje.setHours(0, 0, 0, 0);

    const inicio = configAgenda?.horaInicio
      ? parseInt(configAgenda.horaInicio.split(":")[0], 10)
      : 9;
    const fim = configAgenda?.horaFim
      ? parseInt(configAgenda.horaFim.split(":")[0], 10)
      : 18;

    const dias = [];
    for (let i = 1; i <= ultimoDia; i++) {
      const dataISO = `${anoAtivo}-${String(mesAtivo + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const bloqueado = configAgenda?.datasBloqueadas?.includes(dataISO);
      const dataComparacao = new Date(`${dataISO}T00:00:00`);

      let disponivel = false;
      if (!bloqueado && dataComparacao >= hoje) {
        for (let hora = inicio; hora < fim; hora++) {
          const horaFormatada = `${String(hora).padStart(2, "0")}:00`;
          const dataHora = new Date(`${dataISO}T${horaFormatada}:00`).getTime();
          const estaPassado = dataHora <= agora;
          const jaAgendado = todosAgendamentos.some(
            (a) => a.data === dataISO && a.hora === horaFormatada,
          );
          if (!estaPassado && !jaAgendado) {
            disponivel = true;
            break;
          }
        }
      }

      dias.push({ dataISO, numero: i, disponivel });
    }
    setDiasVisiveis(dias);
  }, [mesAtivo, anoAtivo, configAgenda, todosAgendamentos]);

  const gerarHorasDinamicas = () => {
    const inicio = configAgenda?.horaInicio
      ? parseInt(configAgenda.horaInicio.split(":")[0], 10)
      : 9;
    const fim = configAgenda?.horaFim
      ? parseInt(configAgenda.horaFim.split(":")[0], 10)
      : 18;
    const horas = [];
    const agora = Date.now();

    for (let h = inicio; h < fim; h++) {
      const hora = `${String(h).padStart(2, "0")}:00`;
      const dataHora = new Date(`${agendamento.data}T${hora}:00`).getTime();
      const estaPassado = dataHora <= agora;
      const jaAgendado = todosAgendamentos.some(
        (a) => a.data === agendamento.data && a.hora === hora,
      );
      horas.push({ hora, disponivel: !estaPassado && !jaAgendado, jaAgendado });
    }
    return horas;
  };

  const finalizarAgendamento = (e) => {
    e.preventDefault();
    if (!agendamento.servico || !agendamento.data || !agendamento.hora) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const novo = {
      id: Date.now(),
      clienteNome: usuarioLogado.nome,
      clienteEmail: usuarioLogado.email,
      ...agendamento,
    };

    const banco = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    localStorage.setItem("agendamentos", JSON.stringify([...banco, novo]));

    setAgendadoComSucesso(true);
    carregarDados();
  };

  const cancelarHorario = (id, dataAg, horaAg) => {
    const agora = new Date();
    const dataHoraAtendimento = new Date(`${dataAg}T${horaAg}:00`);
    const diffHoras = (dataHoraAtendimento - agora) / (1000 * 60 * 60);

    if (diffHoras < 2) {
      alert("Cancelamento indisponível (mínimo 2h de antecedência).");
      return;
    }

    if (window.confirm("Deseja cancelar?")) {
      const todos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
      const filtrados = todos.filter((a) => a.id !== id);
      localStorage.setItem("agendamentos", JSON.stringify(filtrados));
      carregarDados();
    }
  };

  if (agendadoComSucesso) {
    return (
      <div className="sucesso-wrapper">
        <div className="card-sucesso">
          <h2>✅ Agendado!</h2>
          <button
            onClick={() => {
              setAgendadoComSucesso(false);
              setAgendamento({ servico: "", data: "", hora: "" });
            }}
            className="btn-novo"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cliente-wrapper">
      <nav className="cliente-nav">
        <div className="nav-content">
          <span>
            Olá, <strong>{usuarioLogado?.nome}</strong>
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("usuarioLogado");
              navigate("/");
            }}
            className="btn-sair"
          >
            Sair
          </button>
        </div>
      </nav>

      <div className="cliente-container">
        <div className="card-agenda-cliente">
          <h2>Novo Agendamento</h2>
          <form onSubmit={finalizarAgendamento}>
            <select
              value={agendamento.servico}
              onChange={(e) =>
                setAgendamento({ ...agendamento, servico: e.target.value })
              }
              className="select-servico"
            >
              <option value="">Escolha o serviço...</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.nome}>
                  {s.nome} - R$ {s.preco}
                </option>
              ))}
            </select>

            <div className="seletor-mes-cliente">
              <button
                type="button"
                onClick={() => alterarMes(-1)}
                disabled={!podeVoltar}
              >
                &lt;
              </button>
              <span className="mes-nome">
                {new Date(anoAtivo, mesAtivo).toLocaleString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                type="button"
                onClick={() => alterarMes(1)}
                disabled={!podeAvancar}
              >
                &gt;
              </button>
            </div>

            <div className="calendario-cliente-grid">
              {diasVisiveis.map((dia) => (
                <div
                  key={dia.dataISO}
                  className={`dia-bolinha ${!dia.disponivel ? "off" : agendamento.data === dia.dataISO ? "selected" : "on"}`}
                  onClick={() =>
                    dia.disponivel &&
                    setAgendamento({
                      ...agendamento,
                      data: dia.dataISO,
                      hora: "",
                    })
                  }
                >
                  {dia.numero}
                </div>
              ))}
            </div>

            {agendamento.data && (
              <div className="expander-horas-cliente">
                <button
                  type="button"
                  className="btn-toggle-horas-cliente"
                  onClick={() => setMostrarHoras(!mostrarHoras)}
                >
                  Horários Disponíveis
                </button>
                {mostrarHoras && (
                  <div className="grid-horas-cliente">
                    {gerarHorasDinamicas().map((horaItem) => (
                      <div
                        key={horaItem.hora}
                        className={`hora-item ${agendamento.hora === horaItem.hora ? "active" : ""} ${!horaItem.disponivel ? "off" : ""}`}
                        onClick={() =>
                          horaItem.disponivel &&
                          setAgendamento({
                            ...agendamento,
                            hora: horaItem.hora,
                          })
                        }
                      >
                        {horaItem.hora}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* O BOTÃO FOI ARRUMADO E COLOCADO AQUI, DENTRO DO FORMULÁRIO */}
            <button
              type="submit"
              className="btn-confirmar-final"
              disabled={
                !agendamento.servico || !agendamento.data || !agendamento.hora
              }
            >
              Confirmar
            </button>
          </form>

          <div className="meus-agendamentos-fixo">
            <h3>🗓️ Meus Horários</h3>
            {meusAgendamentos.map((m) => (
              <div key={m.id} className="card-meu-horario">
                <div className="info">
                  <strong>{m.servico}</strong>
                  <span>
                    {m.data.split("-").reverse().join("/")} às {m.hora}
                  </span>
                </div>
                <button
                  onClick={() => cancelarHorario(m.id, m.data, m.hora)}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgendaCliente;
