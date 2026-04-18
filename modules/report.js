import { planning } from "./planning.js";

const PHASE_DATA = {
  "ADL": {
    priorities: [
      "Restore pain-free range of motion in functional movement patterns",
      "Re-establish strength sufficient for daily tasks (sit-to-stand, carrying, stairs)",
      "Improve cardiovascular tolerance for low-intensity sustained activity",
      "Reduce movement avoidance and rebuild functional confidence",
    ],
    programming:
      "Low-intensity therapeutic movement 3–5x per week. Prioritise mobility, neuromuscular re-education, and gait mechanics. Avoid loaded exercise until pain-free ROM is confirmed. Progression is gated by function, not schedule.",
    kpis: [
      "Pain score at rest and with movement (NRS 0–10)",
      "30-second sit-to-stand repetitions",
      "Self-reported ADL task capacity",
      "Sleep quality and daily fatigue rating",
    ],
  },

  "Work": {
    priorities: [
      "Build postural endurance for sustained occupational demands",
      "Develop job-specific strength and movement patterns",
      "Improve cardiovascular capacity to support full shift output",
      "Reduce re-injury risk with progressive corrective loading",
    ],
    programming:
      "2–4x per week functional training. Prioritise posterior chain, anti-rotation, and loaded carry patterns. Include cardiovascular base work. Schedule sessions around shift times to manage cumulative fatigue.",
    kpis: [
      "Task-specific capacity (lifting, carrying, prolonged standing)",
      "End-of-shift fatigue and pain rating",
      "Grip strength and functional upper-body tests",
      "Lost or modified workdays per month",
    ],
  },

  "Light Activity": {
    priorities: [
      "Establish a consistent training habit with a manageable entry load",
      "Build an aerobic base to support sustainable progression",
      "Develop foundational competency across major movement patterns",
      "Address identified limitations before increasing intensity",
    ],
    programming:
      "2–3x per week structured sessions. Compound movements at moderate intensity. Supplement with walking or low-impact cardio 3–5x per week. Increase volume before intensity. Reassess every 6 weeks.",
    kpis: [
      "Session attendance and week-on-week consistency",
      "Perceived exertion across standard tasks (RPE 6–20)",
      "Foundational strength benchmarks (squat, hinge, push, pull)",
      "Resting heart rate trend over 4–8 weeks",
    ],
  },

  "Fitness": {
    priorities: [
      "Apply structured progressive overload across strength and conditioning",
      "Optimise body composition through load management and recovery",
      "Improve VO2 max with progressive aerobic training blocks",
      "Establish periodisation with clear, measurable performance targets",
    ],
    programming:
      "3–5x per week structured program. Combine strength sessions (2–4x) with aerobic development (2–3x). Track and manage cumulative load. Deload every 4–6 weeks. Reassess performance profile quarterly.",
    kpis: [
      "Strength benchmarks (1RM or 5RM across key compound lifts)",
      "VO2 max or aerobic threshold (Cooper test or field test)",
      "Body composition: % body fat and lean mass",
      "Heart rate variability (HRV) as a recovery indicator",
    ],
  },

  "Return to Participation": {
    priorities: [
      "Achieve pain-free ROM across all sport-relevant joints",
      "Re-establish movement quality before any sport-specific loading",
      "Restore neuromuscular control and basic limb symmetry",
      "Obtain medical clearance to begin a structured return protocol",
    ],
    programming:
      "Supervised rehabilitation protocol. No sport-specific loading until pain-free movement is confirmed. Run general conditioning in parallel to maintain fitness base. All progressions are gated by clinical criteria, not time elapsed.",
    kpis: [
      "Pain score with movement and loading (NRS 0–10)",
      "Limb symmetry index (LSI) for strength and power",
      "Range of motion — affected vs. unaffected side",
      "Psychological readiness rating (ACL-RSI or equivalent)",
    ],
  },

  "Return to Sport": {
    priorities: [
      "Re-introduce sport-specific movement at sub-maximal intensity",
      "Rebuild load tolerance to match training volumes of team or event demands",
      "Restore confidence in movement and decision-making under fatigue",
      "Close strength and power asymmetries to within 10% LSI",
    ],
    programming:
      "Graduated return protocol: isolated skill work → group non-contact → full contact → competition. Dual-focus on physical restoration and sport-specific conditioning. Cap load increases at 10% per week. Retest symmetry before each stage.",
    kpis: [
      "Sport-specific performance tests (speed, agility, reactive power)",
      "Limb symmetry index (target ≥90%)",
      "Athlete confidence questionnaire (ACL-RSI or sport equivalent)",
      "Reactive strength index (RSI) and jump-landing quality",
    ],
  },

  "Return to Performance": {
    priorities: [
      "Restore or exceed pre-injury performance benchmarks",
      "Peak strength, power, and aerobic capacity for competition demands",
      "Refine technical and tactical execution under competitive conditions",
      "Implement load monitoring to detect early overload or re-injury risk",
    ],
    programming:
      "Periodised competition preparation at full intensity. Incorporate taper cycles before key events. Use session-RPE load tracking and GPS where available. Full sport-specific training with no restrictions. Reassess performance profile each mesocycle.",
    kpis: [
      "Performance benchmarks vs. pre-injury baseline",
      "Training load: session RPE × duration (AU)",
      "Competition output metrics (event-specific)",
      "Injury surveillance: recurrence and new injury incidence",
    ],
  },
};

