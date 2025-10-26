// Core script execution engine with inline mock response support

function extractMockResponse(code) {
  const mockStart = code.indexOf("# ---MOCK_RESPONSE---");
  const mockEnd = code.indexOf("# ---END_MOCK---");
  if (mockStart !== -1 && mockEnd !== -1 && mockEnd > mockStart) {
    return code
      .slice(mockStart + "# ---MOCK_RESPONSE---".length, mockEnd)
      .split("\n")
      .map(l => l.replace(/^# ?/, "")) // remove leading #
      .join("\n")
      .trim() + "\n";
  }
  return null;
}

function appendOutput(text) {
  const out = document.getElementById("output");
  out.textContent += text;
  out.scrollTop = out.scrollHeight;
}

function clearOutput() {
  document.getElementById("output").textContent = "";
}

async function runScript() {
  const btn = document.getElementById("run-btn");
  btn.disabled = true;
  btn.textContent = "Running…";
  clearOutput(); // Clear previous output at the start
  try {
    const code = document.getElementById("script-view").textContent || ""; // ✅ fixed
    const lines = code.split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      appendOutput(`$ ${line}\n`);
      // Fake delay to simulate execution
      await new Promise(r => setTimeout(r, 50));
    }

    // Extract mock from full file if available
    let mock = null;
    if (window.currentScriptFile) {
      try {
        const res = await fetch("./scripts/" + window.currentScriptFile);
        const fullCode = await res.text();
        mock = extractMockResponse(fullCode);
      } catch {
        appendOutput("[!] Could not load full script file for mock output.\n");
      }
    }

    // Fallback to editor content
    if (!mock) {
      mock = extractMockResponse(code);
    }

    if (mock) {
      appendOutput(mock + "\n");
    } else {
      appendOutput("No mock response found in this script.\n");
    }
  } finally {
    btn.disabled = false;
    btn.textContent = "Run ▷";
  }
}