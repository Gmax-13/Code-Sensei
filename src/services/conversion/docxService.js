/**
 * DOCX Conversion Service
 * -------------------------
 * Converts a structured report JSON into a downloadable DOCX buffer.
 * Uses the `docx` library for rich Word document generation.
 * Supports dynamic sections[] format from AI-generated reports.
 */

import {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Packer,
    BorderStyle,
} from "docx";

/**
 * Convert a structured report to a DOCX buffer.
 *
 * @param {Object} report - Structured report object
 * @returns {Promise<Buffer>} DOCX file as a buffer
 */
export async function convertToDocx(report) {
    const titleText = report.title || "Untitled Report";
    const dateStr = report.generatedAt
        ? new Date(report.generatedAt).toLocaleDateString()
        : new Date().toLocaleDateString();

    /** Helper: create a section heading paragraph */
    function sectionHeading(text) {
        return new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 100 },
            children: [
                new TextRun({
                    text,
                    bold: true,
                    size: 28,
                    color: "2563EB",
                    font: "Calibri",
                }),
            ],
        });
    }

    /** Helper: create a body paragraph */
    function bodyParagraph(text) {
        return new Paragraph({
            spacing: { after: 100 },
            children: [
                new TextRun({
                    text: text || "",
                    size: 22,
                    font: "Calibri",
                }),
            ],
        });
    }

    const children = [];

    // Title
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
                new TextRun({
                    text: titleText,
                    bold: true,
                    size: 36,
                    font: "Calibri",
                }),
            ],
        })
    );

    // Metadata
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
                new TextRun({
                    text: `Generated: ${dateStr}  |  Language: ${report.language || "N/A"}`,
                    size: 18,
                    color: "888888",
                    font: "Calibri",
                }),
            ],
        })
    );

    // Separator
    children.push(
        new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" } },
            spacing: { after: 200 },
        })
    );

    // ── Dynamic Sections ──
    if (report.sections && Array.isArray(report.sections)) {
        for (const section of report.sections) {
            children.push(sectionHeading(section.header));
            // Split content by newlines for multi-paragraph support
            const paragraphs = (section.content || "").split("\n").filter(Boolean);
            for (const para of paragraphs) {
                children.push(bodyParagraph(para));
            }
        }
    } else {
        // Legacy format fallback
        children.push(sectionHeading("Aim"));
        children.push(bodyParagraph(report.aim));

        children.push(sectionHeading("Theory"));
        children.push(bodyParagraph(report.theory));

        if (report.procedure && report.procedure.length > 0) {
            children.push(sectionHeading("Procedure"));
            report.procedure.forEach((step, i) => {
                children.push(bodyParagraph(`${i + 1}. ${step}`));
            });
        }

        if (report.code) {
            children.push(sectionHeading("Code"));
            children.push(
                new Paragraph({
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: report.code,
                            font: "Consolas",
                            size: 18,
                        }),
                    ],
                })
            );
        }

        children.push(sectionHeading("Result"));
        children.push(bodyParagraph(report.result));

        children.push(sectionHeading("Conclusion"));
        children.push(bodyParagraph(report.conclusion));
    }

    const doc = new Document({
        sections: [{ children }],
    });

    return await Packer.toBuffer(doc);
}
