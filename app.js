import { storage } from "./modules/storage.js";
import { client } from "./modules/client.js";
import { classification } from "./modules/classification.js";
import { diagnostics } from "./modules/diagnostics.js";
import { report } from "./modules/report.js";
import { planning } from "./modules/planning.js";

const modules = { storage, client, classification, diagnostics, report, planning };

function init() {
  const list = document.getElementById("module-status-list");
  if (!list) return;

  for (const [name, mod] of Object.entries(modules)) {
    const li = document.createElement("li");
    const ready = typeof mod?.init === "function" ? mod.init() : "loaded";
    li.textContent = `${name}: ${ready}`;
    list.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", init);
