import { classification } from "./modules/classification.js";
import { report } from "./modules/report.js";

const injuryPresentEl = () => document.getElementById("input-injury-present");
const injuryDetailEl  = () => document.getElementById("injury-detail-fields");

function toggleInjuryDetail() {
  const show = injuryPresentEl().value === "yes";
  injuryDetailEl().classList.toggle("hidden", !show);
}

function getInput() {
  const present = injuryPresentEl().value === "yes";
  const stage   = document.getElementById("input-injury-stage").value;
  const region  = document.getElementById("input-injury-region").value;
  const notes   = document.getElementById("input-injury-notes").value.trim();

  return {
    goals: document.getElementById("input-goals").value
      .split(",").map((s) => s.trim()).filter(Boolean),
    injury: {
      present,
      stage:  present ? stage  : null,
      region: present ? region : null,
      notes,
    },
    strength: document.getElementById("input-strength").value,
    vo2max: parseFloat(document.getElementById("input-vo2").value) || null,
    bodyComposition: {
      bodyFat: parseFloat(document.getElementById("input-bodyfat").value) || null,
    },
    movementLimitations: document.getElementById("input-limitations").value,
  };
}

function renderDiagnostics(input) {
  const el = document.getElementById("diagnostics-output");
  const { injury } = input;

  const injuryRows = injury.present
    ? [
        ["Injury Presence", "Yes"],
        ["Injury Stage",    injury.stage  || "—"],
        ["Injury Region",   injury.region || "—"],
        ["Injury Notes",    injury.notes  || "None"],
      ]
    : [
        ["Injury Presence", "None"],
        ["Injury Notes",    injury.notes  || "None"],
      ];

  const rows = [
    ["Goals", input.goals.join(", ") || "—"],
    ...injuryRows,
    ["Strength Level",       input.strength],
    ["VO2 Max",              input.vo2max != null ? input.vo2max : "Not provided"],
    ["Body Fat %",           input.bodyComposition.bodyFat != null ? input.bodyComposition.bodyFat + "%" : "Not provided"],
    ["Movement Limitations", input.movementLimitations],
  ];

  el.innerHTML = rows.map(([k, v]) => `
    <div class="result-item">
      <strong>${k}</strong><span>${v}</span>
    </div>`).join("");
}

function section(title, bodyHtml) {
  return `
    <div class="report-section">
      <h3 class="report-section-title">${title}</h3>
      <div class="report-section-body">${bodyHtml}</div>
    </div>`;
}

function badge(text, variant) {
  return `<span class="report-badge report-badge--${variant}">${text}</span>`;
}

function list(items) {
  return `<ul class="report-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

function renderReport(data) {
  const el = document.getElementById("report-output");

  const classificationHtml =
    badge(data.pathwayClassification, "pathway") +
    badge(data.currentPhase, "phase");

  const limitersHtml = list(data.limiters.detected) +
    (data.limiters.missing.length
      ? `<p class="report-missing">Missing data — not assessed: ${data.limiters.missing.join(", ")}.</p>`
      : "");

  const injuryHtml = data.injury.present
    ? [
        `<div class="result-item"><strong>Injury Presence</strong><span>Yes</span></div>`,
        `<div class="result-item"><strong>Stage</strong><span>${data.injury.stage || "—"}</span></div>`,
        `<div class="result-item"><strong>Region / Type</strong><span>${data.injury.region || "—"}</span></div>`,
        data.injury.notes
          ? `<div class="result-item"><strong>Notes</strong><span>${data.injury.notes}</span></div>`
          : "",
      ].join("")
    : `<div class="result-item"><strong>Injury Presence</strong><span>None</span></div>` +
      (data.injury.notes
        ? `<div class="result-item"><strong>Notes</strong><span>${data.injury.notes}</span></div>`
        : "");

  const constraintsSection = data.constraints
    ? section("Constraints &amp; Precautions", list(data.constraints))
    : "";

  el.innerHTML = [
    section("Pathway Classification", classificationHtml),
    section("Current Phase", `<p class="report-phase-name">${data.currentPhase}</p>`),
    section("Why This Classification Was Chosen", `<p>${data.why}</p>`),
    section("Injury Profile", injuryHtml),
    section("Primary Limiters", limitersHtml),
    constraintsSection,
    section("Immediate Priorities", list(data.priorities)),
    section("Programming Direction", `<p>${data.programmingDirection}</p>`),
    section("Monitoring KPIs", list(data.kpis)),
  ].join("");
}

function onClassify() {
  const input = getInput();
  renderDiagnostics(input);
  const classResult = classification.classify(input);
  const reportData  = report.build(input, classResult);
  renderReport(reportData);
}

injuryPresentEl().addEventListener("change", toggleInjuryDetail);
document.getElementById("btn-classify").addEventListener("click", onClassify);
