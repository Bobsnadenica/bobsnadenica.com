// Minimal UI for AWS Console Simulation – Only shows scripts and lets you run them

async function loadAvailableScripts() {
  const list = document.getElementById("script-list");
  list.innerHTML = "";
  let data = null;

  try {
    const resp = await fetch("./scripts/scripts_index.json");
    data = await resp.json();
  } catch {
    data = ["example.sh", "sample.json"];
  }

  // If object → categorized scripts
  const categories = typeof data === "object" && !Array.isArray(data) ? data : { "Scripts": data };

  for (const [category, files] of Object.entries(categories)) {
    const header = document.createElement("div");
    header.className = "section-title";
    header.textContent = category;
    list.appendChild(header);

    files.forEach(file => {
      const btn = document.createElement("button");
      btn.className = "nav-btn";
      btn.textContent = file.split("/").pop();
      btn.onclick = async () => {
        window.currentScriptFile = file; // track selected file
        try {
          const res = await fetch("./scripts/" + file);
          let content = await res.text();
          // Strip mock section for cleaner view
          const start = content.indexOf("# ---MOCK_RESPONSE---");
          const end = content.indexOf("# ---END_MOCK---");
          if (start !== -1 && end !== -1 && end > start) {
            content = content.slice(0, start).trim();
          }
          document.getElementById("script-view").textContent = content || "(empty)";
        } catch {
          alert("Failed to load " + file);
        }
      };
      list.appendChild(btn);
    });
  }
}

// Local mode fallback message
const localMode = location.protocol === "file:";
if (localMode) {
  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("script-view").textContent =
      "# Local mode active\n# Run a local server for full script access:\n#   python3 -m http.server 8080\n# Then open http://localhost:8080/aws/\n";
    document.getElementById("script-list").innerHTML =
      "<p style='color:var(--muted);margin:8px;'>Local mode — directory listing disabled.</p>";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!localMode) loadAvailableScripts();
});