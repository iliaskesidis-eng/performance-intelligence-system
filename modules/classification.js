const PATHWAYS = {
  GENERAL: "General Population",
  ATHLETE:  "Athlete",
};

const GENERAL_PHASES = {
  ADL:     "ADL",
  WORK:    "Work",
  LIGHT:   "Light Activity",
  FITNESS: "Fitness",
};

const ATHLETE_PHASES = {
  RTPA: "Return to Participation",
  RTS:  "Return to Sport",
  RTPE: "Return to Performance",
};

const SPORT_GOALS   = ["sport", "competition", "performance", "athlete", "return to sport"];
const WORK_GOALS    = ["work", "occupational", "job", "labor"];
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

function normalizeInjury(raw) {
  const present = raw?.present ?? false;
  return {
    present,
    stage:  present ? (raw?.stage  || "").toLowerCase() : "",
    region: present ? (raw?.region || "")               : "",
    notes:  raw?.notes || "",
  };
}

function classifyAthlete(injury, limits, strength, vo2) {
  const { present, stage, region } = injury;
  const regionLabel = region || "unspecified region";

  if (present) {
    if (stage === "acute" || stage === "subacute" || limits === "severe") {
      return {
        phase: ATHLETE_PHASES.RTPA,
        reason: `${stage} ${regionLabel} injury requires medical management and graded reintroduction to participation`,
      };
    }
    if (stage === "chronic" || limits === "moderate" || strength === "low") {
      return {
        phase: ATHLETE_PHASES.RTS,
        reason: `${stage} ${regionLabel} injury limits full sport-specific loading — progressing under clinical oversight`,
      };
    }
    if (stage === "cleared") {
      if (strength === "high" && (vo2 === "high" || vo2 === "moderate")) {
        return {
          phase: ATHLETE_PHASES.RTPE,
          reason: `cleared from ${regionLabel} injury with high physical capacity — targeting return to peak performance`,
        };
      }
      return {
        phase: ATHLETE_PHASES.RTS,
        reason: `cleared from ${regionLabel} injury — rebuilding load tolerance and sport-specific capacity`,
      };
    }
  }

  if (limits === "severe") {
    return {
      phase: ATHLETE_PHASES.RTPA,
      reason: "severe movement limitations require reintroduction to participation before sport-specific loading",
    };
  }
  if (limits === "moderate" || strength === "low") {
    return {
      phase: ATHLETE_PHASES.RTS,
      reason: "moderate limitations or low strength — building toward full sport-specific training demands",
    };
  }
  if (strength === "high" && (vo2 === "high" || vo2 === "moderate")) {
    return {
      phase: ATHLETE_PHASES.RTPE,
      reason: "high strength and aerobic capacity with no active injury — targeting peak performance",
    };
  }
  return {
    phase: ATHLETE_PHASES.RTS,
    reason: "building toward sport-specific performance benchmarks",
  };
}

function classifyGeneral(injury, goals, limits, strength, vo2, body) {
  const { present, stage, region } = injury;
  const regionLabel = region || "unspecified region";

  if (present) {
    if (stage === "acute") {
      return {
        phase: GENERAL_PHASES.ADL,
        reason: `acute ${regionLabel} injury — restoring basic function and pain-free movement is the immediate priority`,
      };
    }
    if (stage === "subacute") {
      if (limits === "severe" || strength === "low") {
        return {
          phase: GENERAL_PHASES.ADL,
          reason: `subacute ${regionLabel} injury with low physical capacity — daily function is the focus`,
        };
      }
      return {
        phase: GENERAL_PHASES.LIGHT,
        reason: `subacute ${regionLabel} injury constrains intensity — light progressive activity is appropriate`,
      };
    }
    if (stage === "chronic") {
      if (limits === "severe" || strength === "low") {
        return {
          phase: GENERAL_PHASES.ADL,
          reason: `chronic ${regionLabel} injury with low capacity — daily function and pain management take priority`,
        };
      }
      if (matchesAny(goals, WORK_GOALS)) {
        return {
          phase: GENERAL_PHASES.WORK,
          reason: `chronic ${regionLabel} injury with occupational demands — work-capacity focus with load management`,
        };
      }
      return {
        phase: GENERAL_PHASES.LIGHT,
        reason: `chronic ${regionLabel} injury constrains training intensity — building from a light activity base`,
      };
    }
  }

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
      reason: "high strength and aerobic capacity support a fitness optimisation phase",
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
    const goals    = normalizeList(input.goals);
    const injury   = normalizeInjury(input.injury);
    const strength = strengthLevel(input.strength);
    const vo2      = vo2Level(input.vo2max);
    const body     = bodyCompLevel(input.bodyComposition);
    const limits   = limitationLevel(input.movementLimitations);

    const isAthlete = matchesAny(goals, SPORT_GOALS);
    const pathway   = isAthlete ? PATHWAYS.ATHLETE : PATHWAYS.GENERAL;

    const result = isAthlete
      ? classifyAthlete(injury, limits, strength, vo2)
      : classifyGeneral(injury, goals, limits, strength, vo2, body);

    const injuryStr = injury.present
      ? `yes (stage=${injury.stage || "?"}, region=${injury.region || "?"})`
      : `no${injury.notes ? " (notes present)" : ""}`;

    const explanation = [
      `Pathway: ${pathway} (goals=${goals.join("|") || "none"}).`,
      `Phase: ${result.phase} — ${result.reason}.`,
      `Signals: injury=${injuryStr}, strength=${strength}, vo2=${vo2}, bodyComp=${body}, limitations=${limits}.`,
    ].join(" ");

    return { pathway, phase: result.phase, explanation };
  },
};
