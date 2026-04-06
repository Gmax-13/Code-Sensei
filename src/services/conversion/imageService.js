/**
 * Image Conversion Service
 * -------------------------
 * Generates an SVG representation of a structured report
 * suitable for rendering or downloading as an image.
 * No external dependencies — produces SVG as a string.
 */

/**
 * Escape XML special characters for safe SVG rendering.
 * @param {string} text
 * @returns {string}
 */
function escapeXml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Convert a structured report to an SVG image string.
 * Renders a clean summary card of the report sections.
 *
 * @param {Object} report - Structured report object
 * @returns {string} SVG document as a string
 */
export function convertToImage(report) {
    const title = escapeXml(report.title || "Untitled Report");
    const aim = escapeXml((report.aim || "").slice(0, 200));
    const theory = escapeXml((report.theory || "").slice(0, 200));
    const result = escapeXml((report.result || "").slice(0, 200));
    const conclusion = escapeXml((report.conclusion || "").slice(0, 200));
    const lang = escapeXml(report.language || "N/A");
    const dateStr = report.generatedAt
        ? new Date(report.generatedAt).toLocaleDateString()
        : new Date().toLocaleDateString();

    const WIDTH = 800;
    const sections = [
        { label: "Aim", value: aim },
        { label: "Theory", value: theory },
        { label: "Result", value: result },
        { label: "Conclusion", value: conclusion },
    ];

    let y = 100;
    let sectionsSvg = "";

    for (const sec of sections) {
        sectionsSvg += `
        <text x="40" y="${y}" font-size="14" font-weight="bold" fill="#2563EB" font-family="Segoe UI, sans-serif">${sec.label}</text>
        <text x="40" y="${y + 20}" font-size="12" fill="#374151" font-family="Segoe UI, sans-serif">${sec.value}</text>
        <line x1="40" y1="${y + 30}" x2="${WIDTH - 40}" y2="${y + 30}" stroke="#E5E7EB" stroke-width="1"/>`;
        y += 60;
    }

    const HEIGHT = y + 40;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" rx="16" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
  <rect width="${WIDTH}" height="60" rx="16" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="40" y="38" font-size="20" font-weight="bold" fill="#FFFFFF" font-family="Segoe UI, sans-serif">${title}</text>
  <text x="${WIDTH - 40}" y="38" font-size="11" fill="#DBEAFE" font-family="Segoe UI, sans-serif" text-anchor="end">${escapeXml(dateStr)} | ${lang}</text>
  ${sectionsSvg}
</svg>`;
}
