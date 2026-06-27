import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";

const fileInput = document.getElementById("file-input");
const docEl = document.getElementById("document");
const printBtn = document.getElementById("print-btn");

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  docEl.innerHTML = '<p class="placeholder">Convertendo...</p>';
  try {
    const name = file.name.toLowerCase();
    let html;
    if (name.endsWith(".docx")) {
      html = await convertDocx(file);
    } else if (name.endsWith(".pdf")) {
      html = await convertPdf(file);
    } else {
      throw new Error("Formato não suportado. Use PDF ou DOCX.");
    }
    docEl.innerHTML = injectFillableFields(html);
    printBtn.disabled = false;
  } catch (err) {
    console.error(err);
    docEl.innerHTML = `<p class="placeholder">Erro: ${err.message}</p>`;
    printBtn.disabled = true;
  }
});

printBtn.addEventListener("click", () => window.print());

async function convertDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

async function convertPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines = groupTextIntoLines(content.items);
    const pageHtml = lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("\n");
    pages.push(pageHtml);
  }
  return pages.join('\n<div class="page-break"></div>\n');
}

function groupTextIntoLines(items) {
  const lines = [];
  let currentY = null;
  let currentLine = [];
  const tolerance = 2;

  for (const item of items) {
    if (!item.str) continue;
    const y = item.transform[5];
    if (currentY === null || Math.abs(y - currentY) < tolerance) {
      currentLine.push(item.str);
      currentY = y;
    } else {
      lines.push(currentLine.join(" ").trim());
      currentLine = [item.str];
      currentY = y;
    }
  }
  if (currentLine.length) lines.push(currentLine.join(" ").trim());
  return lines.filter((l) => l.length > 0);
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function injectFillableFields(html) {
  // {{nome}} -> input com placeholder "nome"
  html = html.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, name) => {
    const safeName = escapeHtml(name);
    return `<input type="text" class="fillable" data-field="${safeName}" placeholder="${safeName}" />`;
  });
  // 3+ underscores -> input em branco (largura proporcional ao número de _)
  html = html.replace(/_{3,}/g, (match) => {
    const width = Math.max(8, match.length);
    return `<input type="text" class="fillable" style="min-width:${width}ch" />`;
  });
  return html;
}