function vo2Cat(v) {
  if (v == null || Number.isNaN(Number(v))) return null;
  const n = Number(v);
  if (n < 30) return "low";
  if (n < 45) return "moderate";
  return "high";
}

function bfCat(v) {
  if (v == null || Number.isNaN(Number(v))) return null;
  const n = Number(v);
  if (n > 30) return "high";
  if (n > 20) return "moderate";
  return "low";
}

function resolveInjury(raw) {
  const present = raw?.present ?? false;
  return {
    present,
    stage:  present ? (raw?.stage  || "") : "",
    region: present ? (raw?.region || "") : "",
    notes:  raw?.notes || "",
  };
}

function detectLimiters(input) {
  const limiters = [];
  const missing  = [];
  const inj = resolveInjury(input.injury);

  if (inj.present) {
    const regionLabel = inj.region || "unspecified region";
    if (inj.stage === "acute")
      limiters.push(`Active acute injury — ${regionLabel}: tissue healing is the primary constraint on all loading`);
    else if (inj.stage === "subacute")
      limiters.push(`Subacute injury — ${regionLabel}: load tolerance is reduced and must be progressed under clinical guidance`);
    else if (inj.stage === "chronic")
      limiters.push(`Chronic injury — ${regionLabel}: recurrent capacity restriction requiring ongoing load management`);
    else if (inj.stage === "cleared")
      limiters.push(`Cleared injury — ${regionLabel}: monitor for recurrence, especially under high load or fatigue`);
  } else if (inj.notes) {
    limiters.push(`Injury history noted: ${inj.notes} — monitor for recurrence and adjust loading accordingly`);
  }

  if (input.strength === "low")
    limiters.push("Strength deficit — below threshold for safe progressive loading across major patterns");

  const vo2 = vo2Cat(input.vo2max);
  if (vo2 === null) missing.push("VO2 max");
  else if (vo2 === "low")
    limiters.push(`Low aerobic capacity (VO2 max ~${input.vo2max}) — constrains work output, recovery rate, and session density`);

  const bf = bfCat(input.bodyComposition?.bodyFat);
  if (bf === null) missing.push("Body composition");
  else if (bf === "high")
    limiters.push(`Elevated body fat (${input.bodyComposition.bodyFat}%) — increases relative joint load and reduces power-to-weight ratio`);

  const lim = typeof input.movementLimitations === "string"
    ? input.movementLimitations
    : "none";
  if (lim === "severe")
    limiters.push("Severe movement limitations — structural or pain-driven restrictions affect exercise selection and safe loading");
  else if (lim === "moderate")
    limiters.push("Moderate movement limitations — constrain exercise variety and require programme modification");

  if (!input.goals || input.goals.length === 0) missing.push("Goals");

  return { limiters, missing };
}

function buildConstraints(input) {
  const inj = resolveInjury(input.injury);
  if (!inj.present) return null;

  const regionLabel = inj.region || "the injured region";
  const constraints = [];

  if (inj.stage === "acute") {
    constraints.push(`No loading through ${regionLabel} until the acute phase resolves and pain-free ROM is confirmed`);
    constraints.push("Avoid high-intensity and high-volume sessions — tissue healing takes priority over performance gains");
    constraints.push("All exercise selection must avoid provoking the injured site");
    constraints.push("Obtain or confirm medical clearance before commencing structured rehabilitation");
  } else if (inj.stage === "subacute") {
    constraints.push(`Progressive loading of ${regionLabel} only — no maximal effort or sport-specific demands yet`);
    constraints.push("Load increases capped at 10% per week; regression criteria must be defined before starting");
    constraints.push("Monitor pain response after each session — any increase above baseline NRS 2 is a regression signal");
  } else if (inj.stage === "chronic") {
    constraints.push(`${regionLabel} has ongoing capacity restrictions — load management is essential to prevent flare-up`);
    constraints.push("Avoid movements that historically aggravate the injury without graded desensitisation strategy in place");
    constraints.push("Track strength and movement asymmetries alongside pain and load tolerance metrics");
  } else if (inj.stage === "cleared") {
    constraints.push(`${regionLabel} is cleared — include injury-prevention work (prehab) as a standing programme component`);
    constraints.push("Monitor for recurrence signals, particularly under high load, fatigue, or rapid volume increases");
  }

  if (inj.notes) constraints.push(`Clinical note: ${inj.notes}`);

  return constraints.length ? constraints : null;
}

