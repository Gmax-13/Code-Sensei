/**
 * PDF Conversion Service
 * -----------------------
 * Converts a structured report JSON into a downloadable PDF buffer.
 * Uses pdf-lib for zero-dependency, server-side PDF generation.
 * Supports dynamic sections[] format from AI-generated reports.
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Convert a structured report to a PDF buffer.
 * Supports both legacy format (aim, theory, etc.) and new sections[] format.
 *
 * @param {Object} report - Structured report object
 * @param {string} report.title
 * @param {string} report.language
 * @param {string} report.generatedAt
 * @param {Array<{header: string, content: string}>} report.sections
 * @returns {Promise<Uint8Array>} PDF file as bytes
 */
export async function convertToPdf(report) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = 842;
    const MARGIN = 50;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    const LINE_HEIGHT = 16;
    const HEADING_SIZE = 16;
    const BODY_SIZE = 11;

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    /** Helper: add a new page and reset cursor */
    function newPage() {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
    }

    /** Helper: check if we need a new page */
    function ensureSpace(needed = LINE_HEIGHT * 3) {
        if (y - needed < MARGIN) {
            newPage();
        }
    }

    /** Helper: draw a section heading */
    function drawHeading(text) {
        ensureSpace(LINE_HEIGHT * 4);
        y -= LINE_HEIGHT * 1.5;
        page.drawText(text, {
            x: MARGIN,
            y,
            size: HEADING_SIZE,
            font: boldFont,
            color: rgb(0.15, 0.35, 0.65),
        });
        y -= 4;
        // Underline
        page.drawLine({
            start: { x: MARGIN, y },
            end: { x: MARGIN + CONTENT_WIDTH, y },
            thickness: 1,
            color: rgb(0.8, 0.85, 0.9),
        });
        y -= LINE_HEIGHT;
    }

    /** Helper: draw wrapped body text */
    function drawBody(text, useFont = font, size = BODY_SIZE) {
        if (!text) return;
        const words = text.split(/\s+/);
        let line = "";
        for (const word of words) {
            const testLine = line ? `${line} ${word}` : word;
            const width = useFont.widthOfTextAtSize(testLine, size);
            if (width > CONTENT_WIDTH) {
                ensureSpace();
                page.drawText(line, { x: MARGIN, y, size, font: useFont, color: rgb(0.15, 0.15, 0.15) });
                y -= LINE_HEIGHT;
                line = word;
            } else {
                line = testLine;
            }
        }
        if (line) {
            ensureSpace();
            page.drawText(line, { x: MARGIN, y, size, font: useFont, color: rgb(0.15, 0.15, 0.15) });
            y -= LINE_HEIGHT;
        }
    }

    // ── Title ──
    const titleText = report.title || "Untitled Report";
    page.drawText(titleText, {
        x: MARGIN,
        y,
        size: 22,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
    });
    y -= LINE_HEIGHT * 2;

    // Date line
    const dateStr = report.generatedAt
        ? new Date(report.generatedAt).toLocaleDateString()
        : new Date().toLocaleDateString();
    page.drawText(`Generated: ${dateStr}  |  Language: ${report.language || "N/A"}`, {
        x: MARGIN,
        y,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
    });
    y -= LINE_HEIGHT * 2;

    // ── Dynamic Sections ──
    if (report.sections && Array.isArray(report.sections)) {
        for (const section of report.sections) {
            drawHeading(section.header);
            drawBody(section.content);
        }
    } else {
        // Legacy format fallback
        const legacySections = [
            { heading: "Aim", content: report.aim },
            { heading: "Theory", content: report.theory },
        ];

        for (const sec of legacySections) {
            drawHeading(sec.heading);
            drawBody(sec.content);
        }

        if (report.procedure && report.procedure.length > 0) {
            drawHeading("Procedure");
            report.procedure.forEach((step, i) => {
                drawBody(`${i + 1}. ${step}`);
            });
        }

        if (report.code) {
            drawHeading("Code");
            const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
            const codeLines = report.code.split("\n");
            for (const codeLine of codeLines) {
                ensureSpace();
                const safeText = codeLine.replace(/[^\x20-\x7E]/g, " ");
                page.drawText(safeText || " ", {
                    x: MARGIN,
                    y,
                    size: 9,
                    font: monoFont,
                    color: rgb(0.2, 0.2, 0.2),
                });
                y -= LINE_HEIGHT;
            }
        }

        drawHeading("Result");
        drawBody(report.result);
        drawHeading("Conclusion");
        drawBody(report.conclusion);
    }

    return await pdfDoc.save();
}
