const initialLeads = [
  ["100% Logística","Logística"],
  ["Dunorte Distribuidora","Distribuição"],
  ["Distribuidora Lopes","Distribuição"],
  ["AGM Distribuidora","Distribuição"],
  ["Aurora Amazon Terminals","Logística"],
  ["H&R da Amazônia","Logística"],
  ["Larifo Transportes","Logística"],
  ["Tapajós Distribuidora","Distribuição"],
  ["Treméa Transportes","Logística"],
  ["Dismelo Distribuidora","Distribuição"],
  ["Ágil Transportes & Logística","Logística"],
  ["Amazônico Distribuidora","Distribuição"],
  ["Jabil Manaus","Indústria"],
  ["JAM Logística","Logística"],
  ["Fennix Brasil Distribuidora","Distribuição"],
  ["Recofarma","Indústria"],
  ["Distribuidora G.O. Estivas","Distribuição"],
  ["Distribuidora JLC","Distribuição"],
  ["Decares Comércio","Distribuição"],
  ["Mapemi Brasil","Distribuição"],
  ["Check Up Hospital","Saúde"],
  ["Hospital Santa Júlia","Saúde"],
  ["Hospital Adventista de Manaus","Saúde"],
  ["Pró-Saúde","Saúde"],
  ["Uroclin","Saúde"],
  ["Hosplab Med","Saúde"],
  ["NS Hospitalar","Saúde"],
  ["Toyolex Toyota","Concessionária"],
  ["Renault Du Nort","Concessionária"],
  ["Mult Results Veículos","Concessionária"],
  ["Shizen Veículos","Concessionária"],
  ["Murano Veículos","Concessionária"],
  ["Mardisa Mercedes-Benz","Concessionária"],
  ["Pedragon Chevrolet","Concessionária"],
  ["Hyundai Parvi Manaus","Concessionária"],
  ["Urban 92 Cars","Concessionária"],
  ["Chevrolet Braga","Concessionária"],
  ["Solutions 2 GO do Brasil","Tecnologia"],
  ["CDL Centro de Distribuição e Logística","Logística"],
  ["Amazônia Distribuição de Alimentos","Distribuição"],
  ["Koretech Embalagens da Amazônia","Indústria"],
  ["Via Certa Importação e Distribuição de Alimentos","Distribuição"],
  ["Norte Forte Distribuidora","Distribuição"],
  ["Futtura Distribuição e Serviços de Informática","Tecnologia"],
  ["Amazonas Energia","Infraestrutura"],
  ["Moto Honda da Amazônia","Indústria"],
  ["P&G Brasil","Indústria"],
  ["Digibras Indústria do Brasil","Indústria"],
  ["Mineração Taboca","Indústria"],
  ["Ritta Construções","Construção"]
];

const STORAGE_KEY = "fluxia-leads-v2";

const statuses = [
  "Novo",
  "Contatado",
  "Em negociação",
  "Reunião agendada",
  "Sem interesse"
];

function createInitialLeads() {
  return initialLeads.map((item, index) => ({
    id: index + 1,
    name: item[0],
    segment: item[1],
    phone: "",
    status: "Novo",
    notes: ""
  }));
}

let leads;

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  leads = saved ? JSON.parse(saved) : createInitialLeads();

  if (!Array.isArray(leads)) {
    leads = createInitialLeads();
  }
} catch (error) {
  leads = createInitialLeads();
}

const $ = id => document.getElementById(id);

const table = $("leadTable");
const dialog = $("leadDialog");
const form = $("leadForm");