function buildWhy(input, result) {
  const goals  = input.goals?.length ? input.goals.join(", ") : "not specified";
  const inj    = resolveInjury(input.injury);
  const lim    = typeof input.movementLimitations === "string"
    ? input.movementLimitations
    : "not assessed";

  const injurySummary = inj.present
    ? `${inj.stage || "unspecified stage"} injury (${inj.region || "unspecified region"})`
    : inj.notes
    ? `no active injury (history noted)`
    : "no active injury";

  const pathwayRationale = result.pathway === "Athlete"
    ? `Goals indicate a sport or performance context (${goals}), placing this client on the Athlete pathway.`
    : `Goals and capacity indicators align with general health and function (${goals}), placing this client on the General Population pathway.`;

  const reasonMatch = result.explanation.match(/Phase:.*?— (.+?)\./);
  const phaseRationale = reasonMatch
    ? reasonMatch[1].charAt(0).toUpperCase() + reasonMatch[1].slice(1) + "."
    : `Phase assigned as "${result.phase}" based on current capacity and clinical profile.`;

  return (
    `${pathwayRationale} ` +
    `Phase assigned as "${result.phase}": ${phaseRationale} ` +
    `Determining signals: ${injurySummary}, strength = ${input.strength || "not assessed"}, movement limitations = ${lim}.`
  );
}

function renderPriorityItem(p) {
  return (
    `<strong>#${p.rank} — ${p.priority}</strong>` +
    `<span style="display:block;font-size:0.8rem;color:var(--muted);margin-top:0.35rem;line-height:1.5"><em>Why: </em>${p.constraint}</span>` +
    `<span style="display:block;font-size:0.82rem;color:var(--accent);margin-top:0.25rem;line-height:1.5"><em>Action: </em>${p.action}</span>`
  );
}

function renderExerciseCategory(cat) {
  const exList = cat.examples.map((e) => `<li>${e}</li>`).join("");
  return (
    `<div style="margin-bottom:0.85rem;padding:0.85rem;background:var(--surface-2);border:1px solid var(--border);border-radius:6px">` +
    `<strong style="display:block;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--accent);margin-bottom:0.4rem">${cat.category}</strong>` +
    `<p style="font-size:0.82rem;color:var(--muted);margin-bottom:0.5rem;line-height:1.5">${cat.rationale}</p>` +
    `<ul class="report-list" style="margin-bottom:0.5rem">${exList}</ul>` +
    `<p style="font-size:0.78rem;color:#c08a3a;background:#1f1608;border:1px solid #3a2a10;border-radius:4px;padding:0.4rem 0.65rem;margin-top:0.35rem">${cat.constraint}</p>` +
    `</div>`
  );
}

function assembleProgrammingBlock(plan) {
  const directives = plan.programmingDirection
    ? plan.programmingDirection.split(" | ").filter(Boolean)
    : [];

  const directivesHtml = directives.length
    ? `<ul class="report-list">${directives.map((d) => `<li>${d}</li>`).join("")}</ul>`
    : "";

  const frameworkHtml = plan.exerciseSelectionFramework.length
    ? `<h4 class="report-section-title" style="margin-top:1.25rem;margin-bottom:0.6rem">Exercise Selection Framework</h4>` +
      plan.exerciseSelectionFramework.map(renderExerciseCategory).join("")
    : "";

  const criteriaHtml = plan.progressionCriteria.length
    ? `<h4 class="report-section-title" style="margin-top:1.25rem;margin-bottom:0.5rem">Progression Criteria</h4>` +
      `<ul class="report-list">${plan.progressionCriteria.map((c) => `<li>${c}</li>`).join("")}</ul>`
    : "";

  const regressionHtml = plan.regressionStopRules.length
    ? `<h4 class="report-section-title" style="margin-top:1.25rem;margin-bottom:0.5rem">Regression / Stop Rules</h4>` +
      `<ul class="report-list">${plan.regressionStopRules.map((r) => `<li>${r}</li>`).join("")}</ul>`
    : "";

  return directivesHtml + frameworkHtml + criteriaHtml + regressionHtml;
}

export const report = {
  name: "report",
  init() {
    return "ready";
  },

  build(input, classificationResult) {
    const phase   = classificationResult.phase;
    const content = PHASE_DATA[phase];
    const { limiters, missing } = detectLimiters(input);
    const constraints = buildConstraints(input);

    const reportData = {
      pathwayClassification: classificationResult.pathway,
      currentPhase: phase,
      why: buildWhy(input, classificationResult),
      injury: resolveInjury(input.injury),
      limiters: {
        detected: limiters.length ? limiters : ["No major limiters identified from available data."],
        missing,
      },
      constraints,
      priorities: content.priorities,
      programmingDirection: content.programming,
      kpis: content.kpis,
    };

    const plan = planning.buildPlan(input, classificationResult, reportData);

    if (plan.immediatePriorities.length) {
      reportData.priorities = plan.immediatePriorities.map(renderPriorityItem);
      reportData.programmingDirection = assembleProgrammingBlock(plan);
      reportData.kpis = plan.monitoringKpis;
    }

    return reportData;
  },
};
