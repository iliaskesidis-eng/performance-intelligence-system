const PATHWAYS = {
  GENERAL: "General Population",
  ATHLETE: "Athlete",
};

const GENERAL_PHASES = {
  ADL: "ADL",
  WORK: "Work",
  LIGHT: "Light Activity",
  FITNESS: "Fitness",
};

const ATHLETE_PHASES = {
  RTPA: "Return to Participation",
  RTS: "Return to Sport",
  RTPE: "Return to Performance",
};

const SPORT_GOALS = ["sport", "competition", "performance", "athlete", "return to sport"];
const WORK_GOALS = ["work", "occupational", "job", "labor"];
const ADL_GOALS = ["adl", "daily living", "independence", "mobility"];
const FITNESS_GOALS = ["fitness", "strength", "conditioning", "health"];

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).toLowerCase().trim());
  return [String(value).toLowerCase().trim()];
}

function matchesAny(list, keywords) {
  return list.some((item) => keywords.some((k) => item.includes(k)));
}

function strengthLevel(strength) {
  if (strength == null) return "unknown";
  if (typeof strength === "string") return strength.toLowerCase();
  if (typeof strength === "number") {
    if (strength < 40) return "low";
    if (strength < 70) return "moderate";
    return "high";
  }
  if (typeof strength === "object" && strength.level) {
    return String(strength.level).toLowerCase();
  }
  return "unknown";
}

function vo2Level(vo2) {
  if (vo2 == null) return "unknown";
  const n = Number(vo2);
  if (Number.isNaN(n)) return "unknown";
  if (n < 30) return "low";
  if (n < 45) return "moderate";
  return "high";
}

function bodyCompLevel(body) {
  if (body == null) return "unknown";
  if (typeof body === "string") return body.toLowerCase();
  if (typeof body === "object" && body.bodyFat != null) {
    const bf = Number(body.bodyFat);
    if (bf > 30) return "high";
    if (bf > 20) return "moderate";
    return "low";
  }
  return "unknown";
}

function limitationLevel(limitations) {
  if (!limitations) return "none";
  if (typeof limitations === "string") return limitations.toLowerCase();
  if (Array.isArray(limitations)) {
    if (limitations.length === 0) return "none";
    if (limitations.length >= 3) return "severe";
    if (limitations.length === 2) return "moderate";
    return "mild";
  }
  return "none";
}

function classifyAthlete(injury, limits, strength, vo2) {
  if (injury === "acute" || injury === "subacute" || limits === "severe") {
    return {
      phase: ATHLETE_PHASES.RTPA,
      reason: "active injury or severe movement limitations require reintroduction to participation",
    };
  }
  if (injury === "chronic" || injury === "rehab" || limits === "moderate" || strength === "low") {
    return {
      phase: ATHLETE_PHASES.RTS,
      reason: "cleared for sport-specific progression but not yet optimized for competition",
    };
  }
  if (strength === "high" && (vo2 === "high" || vo2 === "moderate")) {
    return {
      phase: ATHLETE_PHASES.RTPE,
      reason: "fully cleared with high strength and aerobic capacity, targeting peak performance",
    };
  }
  return {
    phase: ATHLETE_PHASES.RTS,
    reason: "cleared athlete building toward performance benchmarks",
  };
}

function classifyGeneral(goals, limits, strength, vo2, body) {
  if (limits === "severe" || strength === "low") {
    return {
      phase: GENERAL_PHASES.ADL,
      reason: "low strength or severe limitations indicate focus on activities of daily living",
    };
  }
  if (matchesAny(goals, WORK_GOALS) || limits === "moderate") {
    return {
      phase: GENERAL_PHASES.WORK,
      reason: "occupational demands or moderate limitations indicate work-capacity focus",
    };
  }
  if (strength === "high" && vo2 === "high") {
    return {
      phase: GENERAL_PHASES.FITNESS,
      reason: "high strength and aerobic capacity support a fitness optimization phase",
    };
  }
  if (matchesAny(goals, FITNESS_GOALS) && strength !== "low") {
    return {
      phase: GENERAL_PHASES.FITNESS,
      reason: "fitness-oriented goals with adequate baseline capacity",
    };
  }
  return {
    phase: GENERAL_PHASES.LIGHT,
    reason: "moderate baseline supports light activity progression",
  };
}

export const classification = {
  name: "classification",
  pathways: PATHWAYS,
  phases: { ...GENERAL_PHASES, ...ATHLETE_PHASES },

  init() {
    return "ready";
  },

  classify(input = {}) {
    const goals = normalizeList(input.goals);
    const injury = (input.injuryStatus || "none").toString().toLowerCase();
    const strength = strengthLevel(input.strength);
    const vo2 = vo2Level(input.vo2max);
    const body = bodyCompLevel(input.bodyComposition);
    const limits = limitationLevel(input.movementLimitations);

    const isAthlete = matchesAny(goals, SPORT_GOALS);
    const pathway = isAthlete ? PATHWAYS.ATHLETE : PATHWAYS.GENERAL;

    const result = isAthlete
      ? classifyAthlete(injury, limits, strength, vo2)
      : classifyGeneral(goals, limits, strength, vo2, body);

    const explanation = [
      `Pathway: ${pathway} (goals=${goals.join("|") || "none"}).`,
      `Phase: ${result.phase} — ${result.reason}.`,
      `Signals: injury=${injury}, strength=${strength}, vo2=${vo2}, bodyComp=${body}, limitations=${limits}.`,
    ].join(" ");

    return {
      pathway,
      phase: result.phase,
      explanation,
    };
  },
};
