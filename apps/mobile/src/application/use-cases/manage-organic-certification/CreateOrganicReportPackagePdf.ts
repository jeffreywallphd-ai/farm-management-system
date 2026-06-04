import type { OrganicReportPackage } from "../../../domain/organic/OrganicReportPackage";

export interface OrganicReportPackagePdf {
  fileName: string;
  bytes: Uint8Array;
  mimeType: "application/pdf";
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const LEFT_MARGIN = 48;
const TOP_Y = 748;
const LINE_HEIGHT = 12;
const MAX_CHARS_PER_LINE = 92;
const MAX_LINES_PER_PAGE = 58;

export function createOrganicReportPackagePdf(reportPackage: OrganicReportPackage): OrganicReportPackagePdf {
  const pages = paginate(wrapText(reportPackage.packageText));
  const pdf = buildPdf(pages.length ? pages : [["Organic report package"]]);

  return {
    fileName: `${safeFileName(reportPackage.title)}-${reportPackage.generatedAt.slice(0, 10)}.pdf`,
    bytes: utf8Bytes(pdf),
    mimeType: "application/pdf",
  };
}

function wrapText(text: string): string[] {
  return text.split(/\r?\n/).flatMap((line) => {
    if (line.length <= MAX_CHARS_PER_LINE) {
      return [line];
    }

    const wrapped: string[] = [];
    let remaining = line;
    while (remaining.length > MAX_CHARS_PER_LINE) {
      const breakAt = Math.max(remaining.lastIndexOf(" ", MAX_CHARS_PER_LINE), 1);
      wrapped.push(remaining.slice(0, breakAt).trimEnd());
      remaining = remaining.slice(breakAt).trimStart();
    }
    wrapped.push(remaining);
    return wrapped;
  });
}

function paginate(lines: string[]): string[][] {
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += MAX_LINES_PER_PAGE) {
    pages.push(lines.slice(index, index + MAX_LINES_PER_PAGE));
  }
  return pages;
}

function buildPdf(pages: string[][]): string {
  const objects: string[] = [];
  const pageIds = pages.map((_, index) => 4 + index);
  const contentIds = pages.map((_, index) => 4 + pages.length + index);

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  for (const [index, page] of pages.entries()) {
    const pageId = pageIds[index];
    const contentId = contentIds[index];
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    const stream = renderPageStream(page);
    objects[contentId] = `<< /Length ${utf8Bytes(stream).length} >>\nstream\n${stream}\nendstream`;
  }

  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = utf8Bytes(body).length;
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = utf8Bytes(body).length;
  body += `xref\n0 ${objects.length}\n`;
  body += "0000000000 65535 f \n";
  for (let id = 1; id < objects.length; id += 1) {
    body += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return body;
}

function renderPageStream(lines: string[]): string {
  return [
    "BT",
    "/F1 10 Tf",
    `${LEFT_MARGIN} ${TOP_Y} Td`,
    `${LINE_HEIGHT} TL`,
    ...lines.map((line) => `(${escapePdfText(line)}) Tj T*`),
    "ET",
  ].join("\n");
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
}

function safeFileName(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized || "organic-report-package";
}

function utf8Bytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }
  return bytes;
}
