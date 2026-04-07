# Conversion System — API & Architecture

## Overview

The Conversion System transforms **structured report JSON** into multiple export formats. It is designed as a modular service layer — each format has its own service file, keeping logic isolated and testable.

### Architecture

```
Structured Report JSON → Conversion Service → Output File
```

All conversions receive the **same input shape**:

```json
{
  "title": "Binary Search Implementation",
  "language": "javascript",
  "generatedAt": "2026-04-06T12:00:00.000Z",
  "aim": "...",
  "theory": "...",
  "procedure": ["Step 1", "Step 2", "..."],
  "code": "function binarySearch(...) { ... }",
  "result": "...",
  "conclusion": "..."
}
```

---

## Report Export Endpoints

These endpoints accept a **structured report JSON body** and return a downloadable file.

### POST `/api/convert/pdf`

Returns a PDF document.

- **Content-Type**: `application/pdf`
- **Library**: `pdf-lib`

### POST `/api/convert/docx`

Returns a DOCX (Word) document.

- **Content-Type**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Library**: `docx`

### POST `/api/convert/markdown`

Returns a Markdown text file.

- **Content-Type**: `text/markdown; charset=utf-8`
- **Library**: None (pure function)

### POST `/api/convert/latex`

Returns a LaTeX document.

- **Content-Type**: `application/x-latex; charset=utf-8`
- **Library**: None (pure function)

### POST `/api/convert/image`

Returns an SVG image summary card.

- **Content-Type**: `image/svg+xml`
- **Library**: None (pure function)

---

## General Format Converter

### POST `/api/convert/format`

Converts arbitrary text between supported formats using an intermediate representation.

**Request body:**

```json
{
  "content": "# Hello World\n\nSome text.",
  "from": "markdown",
  "to": "html"
}
```

**Supported formats:** `markdown`, `latex`, `html`, `txt`, `json`, `csv`

**Response:**

```json
{
  "success": true,
  "data": {
    "converted": "<!DOCTYPE html>...",
    "from": "markdown",
    "to": "html"
  }
}
```

---

## Service Files

| Service | Path | Dependencies |
|---------|------|-------------|
| PDF | `src/services/conversion/pdfService.js` | `pdf-lib` |
| DOCX | `src/services/conversion/docxService.js` | `docx` |
| Markdown | `src/services/conversion/markdownService.js` | None |
| LaTeX | `src/services/conversion/latexService.js` | None |
| Image/SVG | `src/services/conversion/imageService.js` | None |

---

## UI Integration

### Report Page Export

After generating a report, export buttons appear above the report sections:
- 📕 PDF, 📘 DOCX, 📝 Markdown, 📐 LaTeX, 🖼️ SVG Image

### Converter Page (`/converter`)

A dedicated two-column page for general format-to-format conversion:
- **Left panel**: Input text + source format selector
- **Right panel**: Output text + target format selector
- **Features**: Swap, Copy, Download

---

## Authentication

All conversion endpoints are protected by the `withAuth` middleware. A valid JWT cookie is required.
