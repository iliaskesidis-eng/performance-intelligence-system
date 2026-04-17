import { classification } from "./modules/classification.js";

function getInput() {
  return {
    goals: document.getElementById("input-goals").value.split(",").map((s) => s.trim()).filter(Boolean),
    injuryStatus: document.getElementById("input-injury").value,
    strength: document.getElementById("input-strength").value,
    vo2max: parseFloat(document.getElementById("input-vo2").value) || null,
    bodyComposition: { bodyFat: parseFloat(document.getElementById("input-bodyfat").value) || null },
    movementLimitations: document.getElementById("input-limitations").value,
  };
}

function renderDiagnostics(input) {
  const el = document.getElementById("diagnostics-output");
  const rows = [
    ["Goals", input.goals.join(", ") || "—"],
    ["Injury Status", input.injuryStatus],
    ["Strength", input.strength],
    ["VO2 Max", input.vo2max ?? "—"],
    ["Body Fat %", input.bodyComposition.bodyFat ?? "—"],
    ["Movement Limitations", input.movementLimitations],
  ];
  el.innerHTML = rows.map(([k, v]) => `
    <div class="result-item">
      <strong>${k}</strong><span>${v}</span>
    </div>`).join("");
}

function renderReport(result) {
  const el = document.getElementById("report-output");
  el.innerHTML = `
    <div class="result-item highlight">
      <strong>Pathway</strong><span>${result.pathway}</span>
    </div>
    <div class="result-item highlight">
      <strong>Phase</strong><span>${result.phase}</span>
    </div>
    <p class="result-explanation">${result.explanation}</p>
  `;
}

function onClassify() {
  const input = getInput();
  renderDiagnostics(input);
  const result = classification.classify(input);
  renderReport(result);
}

document.getElementById("btn-classify").addEventListener("click", onClassify);
