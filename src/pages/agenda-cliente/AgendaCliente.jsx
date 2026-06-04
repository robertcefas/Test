import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WhatsAppLogo from "../../assets/whatsapp.png";
import InstagramLogo from "../../assets/Instagram_icon.png";
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
  const [mostrandoRevisao, setMostrandoRevisao] = useState(false);
  const [agendadoComSucesso, setAgendadoComSucesso] = useState(false);
  const whatsappLink = "https://wa.me/5571996740584"; // coloque o WhatsApp aqui
  const instagramLink =
    "https://www.instagram.com/evelinnaiils__?igsh=NXlnYmIyaTlwOHMx"; // coloque o Instagram aqui

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

  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

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
    const primeiroDiaMes = new Date(anoAtivo, mesAtivo, 1).getDay();
    for (let vazio = 0; vazio < primeiroDiaMes; vazio++) {
      dias.push({ placeholder: true, key: `vazio-${vazio}` });
    }

    for (let i = 1; i <= ultimoDia; i++) {
      const dataISO = `${anoAtivo}-${String(mesAtivo + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const bloqueado = configAgenda?.datasBloqueadas?.includes(dataISO);
      const dataComparacao = new Date(anoAtivo, mesAtivo, i);
      const diaSemana = diasSemana[dataComparacao.getDay()];

      let disponivel = false;
      if (!bloqueado && dataComparacao >= hoje) {
        for (let hora = inicio; hora < fim; hora++) {
          const horaFormatada = `${String(hora).padStart(2, "0")}:00`;
          const dataHora = new Date(
            anoAtivo,
            mesAtivo,
            i,
            hora,
            0,
            0,
          ).getTime();
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

      dias.push({ dataISO, numero: i, disponivel, diaSemana });
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

    const [ano, mes, dia] = agendamento.data.split("-").map(Number);
    for (let h = inicio; h < fim; h++) {
      const hora = `${String(h).padStart(2, "0")}:00`;
      const dataHora = new Date(ano, mes - 1, dia, h, 0, 0).getTime();
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
    // Mostrar tela de revisão em vez de salvar direto
    setMostrandoRevisao(true);
  };

  const confirmarAgendamentoFinal = () => {
    const novo = {
      id: Date.now(),
      clienteNome: usuarioLogado.nome,
      clienteEmail: usuarioLogado.email,
      ...agendamento,
    };

    const banco = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    localStorage.setItem("agendamentos", JSON.stringify([...banco, novo]));

    setAgendadoComSucesso(true);
    setMostrandoRevisao(false);
    carregarDados();
  };

  const obterStatusAgendamento = (dataAg, horaAg, agendamento) => {
    const agora = new Date();
    const [ano, mes, dia] = dataAg.split("-").map(Number);
    const [hora, minuto] = horaAg.split(":").map(Number);
    const dataHoraAtendimento = new Date(ano, mes - 1, dia, hora, minuto, 0);
    const diffHoras = (dataHoraAtendimento - agora) / (1000 * 60 * 60);
    const diffMinutos = Math.round(diffHoras * 60);

    let status = "agendado";
    let podeCancel = true;
    let mensagemStatus = "";

    if (diffHoras < 0) {
      status = "finalizado";
      mensagemStatus = "✓ Finalizado";
      podeCancel = false;
    } else if (diffHoras < 2) {
      status = "proximamente";
      podeCancel = false;
      mensagemStatus = `⏱️ Próximo em ${diffMinutos}min`;
      if (diffHoras < 0.5) {
        mensagemStatus = "🔔 Em Atendimento";
      }
    } else if (agendamento.horaAdiantada) {
      status = "adiantado";
      mensagemStatus = `⚡ Pode vir às ${agendamento.horaAdiantada}`;
    } else {
      mensagemStatus = `⏰ Cancelável por ${Math.floor(diffHoras)}h`;
    }

    return { status, podeCancel, mensagemStatus, diffHoras, diffMinutos };
  };

  const cancelarHorario = (id, dataAg, horaAg) => {
    const agora = new Date();
    const [ano, mes, dia] = dataAg.split("-").map(Number);
    const [hora, minuto] = horaAg.split(":").map(Number);
    const dataHoraAtendimento = new Date(ano, mes - 1, dia, hora, minuto, 0);
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

  if (mostrandoRevisao) {
    const dataFormatada = agendamento.data.split("-").reverse().join("/");
    const servicoInfo = servicos.find((s) => s.nome === agendamento.servico);

    return (
      <div className="revisao-wrapper">
        <div className="card-revisao">
          <h2>Confirme seu Agendamento</h2>
          <div className="revisao-detalhes">
            <div className="detalhe-item">
              <span className="detalhe-label">Serviço:</span>
              <span className="detalhe-valor">
                {agendamento.servico}
                {servicoInfo && ` - R$ ${servicoInfo.preco}`}
              </span>
            </div>
            <div className="detalhe-item">
              <span className="detalhe-label">Data:</span>
              <span className="detalhe-valor">{dataFormatada}</span>
            </div>
            <div className="detalhe-item">
              <span className="detalhe-label">Horário:</span>
              <span className="detalhe-valor">{agendamento.hora}</span>
            </div>
          </div>
          <div className="botoes-revisao">
            <button
              onClick={() => setMostrandoRevisao(false)}
              className="btn-voltar-revisao"
            >
              Voltar
            </button>
            <button
              onClick={confirmarAgendamentoFinal}
              className="btn-confirmar-revisao"
            >
              Confirmar Agendamento
            </button>
          </div>
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

            <div className="calendario-cliente-header">
              {diasSemana.map((nome) => (
                <span key={nome} className="dia-semana-header">
                  {nome}
                </span>
              ))}
            </div>
            <div className="calendario-cliente-grid">
              {diasVisiveis.map((dia) =>
                dia.placeholder ? (
                  <div key={dia.key} className="dia-blank" />
                ) : (
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
                ),
              )}
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
            {meusAgendamentos.map((m) => {
              const { status, podeCancel, mensagemStatus, diffHoras } =
                obterStatusAgendamento(m.data, m.hora, m);
              const dataFormatada = m.data.split("-").reverse().join("/");

              return (
                <div key={m.id} className={`card-meu-horario status-${status}`}>
                  <div className="barra-status">
                    <span className={`badge-status badge-${status}`}>
                      {status === "agendado" && "📅"}
                      {status === "proximamente" && "🔔"}
                      {status === "finalizado" && "✓"}
                      {status === "adiantado" && "⚡"}
                    </span>
                  </div>

                  <div className="info">
                    <strong>{m.servico}</strong>
                    <span>
                      {dataFormatada} às {m.hora}
                    </span>
                  </div>

                  <div className="status-info">
                    <span className={`mensagem-status msg-${status}`}>
                      {mensagemStatus}
                    </span>
                    {m.horaAdiantada && (
                      <span className="info-adiantada">
                        Manicure: você pode vir às {m.horaAdiantada}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => cancelarHorario(m.id, m.data, m.hora)}
                    className={`btn-cancelar ${!podeCancel ? "desativado" : ""}`}
                    disabled={!podeCancel}
                    title={
                      !podeCancel
                        ? "Não é possível cancelar com menos de 2h de antecedência"
                        : "Cancelar agendamento"
                    }
                  >
                    Cancelar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="social-footer">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="btn-sociais btn-whatsapp"
          aria-label="Contato WhatsApp"
        >
          <img src={WhatsAppLogo} alt="WhatsApp" />
        </a>
        <a
          href={instagramLink}
          target="_blank"
          rel="noreferrer"
          className="btn-sociais btn-instagram"
          aria-label="Instagram"
        >
          <img src={InstagramLogo} alt="Instagram" />
        </a>
      </div>
    </div>
  );
}

export default AgendaCliente;