function saveLeads() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (error) {
    alert("Não foi possível salvar os dados neste navegador.");
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function digits(phone = "") {
  return String(phone).replace(/\D/g, "");
}

function whatsappNumber(phone = "") {
  let number = digits(phone);

  if (number.length === 10 || number.length === 11) {
    number = "55" + number;
  }

  return number;
}

function createMessage(lead) {
  return `Olá, tudo bem? Meu nome é Lucas e faço parte da Fluxia.

Trabalhamos com soluções de automação, inteligência artificial e integração de sistemas para ajudar empresas a otimizar seus processos.

Queria entender um pouco sobre a operação da ${lead.name} e saber se existe alguma oportunidade de melhoria. Quem seria a pessoa responsável por essa área?`;
}

function updateSegmentFilter() {
  const select = $("segmentFilter");
  const previous = select.value;

  const segments = [
    ...new Set(leads.map(lead => lead.segment).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  select.innerHTML =
    '<option value="">Todos os segmentos</option>' +
    segments.map(segment =>
      `<option value="${escapeHTML(segment)}">${escapeHTML(segment)}</option>`
    ).join("");

  select.value = segments.includes(previous) ? previous : "";
}

function render() {
  updateSegmentFilter();

  const query = $("searchInput").value
    .trim()
    .toLocaleLowerCase("pt-BR");

  const segment = $("segmentFilter").value;
  const status = $("statusFilter").value;

  const filtered = leads.filter(lead => {
    const content = [
      lead.name,
      lead.segment,
      lead.phone,
      lead.notes
    ].join(" ").toLocaleLowerCase("pt-BR");

    return content.includes(query)
      && (!segment || lead.segment === segment)
      && (!status || lead.status === status);
  });

  table.innerHTML = filtered.map(lead => {
    const number = whatsappNumber(lead.phone);
    const validPhone = number.length >= 12 && number.length <= 13;

    const options = statuses.map(item =>
      `<option value="${escapeHTML(item)}"
        ${lead.status === item ? "selected" : ""}>
        ${escapeHTML(item)}
      </option>`
    ).join("");

    return `
      <tr>
        <td>
          <span class="company-name">${escapeHTML(lead.name)}</span>
          ${lead.notes
            ? `<span class="company-notes">${escapeHTML(lead.notes)}</span>`
            : ""}
        </td>

        <td>
          <span class="segment-pill">${escapeHTML(lead.segment)}</span>
        </td>

        <td>
          ${lead.phone
            ? escapeHTML(lead.phone)
            : '<span class="phone-missing">Confirmar número</span>'}
        </td>

        <td>
          <select class="status-select"
            data-status="${lead.id}"
            aria-label="Status de ${escapeHTML(lead.name)}">
            ${options}
          </select>
        </td>

        <td>
          <div class="actions">
            <button class="action-btn whatsapp"
              data-wa="${lead.id}"
              ${validPhone ? "" : "disabled"}>
              WhatsApp ↗
            </button>

            <button class="action-btn"
              data-call="${lead.id}"
              ${digits(lead.phone).length >= 10 ? "" : "disabled"}>
              Ligar
            </button>

            <button class="row-edit" data-edit="${lead.id}">
              Editar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  $("emptyState").hidden = filtered.length > 0;

  $("resultsCount").textContent =
    `${filtered.length} ${filtered.length === 1 ? "empresa" : "empresas"}`;

  $("totalCount").textContent = leads.length;

  $("newCount").textContent =
    leads.filter(lead => lead.status === "Novo").length;

  $("progressCount").textContent =
    leads.filter(lead =>
      ["Contatado", "Em negociação", "Reunião agendada"]
        .includes(lead.status)
    ).length;
}

function openEditor(lead = null) {
  form.reset();

  $("leadId").value = lead ? lead.id : "";
  $("dialogTitle").textContent =
    lead ? "Editar empresa" : "Adicionar empresa";

  $("companyInput").value = lead?.name || "";
  $("segmentInput").value = lead?.segment || "";
  $("phoneInput").value = lead?.phone || "";
  $("leadStatusInput").value = lead?.status || "Novo";
  $("notesInput").value = lead?.notes || "";

  dialog.showModal();
}

$("searchInput").addEventListener("input", render);
$("segmentFilter").addEventListener("change", render);
$("statusFilter").addEventListener("change", render);

$("addBtn").addEventListener("click", () => openEditor());

$("closeDialog").addEventListener("click", () => dialog.close());
$("cancelDialog").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", event => {
  if (event.target === dialog) {
    dialog.close();
  }
});

form.addEventListener("submit", event => {
  event.preventDefault();

  const id = $("leadId").value;

  const data = {
    name: $("companyInput").value.trim(),
    segment: $("segmentInput").value.trim(),
    phone: $("phoneInput").value.trim(),
    status: $("leadStatusInput").value,
    notes: $("notesInput").value.trim()
  };

  if (!data.name || !data.segment) {
    alert("Preencha o nome da empresa e o segmento.");
    return;
  }

  if (id) {
    const index = leads.findIndex(
      lead => String(lead.id) === id
    );

    if (index !== -1) {
      leads[index] = { ...leads[index], ...data };
    }
  } else {
    leads.unshift({
      id: Date.now(),
      ...data
    });
  }

  saveLeads();
  dialog.close();
  render();
});

table.addEventListener("change", event => {
  const id = event.target.dataset.status;

  if (!id) return;

  const lead = leads.find(item => String(item.id) === id);

  if (lead) {
    lead.status = event.target.value;
    saveLeads();
    render();
  }
});

table.addEventListener("click", event => {
  const waButton = event.target.closest("[data-wa]");
  const callButton = event.target.closest("[data-call]");
  const editButton = event.target.closest("[data-edit]");

  if (waButton) {
    const lead = leads.find(
      item => String(item.id) === waButton.dataset.wa
    );

    if (!lead) return;

    const number = whatsappNumber(lead.phone);

    if (number.length < 12 || number.length > 13) {
      alert("Cadastre um telefone válido com DDD.");
      return;
    }

    const url =
      `https://wa.me/${number}?text=${encodeURIComponent(createMessage(lead))}`;

    window.open(url, "_blank");

    if (lead.status === "Novo") {
      lead.status = "Contatado";
      saveLeads();
      render();
    }
  }

  if (callButton) {
    const lead = leads.find(
      item => String(item.id) === callButton.dataset.call
    );

    if (lead && digits(lead.phone).length >= 10) {
      window.location.href = `tel:${digits(lead.phone)}`;
    }
  }

  if (editButton) {
    const lead = leads.find(
      item => String(item.id) === editButton.dataset.edit
    );

    if (lead) openEditor(lead);
  }
});

$("exportBtn").addEventListener("click", () => {
  const rows = [
    ["Empresa", "Segmento", "Telefone", "Status", "Observações"],
    ...leads.map(lead => [
      lead.name,
      lead.segment,
      lead.phone,
      lead.status,
      lead.notes
    ])
  ];

  const csv = rows.map(row =>
    row.map(value =>
      `"${String(value ?? "").replace(/"/g, '""')}"`
    ).join(";")
  ).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "fluxia-leads.csv";
  link.click();

  URL.revokeObjectURL(url);
});

render();