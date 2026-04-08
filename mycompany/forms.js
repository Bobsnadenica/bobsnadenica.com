const projectForm = document.querySelector("[data-project-form]");

if (projectForm) {
  const pageLanguage = document.body.dataset.pageLanguage === "bg" ? "bg" : "en";
  const recipient = projectForm.dataset.recipient || "hello@mycompany.com";
  const mailPreview = document.querySelector("[data-mail-preview]");
  const summaryTargets = {
    type: document.querySelector("[data-summary='type']"),
    services: document.querySelector("[data-summary='services']"),
    timeline: document.querySelector("[data-summary='timeline']"),
    budget: document.querySelector("[data-summary='budget']"),
    goals: document.querySelector("[data-summary='goals']"),
    contact: document.querySelector("[data-summary='contact']"),
  };
  const strings = {
    en: {
      pending: "To be confirmed",
      none: "No preference yet",
      subjectPrefix: "New project inquiry",
      labelType: "Project type",
      labelServices: "Services",
      labelTimeline: "Timeline",
      labelBudget: "Budget",
      labelGoals: "Goals",
      labelName: "Name",
      labelCompany: "Company",
      labelEmail: "Email",
      labelWebsite: "Current website",
      labelAudience: "Audience",
      labelNotes: "Notes",
      previewPrefix: "Email preview",
    },
    bg: {
      pending: "Ще уточним",
      none: "Все още без предпочитание",
      subjectPrefix: "Ново запитване за проект",
      labelType: "Тип проект",
      labelServices: "Услуги",
      labelTimeline: "Срок",
      labelBudget: "Бюджет",
      labelGoals: "Цели",
      labelName: "Име",
      labelCompany: "Компания",
      labelEmail: "Имейл",
      labelWebsite: "Текущ сайт",
      labelAudience: "Аудитория",
      labelNotes: "Бележки",
      previewPrefix: "Преглед на имейла",
    },
  }[pageLanguage];

  const getCheckedLabel = (selector) => {
    const checked = projectForm.querySelector(selector);
    return checked ? checked.dataset.label || checked.value : "";
  };

  const getCheckedLabels = (selector) =>
    Array.from(projectForm.querySelectorAll(selector)).map((input) => input.dataset.label || input.value);

  const getFieldValue = (name) => {
    const field = projectForm.elements.namedItem(name);
    return typeof field?.value === "string" ? field.value.trim() : "";
  };

  const buildState = () => {
    const type = getCheckedLabel("input[name='project_type']:checked");
    const services = getCheckedLabels("input[name='services']:checked");
    const timeline = getFieldValue("timeline");
    const budget = getFieldValue("budget");
    const goals = getFieldValue("goals");
    const name = getFieldValue("name");
    const company = getFieldValue("company");
    const email = getFieldValue("email");
    const website = getFieldValue("website");
    const audience = getFieldValue("audience");
    const notes = getFieldValue("notes");

    return {
      type,
      services,
      timeline,
      budget,
      goals,
      name,
      company,
      email,
      website,
      audience,
      notes,
    };
  };

  const updateSummary = () => {
    const state = buildState();
    const contactLine = [state.name, state.company].filter(Boolean).join(" • ") || strings.pending;
    const previewLines = [
      `${strings.labelType}: ${state.type || strings.pending}`,
      `${strings.labelServices}: ${state.services.join(", ") || strings.none}`,
      `${strings.labelTimeline}: ${state.timeline || strings.pending}`,
      `${strings.labelBudget}: ${state.budget || strings.pending}`,
    ];

    if (summaryTargets.type) {
      summaryTargets.type.textContent = state.type || strings.pending;
    }

    if (summaryTargets.services) {
      summaryTargets.services.textContent = state.services.join(", ") || strings.none;
    }

    if (summaryTargets.timeline) {
      summaryTargets.timeline.textContent = state.timeline || strings.pending;
    }

    if (summaryTargets.budget) {
      summaryTargets.budget.textContent = state.budget || strings.pending;
    }

    if (summaryTargets.goals) {
      summaryTargets.goals.textContent = state.goals || strings.pending;
    }

    if (summaryTargets.contact) {
      summaryTargets.contact.textContent = `${contactLine}${state.email ? ` • ${state.email}` : ""}`;
    }

    if (mailPreview) {
      mailPreview.setAttribute("data-preview", `${strings.previewPrefix}: ${previewLines.join(" / ")}`);
      mailPreview.href = buildMailto(state);
    }
  };

  const buildMailto = (state) => {
    const subjectBase = [strings.subjectPrefix, state.company || state.name || state.type || "MyCompany"].join(" - ");
    const bodyLines = [
      `${strings.labelType}: ${state.type || strings.pending}`,
      `${strings.labelServices}: ${state.services.join(", ") || strings.none}`,
      `${strings.labelTimeline}: ${state.timeline || strings.pending}`,
      `${strings.labelBudget}: ${state.budget || strings.pending}`,
      `${strings.labelName}: ${state.name || strings.pending}`,
      `${strings.labelCompany}: ${state.company || strings.pending}`,
      `${strings.labelEmail}: ${state.email || strings.pending}`,
      `${strings.labelWebsite}: ${state.website || strings.pending}`,
      `${strings.labelAudience}: ${state.audience || strings.pending}`,
      "",
      `${strings.labelGoals}:`,
      state.goals || strings.pending,
      "",
      `${strings.labelNotes}:`,
      state.notes || strings.none,
    ];

    return `mailto:${recipient}?subject=${encodeURIComponent(subjectBase)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
  };

  projectForm.addEventListener("input", updateSummary);
  projectForm.addEventListener("change", updateSummary);
  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!projectForm.reportValidity()) {
      return;
    }

    window.location.href = buildMailto(buildState());
  });

  updateSummary();
}
