import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PainelManicure.css";

function PainelManicure() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [editandoServico, setEditandoServico] = useState(null);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [mostrarHoras, setMostrarHoras] = useState(false);
  const [agendamentoAdiantado, setAgendamentoAdiantado] = useState(null);
  const [novaHoraAdiantada, setNovaHoraAdiantada] = useState("");

  const [configAgenda, setConfigAgenda] = useState({
    datasBloqueadas: [],
    horaInicio: "09:00",
    horaFim: "18:00",
  });

  const dataHoje = new Date();
  const mesAtual = dataHoje.getMonth();
  const anoAtual = dataHoje.getFullYear();
  const proximoMesData = new Date(anoAtual, mesAtual + 1);
  const mesMax = proximoMesData.getMonth();
  const anoMax = proximoMesData.getFullYear();

  const [mesAtivo, setMesAtivo] = useState(mesAtual);
  const [anoAtivo, setAnoAtivo] = useState(anoAtual);
  const [diasDoMes, setDiasDoMes] = useState([]);
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

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
    }
  };

  useEffect(() => {
    const dadosAg = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    setAgendamentos(dadosAg);

    const servicosSalvos = JSON.parse(localStorage.getItem("servicos") || "[]");
    setServicos(servicosSalvos);

    const agendaSalva = JSON.parse(localStorage.getItem("configAgenda"));
    if (agendaSalva) setConfigAgenda(agendaSalva);
  }, []);

  useEffect(() => {
    const ultimoDia = new Date(anoAtivo, mesAtivo + 1, 0).getDate();
    const primeiroDiaMes = new Date(anoAtivo, mesAtivo, 1).getDay();
    const dias = [];

    for (let vazio = 0; vazio < primeiroDiaMes; vazio++) {
      dias.push({ placeholder: true, key: `vazio-${vazio}` });
    }

    for (let i = 1; i <= ultimoDia; i++) {
      const dataFormatada = `${anoAtivo}-${String(mesAtivo + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      dias.push({ data: dataFormatada, numero: i });
    }
    setDiasDoMes(dias);
  }, [mesAtivo, anoAtivo]);

  const salvarServico = (e) => {
    e.preventDefault();
    let novos;
    if (editandoServico.id) {
      novos = servicos.map((s) =>
        s.id === editandoServico.id ? editandoServico : s,
      );
    } else {
      novos = [...servicos, { ...editandoServico, id: Date.now() }];
    }
    setServicos(novos);
    localStorage.setItem("servicos", JSON.stringify(novos));
    setEditandoServico(null);
  };

  const excluirServico = (id) => {
    const novos = servicos.filter((s) => s.id !== id);
    setServicos(novos);
    localStorage.setItem("servicos", JSON.stringify(novos));
  };

  const verDadosCliente = (email) => {
    const todos = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const achei = todos.find((u) => u.email === email);
    if (achei) setClienteInfo(achei);
  };

  const abrirModalAdiantamento = (agendamento) => {
    setAgendamentoAdiantado(agendamento);
    setNovaHoraAdiantada(agendamento.horaAdiantada || "");
  };

  const salvarHoraAdiantada = () => {
    if (!novaHoraAdiantada) {
      alert("Por favor, defina um horário.");
      return;
    }

    const novos = agendamentos.map((ag) =>
      ag.id === agendamentoAdiantado.id
        ? { ...ag, horaAdiantada: novaHoraAdiantada }
        : ag,
    );
    setAgendamentos(novos);
    localStorage.setItem("agendamentos", JSON.stringify(novos));
    setAgendamentoAdiantado(null);
    setNovaHoraAdiantada("");
  };

  const removerHoraAdiantada = () => {
    const novos = agendamentos.map((ag) =>
      ag.id === agendamentoAdiantado.id ? { ...ag, horaAdiantada: null } : ag,
    );
    setAgendamentos(novos);
    localStorage.setItem("agendamentos", JSON.stringify(novos));
    setAgendamentoAdiantado(null);
    setNovaHoraAdiantada("");
  };

  const concluirAgendamento = (id) => {
    const novos = agendamentos.filter((ag) => ag.id !== id);
    setAgendamentos(novos);
    localStorage.setItem("agendamentos", JSON.stringify(novos));
  };

  const alternarData = (data) => {
    const hojeComp = new Date().setHours(0, 0, 0, 0);
    if (new Date(data + "T00:00:00") < hojeComp) return;
    let novas = configAgenda.datasBloqueadas.includes(data)
      ? configAgenda.datasBloqueadas.filter((d) => d !== data)
      : [...configAgenda.datasBloqueadas, data];
    setConfigAgenda({ ...configAgenda, datasBloqueadas: novas });
  };

  return (
    <div className="painel-wrapper">
      <nav className="painel-nav">
        <div className="logo-admin">
          Nails for You <strong>Admin</strong>
        </div>
        <button onClick={() => navigate("/")} className="btn-logout">
          Sair
        </button>
      </nav>

      <div className="painel-grid">
        <div className="coluna-esquerda">
          {/* TABELA DE AGENDAMENTOS MÓVEL ADAPTADA */}
          <section className="card-admin">
            <h2 className="titulo-secao">Próximos Agendamentos</h2>
            <div className="tabela-scroll-container">
              <table className="tabela-agendamentos">
                <thead>
                  <tr>
                    <th>CLIENTE</th>
                    <th>SERVIÇO</th>
                    <th>DATA/HORA</th>
                    <th>STATUS</th>
                    <th>AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="sem-dados">
                        Nenhum agendamento pendente.
                      </td>
                    </tr>
                  ) : (
                    agendamentos.map((ag) => (
                      <tr key={ag.id}>
                        <td>
                          <button
                            className="link-nome"
                            onClick={() => verDadosCliente(ag.clienteEmail)}
                          >
                            {ag.clienteNome}
                          </button>
                        </td>
                        <td className="col-servico">{ag.servico}</td>
                        <td className="col-data">
                          {ag.data} <br /> <span>às {ag.hora}</span>
                        </td>
                        <td>
                          <span className="status-badge">
                            {ag.pago50
                              ? `💳 50% Pago`
                              : ag.horaAdiantada
                                ? `⚡ ${ag.horaAdiantada}`
                                : "📅 Normal"}
                          </span>
                        </td>
                        <td>
                          <div className="celula-botoes">
                            <button
                              className="btn-adiantar"
                              onClick={() => abrirModalAdiantamento(ag)}
                            >
                              Adiantar
                            </button>
                            <button
                              className="btn-concluir"
                              onClick={() => concluirAgendamento(ag.id)}
                            >
                              Concluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* GESTÃO DE SERVIÇOS (PRODUTOS) */}
          <section className="card-admin mt-20">
            <div className="titulo-secao">
              <span>Serviços e Produtos</span>
              <button
                className="btn-add-servico"
                onClick={() => setEditandoServico({ nome: "", preco: "" })}
              >
                + Novo
              </button>
            </div>

            {editandoServico && (
              <form className="form-servico" onSubmit={salvarServico}>
                <input
                  type="text"
                  placeholder="Nome do serviço"
                  value={editandoServico.nome}
                  onChange={(e) =>
                    setEditandoServico({
                      ...editandoServico,
                      nome: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Preço (ex: 35.00)"
                  value={editandoServico.preco}
                  onChange={(e) =>
                    setEditandoServico({
                      ...editandoServico,
                      preco: e.target.value,
                    })
                  }
                  required
                />
                <div className="form-btns">
                  <button type="submit" className="btn-save-s">
                    Gravar
                  </button>
                  <button
                    type="button"
                    className="btn-cancel-s"
                    onClick={() => setEditandoServico(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <ul className="lista-produtos">
              {servicos.map((s) => (
                <li key={s.id}>
                  <span className="produto-texto">
                    {s.nome} - <strong>R$ {s.preco}</strong>
                  </span>
                  <div className="acoes">
                    <button onClick={() => setEditandoServico(s)}>
                      Editar
                    </button>
                    <button
                      onClick={() => excluirServico(s.id)}
                      className="txt-red"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="coluna-direita">
          {/* CALENDÁRIO */}
          <section className="card-admin">
            <div className="agenda-nav">
              <button onClick={() => alterarMes(-1)} disabled={!podeVoltar}>
                &lt;
              </button>
              <h3>
                {new Date(anoAtivo, mesAtivo).toLocaleString("pt-BR", {
                  month: "long",
                })}
              </h3>
              <button onClick={() => alterarMes(1)} disabled={!podeAvancar}>
                &gt;
              </button>
            </div>

            <div className="calendario-header">
              {diasSemana.map((nome) => (
                <span key={nome} className="dia-semana-header">
                  {nome}
                </span>
              ))}
            </div>
            <div className="calendario-grid">
              {diasDoMes.map((item) =>
                item.placeholder ? (
                  <div key={item.key} className="dia-blank" />
                ) : (
                  <div
                    key={item.data}
                    className={`dia-box ${configAgenda.datasBloqueadas.includes(item.data) || new Date(item.data + "T00:00:00") < new Date().setHours(0, 0, 0, 0) ? "off" : "on"}`}
                    onClick={() => alternarData(item.data)}
                  >
                    {item.numero}
                  </div>
                )
              )}
            </div>

            <button
              className="btn-collapse"
              onClick={() => setMostrarHoras(!mostrarHoras)}
            >
              Configurar Horários {mostrarHoras ? "▲" : "▼"}
            </button>

            {mostrarHoras && (
              <div className="horas-config">
                <input
                  type="time"
                  value={configAgenda.horaInicio}
                  onChange={(e) =>
                    setConfigAgenda({
                      ...configAgenda,
                      horaInicio: e.target.value,
                    })
                  }
                />
                <span>às</span>
                <input
                  type="time"
                  value={configAgenda.horaFim}
                  onChange={(e) =>
                    setConfigAgenda({
                      ...configAgenda,
                      horaFim: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div className="pix-config" style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
                Chave PIX
              </label>
              <input
                type="text"
                placeholder="CPF / CNPJ / E-mail / Celular"
                value={configAgenda.pixChave || ""}
                onChange={(e) =>
                  setConfigAgenda({ ...configAgenda, pixChave: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  marginBottom: 8,
                }}
              />
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
                QR Code PIX (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setConfigAgenda({
                      ...configAgenda,
                      pixQRCode: reader.result,
                    });
                  reader.readAsDataURL(file);
                }}
              />
              {configAgenda.pixQRCode && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={configAgenda.pixQRCode}
                    alt="PIX QR"
                    style={{ maxWidth: "100%", borderRadius: 8 }}
                  />
                </div>
              )}
            </div>

            <button
              className="btn-principal"
              onClick={() => {
                localStorage.setItem(
                  "configAgenda",
                  JSON.stringify(configAgenda)
                );
                alert("Configurações salvas!");
              }}
            >
              Salvar Disponibilidade
            </button>
          </section>
        </aside>
      </div>

      {/* MODAL CLIENTE */}
      {clienteInfo && (
        <div className="modal-bg" onClick={() => setClienteInfo(null)}>
          <div className="modal-perfil" onClick={(e) => e.stopPropagation()}>
            <div className="perfil-topo">
              <div className="perfil-avatar">{clienteInfo.nome.charAt(0)}</div>
              <h3>Dados da Cliente</h3>
            </div>
            <div className="perfil-dados">
              <p><strong>Nome:</strong> {clienteInfo.nome}</p>
              <p><strong>E-mail:</strong> {clienteInfo.email}</p>
              <p><strong>Telefone:</strong> {clienteInfo.telefone || "Não informado"}</p>
            </div>
            <button className="btn-close" onClick={() => setClienteInfo(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL ADIANTAMENTO */}
      {agendamentoAdiantado && (
        <div className="modal-bg" onClick={() => setAgendamentoAdiantado(null)}>
          <div className="modal-adiantamento" onClick={(e) => e.stopPropagation()}>
            <h3>⚡ Adiantar Horário</h3>
            <div className="info-agendamento-modal">
              <p><strong>Cliente:</strong> {agendamentoAdiantado.clienteNome}</p>
              <p><strong>Serviço:</strong> {agendamentoAdiantado.servico}</p>
              <p><strong>Horário Agendado:</strong> {agendamentoAdiantado.data} às {agendamentoAdiantado.hora}</p>
            </div>
            <label className="label-input">
              Nova hora (cliente pode vir):
              <input
                type="time"
                value={novaHoraAdiantada}
                onChange={(e) => setNovaHoraAdiantada(e.target.value)}
                className="input-hora-adiantada"
              />
            </label>
            <div className="botoes-adiantamento">
              <button className="btn-cancelar-modal" onClick={() => setAgendamentoAdiantado(null)}>
                Cancelar
              </button>
              {agendamentoAdiantado.horaAdiantada && (
                <button className="btn-remover-adiantamento" onClick={removerHoraAdiantada}>
                  Remover
                </button>
              )}
              <button className="btn-salvar-adiantamento" onClick={salvarHoraAdiantada}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PainelManicure;