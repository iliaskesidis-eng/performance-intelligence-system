function isKneeChronicADL(input, classificationResult) {
  const inj = input.injury ?? {};
  const bf  = input.bodyComposition?.bodyFat ?? null;
  return (
    classificationResult.pathway === "General Population" &&
    classificationResult.phase   === "ADL"               &&
    inj.present  === true                                 &&
    (inj.stage  ?? "").toLowerCase() === "chronic"       &&
    (inj.region ?? "").toLowerCase().includes("knee")    &&
    input.strength === "low"                              &&
    ["mild", "moderate", "severe"].includes(input.movementLimitations) &&
    bf !== null && Number(bf) >= 30
  );
}

function buildKneeChronicADLPlan() {
  const immediatePriorities = [
    {
      rank: 1,
      priority: "Restore pain-tolerable quad activation to reverse arthrogenic inhibition",
      constraint: "Chronic knee pathology suppresses VMO/quad output independent of pain. At low strength with high body mass, the load-to-capacity ratio is already compromised — further atrophy accelerates joint degradation.",
      action: "Begin isometric quad sets supine (3 × 10 × 10-sec hold, daily). Progress to short-arc extensions 0–30° only when NRS ≤ 3/10 throughout. Do not advance to weight-bearing quad work until isometric output is consistent across 3 sessions.",
    },
    {
      rank: 2,
      priority: "Establish a hip-dominant loading pattern to reduce compressive knee load during all ADL tasks",
      constraint: "Elevated body fat (≥30%) increases patellofemoral joint reaction forces during stair descent, sit-to-stand, and floor-level transfers. Shifting force production to the hip reduces this compressive demand while maintaining functional capacity.",
      action: "Supine bridge and hip thrust (bilateral, bodyweight) 3 × 12 every session. Progress load only after 2 × 10 is achievable with no lateral pelvic drop and NRS 0/10. Treat hip loading as primary — not accessory.",
    },
    {
      rank: 3,
      priority: "Achieve pain-free sit-to-stand from a raised surface before progressing to standard chair height",
      constraint: "Sit-to-stand at standard height (45 cm) requires 90° knee flexion under load. At chronic knee, low strength, and high body mass, this exceeds current tissue tolerance and produces compensation. Starting elevated avoids provocation while building the pattern.",
      action: "Use a chair at 55–60 cm. Target 3 × 5 controlled stands with NRS ≤ 3/10 and no trunk pitch or arm push-off. Drop 5 cm height only when criteria are met for 2 consecutive sessions.",
    },
    {
      rank: 4,
      priority: "Begin low-impact cardiovascular accumulation to address body composition without spiking joint load",
      constraint: "Body fat ≥ 30% amplifies compressive and shear forces at the knee during impact activity. High-impact cardio is contraindicated at this stage. Cardiovascular work must be non-provocative but consistent — caloric deficit cannot be achieved through exercise intensity alone at this capacity level.",
      action: "Seated cycling (recumbent or upright, seat raised to limit knee flexion to pain-free arc) 15–20 min at RPE 10–12, 5×/week. Advance duration by 5 min every 2 weeks before increasing resistance. Monitor post-session NRS and swelling.",
    },
  ];

  const programmingDirection = [
    "Frequency: 3 structured sessions per week (Mon/Wed/Fri or equivalent), with low-impact conditioning 5×/week separate from strength sessions.",
    "Session structure: 10 min warm-up (seated bike + ankle circles + supine hip rotations) → 25 min targeted resistance work → 10 min cool-down (gentle ROM, breathing).",
    "Movement bias: hip-dominant patterns as primary lower body load; knee-dominant work limited to isometric and short-arc only until pain criteria are met.",
    "Load strategy: bodyweight only until 3 × 10 isometric quad activation and 2 × 10 elevated sit-to-stand are achieved with NRS 0/10. External load introduced at ≤10% bodyweight increments only when NRS and 24 h response criteria are satisfied.",
    "Impact restriction: zero impact loading (no jumping, running, stairs under load) until stair-descent NRS ≤ 2/10 for 3 consecutive days.",
    "ROM control: knee flexion under any load restricted to pain-free arc. Do not force range. Measure and record available ROM at session start. Progress depth only when the previous range is NRS 0/10 for 2 consecutive sessions.",
    "Loading sequence (enforce in order — do not skip tiers): (1) Isometric — quad sets, wall sit at pain-free angle. (2) Slow eccentric — 5-sec lowering on step-down, elevated box sit. (3) Controlled concentric/eccentric — full elevated sit-to-stand, hip hinge with light load. (4) Dynamic loading — standard sit-to-stand, step-up progressions. Advance only when NRS ≤ 3/10 during tier and baseline NRS within 24 h.",
    "Conditioning rule: sessions are not adjusted for missed conditioning days. Conditioning and resistance sessions are separated by ≥ 4 h. If joint swelling increases after conditioning, halt and reassess modality.",
  ].join(" | ");

  const exerciseSelectionFramework = [
    {
      category: "Analgesic / Tolerance Work",
      rationale: "Chronic knee pain with low strength requires an initial phase of isometric loading to reduce pain sensitisation, stimulate quad activation, and establish a pain-free loading floor before any dynamic exercise is introduced.",
      examples: [
        "Supine quad set (10-sec isometric contraction, 3 × 10 daily)",
        "Short-arc extension 0–30° seated (pain-free arc only)",
        "Wall sit at pain-tolerable angle (30–60 sec hold, 3 sets)",
        "Blood flow restriction quad set if available (low cuff pressure, NRS ≤ 3/10)",
      ],
      constraint: "NRS ≤ 3/10 throughout. No knee flexion beyond pain-free arc under any load. Supine or seated only at this stage. Do not progress until 3 consecutive sessions meet NRS ceiling.",
    },
    {
      category: "Hip-Dominant Lower Body",
      rationale: "With knee loading restricted and body mass elevating joint forces, hip extensor loading is the primary strategy for maintaining lower limb functional capacity. Glute and hamstring strength also reduces dynamic valgus under load, which is a key chronic knee irritant.",
      examples: [
        "Supine glute bridge — bilateral, bodyweight (3 × 12)",
        "Hip thrust off chair or bench — bodyweight (3 × 10)",
        "Sidelying hip abduction with band (3 × 15 each side)",
        "Standing hip hinge with dowel-to-wall cue — minimal knee bend (3 × 10)",
      ],
      constraint: "Knee remains near-extended in all hinge patterns. No loaded positions requiring > 45° knee flexion at this stage. Monitor for lumbar compensation during hip hinge — maintain neutral spine throughout.",
    },
    {
      category: "Supported Knee-Dominant Work",
      rationale: "Once isometric tolerance is established, knee-dominant loading must be reintroduced in a supported, range-controlled manner. This drives articular cartilage nutrition and quad hypertrophy without exceeding current compressive load tolerance.",
      examples: [
        "Elevated sit-to-stand from 55–60 cm surface (3 × 5, progress to lower surface)",
        "Leg press at 0–60° ROM with slow eccentric (5-sec lowering, 3 × 10)",
        "Step-down from 5 cm step — 5-sec eccentric, 3 × 8 each leg",
        "Wall slide squat to pain-free depth (3 × 10, progress depth weekly)",
      ],
      constraint: "Eccentric phase minimum 3–5 sec on all knee-dominant movements. ROM increased only when pain-free arc is maintained for 2 consecutive sessions. NRS ceiling 3/10 during; 0/10 at rest by next session. No standard sit-to-stand until elevated version is NRS 0/10 for 3 sessions.",
    },
    {
      category: "Trunk / Core",
      rationale: "Core stability reduces compensatory loading at the knee during functional tasks. At high body mass with low lower limb strength, trunk control is also required to maintain safe positioning during all loaded exercises.",
      examples: [
        "Dead bug — 3 × 8 each side (slow, controlled, lumbar flat)",
        "Supine hollow hold — 20-sec holds, 3 sets",
        "Seated Pallof press with band — 3 × 10 each side",
        "Sidelying plank from knees — 20-sec holds, 3 sets",
      ],
      constraint: "No standing rotational patterns until lower limb loading progresses beyond isometric tier. Prioritise anti-extension and anti-rotation. No loaded spinal flexion (crunches, sit-ups) at this stage.",
    },
    {
      category: "Low-Impact Conditioning",
      rationale: "Body fat ≥ 30% requires consistent caloric expenditure. All conditioning must avoid knee impact while maintaining adequate intensity to produce metabolic stress. Cardiovascular deconditioning also reduces work capacity and session recovery — it must be addressed in parallel with strength work.",
      examples: [
        "Recumbent or upright stationary cycling — seat raised, RPE 10–12, 15–20 min",
        "Seated upper body ergometer — 15–20 min if cycling provokes swelling",
        "Pool walking or aqua jogging — if accessible, unloads knee by 40–60%",
        "Slow-paced flat walking — after stair NRS criteria met, progress from 10 to 30 min",
      ],
      constraint: "Zero impact. Post-session swelling check mandatory. If knee circumference increases or swelling appears post-session, downgrade to seated upper body ergometer and reassess. Duration increases precede resistance or pace increases.",
    },
  ];

  const progressionCriteria = [
    "Pain during training: NRS ≤ 3/10 for all loaded exercises across 3 consecutive sessions at current tier before advancing to next loading tier.",
    "Next-day pain response: NRS returns to pre-session baseline within 24 h for 3 consecutive sessions. If NRS is elevated the following morning, hold at current tier.",
    "Stair tolerance: descends one flight of stairs (10–12 steps) with NRS ≤ 2/10 and no visible trunk lean or contralateral hip drop — required before progressing from isometric to slow-eccentric tier.",
    "Sit-to-stand from elevated surface (55–60 cm): 3 × 5 repetitions, NRS 0/10, no arm push-off, no lateral trunk shift — required before reducing surface height by 5 cm.",
    "Sit-to-stand from standard height (45 cm): 5 continuous repetitions with NRS ≤ 2/10 and no compensation — required before introducing step-up progressions.",
    "Movement quality gate: no observable dynamic knee valgus during any weight-bearing exercise. If valgus appears under load, reduce load until pattern is corrected before re-advancing.",
    "Conditioning tolerance: 20 consecutive minutes of cycling or equivalent at RPE 10–12 with no post-session swelling increase — required before increasing conditioning duration or intensity.",
  ];

  const regressionStopRules = [
    "Pain spike during session: if NRS exceeds 3/10 during any exercise, stop that exercise immediately. Do not substitute a harder variation. Return to the previous tier and reassess next session.",
    "Next-day flare: if NRS is > 1/10 above pre-session baseline the following morning, reduce load by 20–25% and hold at current tier for a minimum of one additional week before re-attempting progression.",
    "Swelling or warmth: any increase in knee circumference, visible swelling, or warmth post-session is a hard stop for that movement pattern. Cease loaded knee work for 48 h, apply compression and elevation, and reassess before resuming.",
    "Compensation under load: if lateral trunk shift, contralateral hip drop, or dynamic knee valgus appears during any exercise, reduce load or reduce ROM immediately. Do not continue loading a compensatory pattern.",
    "Tolerance regression: if a movement that was previously tolerated (NRS 0/10) now produces NRS > 2/10, regress to the tier below and do not attempt to push through. This signals tissue irritability above current load threshold.",
    "Conditioning-induced flare: if any conditioning modality produces next-day swelling or NRS increase, switch to the seated upper body ergometer and hold for 2 sessions before retrying. If flare persists, stop and refer for assessment.",
    "Missed progression window: if NRS criteria are not met after 4 consecutive weeks at the same tier, the programme requires reassessment — this is not a training problem that can be resolved by persistence alone.",
  ];

  const monitoringKpis = [
    "Pain at rest (NRS 0–10): recorded at the start of each session. Target: NRS 0/10 at rest before each session. Any resting pain ≥ 2/10 delays loading that session.",
    "Pain during movement (NRS 0–10): recorded immediately after each main exercise. Target ceiling NRS 3/10. Trend should decrease within each tier over 2–3 weeks.",
    "Next-day pain response (NRS 0–10): recorded each morning. Target: return to pre-session baseline within 24 h. Track weekly — any upward trend signals load reduction.",
    "Stair descent tolerance: number of steps descended with NRS ≤ 2/10, no trunk lean, and no handrail dependence. Measured weekly. Target: full flight (10–12 steps) before progressing to dynamic loading tier.",
    "Elevated sit-to-stand reps (55–60 cm surface): maximum repetitions with NRS ≤ 2/10 and no compensation. Measured every 2 weeks. Target: 3 × 5 before reducing surface height.",
    "Body weight / body fat trend: weighed weekly under consistent conditions (morning, fasted). Target: ≥ 0.25 kg/week average loss over a 4-week rolling window. Body fat via DEXA or skinfold reassessed monthly.",
    "Post-session swelling check: qualitative assessment (none / mild / moderate) at session end and next morning. Any swelling classified as moderate is a hard stop trigger.",
  ];

  return {
    immediatePriorities,
    programmingDirection,
    exerciseSelectionFramework,
    progressionCriteria,
    regressionStopRules,
    monitoringKpis,
  };
}

function emptyPlan() {
  return {
    immediatePriorities:      [],
    programmingDirection:     "",
    exerciseSelectionFramework: [],
    progressionCriteria:      [],
    regressionStopRules:      [],
    monitoringKpis:           [],
  };
}

export const planning = {
  name: "planning",

  init() {
    return "ready";
  },

  plan(input) {
    return [];
  },

  buildPlan(input, classificationResult, reportData) {
    if (isKneeChronicADL(input, classificationResult)) {
      return buildKneeChronicADLPlan();
    }
    return emptyPlan();
  },
};
