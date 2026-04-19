/**
 * Architecture Diagram Generator Service
 * ----------------------------------------
 * Parses code to extract structure (functions, classes, interfaces, imports)
 * and generates Mermaid.js diagram syntax for visualization.
 * Supports JavaScript, TypeScript, Python, and Java.
 *
 * FIXES from v1:
 *  1. Duplicate class declarations in classDiagram (critical Mermaid parse error)
 *  2. Method extraction was entirely missing for JS/TS/Python/Java branches
 *  3. Arrow function regex broke on TypeScript type annotations
 *  4. Flowchart used meaningless sequential F0→F1→F2 connections
 *  5. Import regex missed: `import * as X`, CommonJS require(), Python imports, Java imports, side-effect imports
 *  6. No TypeScript interface extraction or `implements` relationship rendering
 *  7. No deduplication of extracted elements (duplicate classes/functions possible)
 *  8. Mermaid-breaking special characters (<, >, {, }, ") not sanitized in labels/IDs
 *  9. console.log debug statement left in production code
 * 10. Imports from the same source not grouped (bloated dependency graph)
 * 11. No named import limit — large codebases produce unreadable graphs
 * 12. Generator functions (function* name) not recognised
 * 13. Python class body extraction used brace-counting (wrong for indented syntax)
 * 14. `elements.interfaces` field missing from metadata return value
 * 15. `extractElements` `variables` field declared but never used/populated
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Remove characters that break Mermaid label syntax.
 * @param {string} str
 * @returns {string}
 */
function sanitizeLabel(str) {
    if (!str) return "";
    return str
        .replace(/[<>{}|"\\]/g, "")  // Mermaid special chars
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Produce a safe Mermaid node ID from an arbitrary string.
 * IDs must start with a letter and contain only [a-zA-Z0-9_].
 * @param {string} str
 * @returns {string}
 */
function sanitizeId(str) {
    if (!str) return "_unknown";
    const cleaned = str.replace(/[^a-zA-Z0-9_]/g, "_");
    // Ensure it starts with a letter
    return /^[a-zA-Z]/.test(cleaned) ? cleaned : `n_${cleaned}`;
}

// ─── Block Extraction ─────────────────────────────────────────────────────────

/**
 * Extract a brace-delimited block from code starting AFTER the opening brace.
 * Correctly handles nested braces, strings, and single-line comments.
 *
 * @param {string} code - Full source code
 * @param {number} start - Index right after the opening `{`
 * @returns {string} Block content (without surrounding braces)
 */
function extractBlock(code, start) {
    let depth = 1;
    let i = start;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplateLiteral = false;
    let inLineComment = false;
    let inBlockComment = false;

    while (i < code.length && depth > 0) {
        const ch = code[i];
        const next = code[i + 1];

        // Handle line comment end
        if (inLineComment) {
            if (ch === "\n") inLineComment = false;
            i++; continue;
        }
        // Handle block comment end
        if (inBlockComment) {
            if (ch === "*" && next === "/") { inBlockComment = false; i++; }
            i++; continue;
        }
        // Enter comments
        if (!inSingleQuote && !inDoubleQuote && !inTemplateLiteral) {
            if (ch === "/" && next === "/") { inLineComment = true; i++; continue; }
            if (ch === "/" && next === "*") { inBlockComment = true; i++; continue; }
        }
        // String tracking
        if (ch === "'" && !inDoubleQuote && !inTemplateLiteral) { inSingleQuote = !inSingleQuote; }
        else if (ch === '"' && !inSingleQuote && !inTemplateLiteral) { inDoubleQuote = !inDoubleQuote; }
        else if (ch === "`" && !inSingleQuote && !inDoubleQuote) { inTemplateLiteral = !inTemplateLiteral; }

        if (!inSingleQuote && !inDoubleQuote && !inTemplateLiteral) {
            if (ch === "{") depth++;
            if (ch === "}") depth--;
        }
        i++;
    }
    return code.slice(start, i - 1);
}

// ─── Method Extractors ────────────────────────────────────────────────────────

const RESERVED_WORDS = new Set([
    "if", "else", "while", "for", "switch", "catch", "try", "finally",
    "do", "return", "new", "delete", "typeof", "void", "throw", "case",
    "break", "continue", "default", "import", "export", "from", "class",
    "function", "const", "let", "var", "async", "await", "yield",
]);

/**
 * Extract methods from a JS/TS class body string.
 * Handles: async, static, public/private/protected, get/set, override,
 * TypeScript access modifiers and return-type annotations.
 *
 * @param {string} classBody
 * @returns {Array<{name:string, params:string[], visibility:string}>}
 */
function extractJSMethods(classBody) {
    const methods = [];
    const seen = new Set();

    // Match method declarations inside a class body.
    // Pattern: optional modifiers → method name → ( params ) → optional TS return type → {
    const methodRegex =
        /(?:(?:public|private|protected|static|async|get|set|override|abstract|readonly)\s+)*(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)\s*(?::\s*[\w<>\[\]|&,\s.?]+?)?\s*(?:\{|=>)/g;

    let m;
    while ((m = methodRegex.exec(classBody)) !== null) {
        const name = m[1];
        if (name === "constructor" || seen.has(name) || RESERVED_WORDS.has(name)) continue;
        seen.add(name);

        const params = m[2]
            .split(",")
            .map(p => p.trim().split(":")[0].trim().split("=")[0].trim().replace(/^\.\.\./, ""))
            .filter(p => p && !RESERVED_WORDS.has(p));

        // Determine visibility prefix from text before the name
        const prefix = classBody.slice(Math.max(0, m.index - 30), m.index);
        const visibility = /private/.test(prefix) ? "-" : /protected/.test(prefix) ? "#" : "+";
        methods.push({ name, params, visibility });
    }
    return methods;
}

/**
 * Extract methods from a Python class body (indented block as a string).
 *
 * @param {string} classBody
 * @returns {Array<{name:string, params:string[], visibility:string}>}
 */
function extractPythonMethods(classBody) {
    const methods = [];
    const seen = new Set();
    const methodRegex = /def\s+(\w+)\s*\(([^)]*)\)/g;
    let m;
    while ((m = methodRegex.exec(classBody)) !== null) {
        const name = m[1];
        if (seen.has(name)) continue;
        seen.add(name);
        const params = m[2]
            .split(",")
            .map(p => p.trim().split(":")[0].trim().split("=")[0].trim().replace(/^\*+/, ""))
            .filter(p => p && p !== "self" && p !== "cls");
        const visibility = name.startsWith("__") ? "-" : name.startsWith("_") ? "#" : "+";
        methods.push({ name, params, visibility });
    }
    return methods;
}

/**
 * Extract methods from a Java class/interface body.
 * Handles access modifiers, return types, throws clauses, and annotations.
 *
 * @param {string} classBody
 * @returns {Array<{name:string, params:string[], visibility:string}>}
 */
function extractJavaMethods(classBody) {
    const methods = [];
    const seen = new Set();

    // Strip annotations so they don't confuse the regex
    const stripped = classBody.replace(/@\w+(?:\([^)]*\))?\s*/g, "");

    // Pattern: modifiers + return-type + method-name + ( params ) + optional throws + {
    const methodRegex =
        /(?:(public|private|protected)\s+)?(?:(?:static|final|abstract|synchronized|native)\s+)*(?:[\w<>\[\]]+\s+)+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*\{/g;

    let m;
    while ((m = methodRegex.exec(stripped)) !== null) {
        const name = m[2];
        if (seen.has(name) || RESERVED_WORDS.has(name)) continue;
        seen.add(name);

        const params = m[3]
            .split(",")
            .map(p => {
                const parts = p.trim().split(/\s+/);
                return (parts[parts.length - 1] || "").replace(/[^a-zA-Z0-9_]/g, "");
            })
            .filter(Boolean);

        const visibility = m[1] === "private" ? "-" : m[1] === "protected" ? "#" : "+";
        methods.push({ name, params, visibility });
    }
    return methods;
}

// ─── Python Indented Block Extraction ────────────────────────────────────────

/**
 * Extract the indented body of a Python class/function starting after its colon.
 * Uses indentation level rather than brace counting.
 *
 * @param {string} code  Full source code
 * @param {number} afterColon  Index right after the `:`
 * @returns {string}
 */
function extractPythonBlock(code, afterColon) {
    const lines = code.slice(afterColon).split("\n");
    const bodyLines = [];
    let baseIndent = null;

    for (const line of lines) {
        if (line.trim() === "" || line.trim().startsWith("#")) {
            bodyLines.push(line);
            continue;
        }
        const indent = line.match(/^(\s*)/)[1].length;
        if (baseIndent === null) {
            if (indent === 0) break; // nothing indented after colon
            baseIndent = indent;
        }
        if (indent < baseIndent) break;
        bodyLines.push(line);
    }
    return bodyLines.join("\n");
}

// ─── Main Extractor ───────────────────────────────────────────────────────────

/**
 * Extract structural elements (classes, interfaces, functions, imports, exports)
 * from source code.  Language-specific parsing with sensible fallbacks.
 *
 * @param {string} code
 * @param {string} language  "javascript" | "typescript" | "python" | "java"
 * @returns {Object}
 */
function extractElements(code, language) {
    const elements = {
        classes: [],
        interfaces: [],
        functions: [],
        imports: [],
        exports: [],
    };

    const classNames = new Set();
    const functionNames = new Set();
    let match;

    // ── CLASSES ──────────────────────────────────────────────────────────────

    if (language === "javascript" || language === "typescript") {

        // Class declarations and expressions (including abstract TS classes)
        const jsClassRegex =
            /(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s*<[^>]*>)?(?:\s+extends\s+([\w.]+)(?:<[^>]*>)?)?(?:\s+implements\s+([\w,\s<>]+?))?\s*\{/g;

        while ((match = jsClassRegex.exec(code)) !== null) {
            const name = match[1];
            if (classNames.has(name)) continue;
            classNames.add(name);

            const bodyStart = match.index + match[0].length;
            const body = extractBlock(code, bodyStart);
            const methods = extractJSMethods(body);

            const implementsList = match[3]
                ? match[3].split(",").map(s => sanitizeLabel(s.trim().split("<")[0])).filter(Boolean)
                : [];

            elements.classes.push({
                name,
                parent: match[2] ? match[2].split("<")[0] : null,
                implements: implementsList,
                methods,
            });
        }

        // TypeScript interfaces
        if (language === "typescript") {
            const ifaceRegex =
                /(?:export\s+)?interface\s+(\w+)(?:\s*<[^>]*>)?(?:\s+extends\s+([\w,\s<>]+?))?\s*\{/g;
            while ((match = ifaceRegex.exec(code)) !== null) {
                const bodyStart = match.index + match[0].length;
                const body = extractBlock(code, bodyStart);
                const methods = extractJSMethods(body);
                elements.interfaces.push({
                    name: match[1],
                    extends: match[2]
                        ? match[2].split(",").map(s => s.trim().split("<")[0])
                        : [],
                    methods,
                });
            }
        }

        // ── FUNCTIONS (JS/TS) ─────────────────────────────────────────────────

        // Named function declarations (including generators: function*)
        const funcRegex =
            /(?:export\s+)?(?:async\s+)?function\s*\*?\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)/g;
        while ((match = funcRegex.exec(code)) !== null) {
            const name = match[1];
            if (functionNames.has(name) || classNames.has(name)) continue;
            functionNames.add(name);
            const params = match[2]
                .split(",")
                .map(p => p.trim().split(":")[0].trim().split("=")[0].replace(/^\.\.\./, "").trim())
                .filter(p => p && !RESERVED_WORDS.has(p));
            elements.functions.push({ name, params });
        }

        // Arrow functions and function expressions
        // Handles TS type annotations:  const fn = (x: string): ReturnType => { ... }
        //                               const fn: (x: string) => void = (x) => { ... }
        const arrowRegex =
            /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?::[^=]+)?\s*=\s*(?:async\s+)?(?:\(([^)]*)\)|(\w+))\s*(?::\s*[\w<>\[\]|&.,\s?]+)?\s*=>/g;
        while ((match = arrowRegex.exec(code)) !== null) {
            const name = match[1];
            if (functionNames.has(name) || classNames.has(name)) continue;
            functionNames.add(name);
            const rawParams = match[2] !== undefined ? match[2] : (match[3] || "");
            const params = rawParams
                .split(",")
                .map(p => p.trim().split(":")[0].trim().split("=")[0].replace(/^\.\.\./, "").trim())
                .filter(p => p && !RESERVED_WORDS.has(p));
            elements.functions.push({ name, params });
        }

        // ── EXPORTS (JS/TS) ───────────────────────────────────────────────────

        const exportRegex =
            /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+(\w+)/g;
        while ((match = exportRegex.exec(code)) !== null) {
            elements.exports.push(match[1]);
        }
        // export { name1, name2 as alias }
        const namedExportRegex = /export\s+\{([^}]+)\}/g;
        while ((match = namedExportRegex.exec(code)) !== null) {
            const names = match[1]
                .split(",")
                .map(s => s.trim().split(/\s+as\s+/).pop().trim())
                .filter(Boolean);
            elements.exports.push(...names);
        }

        // ── IMPORTS (JS/TS) ───────────────────────────────────────────────────

        // ES module imports — covers all forms:
        //   import Foo from '...'
        //   import { a, b as B } from '...'
        //   import Foo, { a } from '...'
        //   import * as Foo from '...'
        const esImportRegex =
            /import\s+((?:\*\s+as\s+\w+|\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s+from\s+["']([^"']+)["']/g;
        while ((match = esImportRegex.exec(code)) !== null) {
            const defaultPart = match[1] ? match[1].trim() : null;
            const named = match[2]
                ? match[2].split(",").map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
                : [];
            elements.imports.push({ default: defaultPart, named, source: match[3] });
        }

        // Side-effect imports: import 'module'
        const sideEffectRegex = /import\s+["']([^"']+)["']/g;
        while ((match = sideEffectRegex.exec(code)) !== null) {
            elements.imports.push({ default: null, named: [], source: match[1] });
        }

        // CommonJS: const { a, b } = require('module')  /  const mod = require('module')
        const requireRegex =
            /(?:const|let|var)\s+(?:\{([^}]+)\}|(\w+))\s*=\s*require\s*\(\s*["']([^"']+)["']\s*\)/g;
        while ((match = requireRegex.exec(code)) !== null) {
            const named = match[1]
                ? match[1].split(",").map(s => s.trim()).filter(Boolean)
                : [];
            elements.imports.push({ default: match[2] || null, named, source: match[3] });
        }

    } else if (language === "python") {

        // ── CLASSES (Python) ──────────────────────────────────────────────────

        const pyClassRegex = /^class\s+(\w+)\s*(?:\(([^)]*)\))?\s*:/gm;
        while ((match = pyClassRegex.exec(code)) !== null) {
            const name = match[1];
            if (classNames.has(name)) continue;
            classNames.add(name);

            const body = extractPythonBlock(code, match.index + match[0].length);
            const methods = extractPythonMethods(body);

            const parents = match[2]
                ? match[2].split(",").map(s => s.trim().split("[")[0]).filter(s => s && s !== "object" && s !== "ABC")
                : [];
            elements.classes.push({
                name,
                parent: parents[0] || null,
                implements: parents.slice(1),
                methods,
            });
        }

        // ── FUNCTIONS (Python) ────────────────────────────────────────────────

        // Top-level only (no leading whitespace — not inside a class)
        const pyFuncRegex = /^(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)/gm;
        while ((match = pyFuncRegex.exec(code)) !== null) {
            const name = match[1];
            if (functionNames.has(name) || classNames.has(name)) continue;
            functionNames.add(name);
            const params = match[2]
                .split(",")
                .map(p => p.trim().split(":")[0].trim().split("=")[0].replace(/^\*+/, "").trim())
                .filter(p => p && p !== "self" && p !== "cls");
            elements.functions.push({ name, params });
        }

        // ── IMPORTS (Python) ──────────────────────────────────────────────────

        // import os / import os, sys
        const pyImportRegex = /^import\s+([\w.,\s]+)/gm;
        while ((match = pyImportRegex.exec(code)) !== null) {
            for (const mod of match[1].split(",")) {
                const name = mod.trim().split(/\s+as\s+/).pop().trim();
                const source = mod.trim().split(/\s+as\s+/)[0].trim();
                if (source) elements.imports.push({ default: name, named: [], source });
            }
        }

        // from os import path / from typing import List, Dict
        const pyFromRegex = /^from\s+([\w.]+)\s+import\s+\(?([^)\n\\]+)\)?/gm;
        while ((match = pyFromRegex.exec(code)) !== null) {
            const named = match[2]
                .split(",")
                .map(s => s.trim().split(/\s+as\s+/)[0].trim())
                .filter(Boolean);
            elements.imports.push({ default: null, named, source: match[1] });
        }

    } else if (language === "java") {

        // ── CLASSES (Java) ────────────────────────────────────────────────────

        const javaClassRegex =
            /(?:@\w+(?:\([^)]*\))?\s*)*(?:(?:public|private|protected|abstract|final|static)\s+)*class\s+(\w+)(?:\s*<[^>]*>)?(?:\s+extends\s+(\w+)(?:<[^>]*>)?)?(?:\s+implements\s+([\w,\s<>]+?))?\s*\{/g;

        while ((match = javaClassRegex.exec(code)) !== null) {
            const name = match[1];
            if (classNames.has(name)) continue;
            classNames.add(name);

            const bodyStart = match.index + match[0].length;
            const body = extractBlock(code, bodyStart);
            const methods = extractJavaMethods(body);

            const implementsList = match[3]
                ? match[3].split(",").map(s => s.trim().split("<")[0]).filter(Boolean)
                : [];

            elements.classes.push({
                name,
                parent: match[2] || null,
                implements: implementsList,
                methods,
            });
        }

        // Java interfaces
        const javaIfaceRegex =
            /(?:(?:public|private|protected)\s+)?interface\s+(\w+)(?:\s*<[^>]*>)?(?:\s+extends\s+([\w,\s<>]+?))?\s*\{/g;
        while ((match = javaIfaceRegex.exec(code)) !== null) {
            const bodyStart = match.index + match[0].length;
            const body = extractBlock(code, bodyStart);
            const methods = extractJavaMethods(body);
            elements.interfaces.push({
                name: match[1],
                extends: match[2]
                    ? match[2].split(",").map(s => s.trim().split("<")[0])
                    : [],
                methods,
            });
        }

        // ── IMPORTS (Java) ────────────────────────────────────────────────────

        // import java.util.List;  /  import static java.util.Collections.sort;
        const javaImportRegex = /^import\s+(?:static\s+)?([\w.]+)\s*;/gm;
        while ((match = javaImportRegex.exec(code)) !== null) {
            const parts = match[1].split(".");
            const name = parts[parts.length - 1];
            elements.imports.push({ default: name === "*" ? null : name, named: [], source: match[1] });
        }
    }

    // ── DEDUPLICATION ─────────────────────────────────────────────────────────

    // Deduplicate imports (same source + same named exports)
    const seenImports = new Set();
    elements.imports = elements.imports.filter(imp => {
        const key = `${imp.source}||${imp.default}||${(imp.named || []).sort().join(",")}`;
        if (seenImports.has(key)) return false;
        seenImports.add(key);
        return true;
    });

    // Deduplicate exports
    elements.exports = [...new Set(elements.exports)];

    return elements;
}

// ─── Diagram Generators ───────────────────────────────────────────────────────

/**
 * Generate a Mermaid class diagram from extracted elements.
 * Fixes:
 *   - No longer emits `class Foo` AND `class Foo { ... }` (caused parse errors)
 *   - Uses `<<interface>>` stereotype correctly
 *   - Renders `implements` relationships with dashed arrow  <|..
 *   - Sanitizes all labels and IDs
 *
 * @param {Object} elements
 * @returns {string}
 */
function generateClassDiagram(elements) {
    const lines = ["classDiagram"];
    const declaredClasses = new Set();

    /**
     * Emit a single class/interface block — deduplicated.
     */
    const emitClass = (name, methods = [], stereotype = null) => {
        const id = sanitizeId(name);
        if (declaredClasses.has(id)) return;
        declaredClasses.add(id);

        lines.push(`  class ${id} {`);
        if (stereotype) lines.push(`    <<${stereotype}>>`);

        const displayMethods = methods.slice(0, 20); // cap at 20 methods for readability
        displayMethods.forEach(m => {
            const vis = m.visibility || "+";
            const paramStr = (m.params || []).map(sanitizeLabel).join(", ");
            lines.push(`    ${vis}${sanitizeLabel(m.name)}(${paramStr})`);
        });
        if (methods.length > 20) {
            lines.push(`    ... ${methods.length - 20} more`);
        }
        lines.push("  }");
    };

    // Interfaces
    elements.interfaces.forEach(iface => {
        emitClass(iface.name, iface.methods, "interface");
        (iface.extends || []).forEach(parent => {
            lines.push(`  ${sanitizeId(parent)} <|-- ${sanitizeId(iface.name)}`);
        });
    });

    // Classes
    elements.classes.forEach(cls => {
        emitClass(cls.name, cls.methods);

        if (cls.parent) {
            // Ensure parent node exists so Mermaid can draw the arrow
            emitClass(cls.parent, []);
            lines.push(`  ${sanitizeId(cls.parent)} <|-- ${sanitizeId(cls.name)}`);
        }

        (cls.implements || []).forEach(iface => {
            // Dashed arrow for implements
            lines.push(`  ${sanitizeId(iface)} <|.. ${sanitizeId(cls.name)}`);
        });
    });

    // Standalone functions → Module utility class
    if (elements.functions.length > 0) {
        const label = elements.classes.length > 0 ? "Functions" : "Module";
        lines.push(`  class ${label} {`);
        lines.push("    <<module>>");
        const displayFuncs = elements.functions.slice(0, 20);
        displayFuncs.forEach(fn => {
            const paramStr = fn.params.map(sanitizeLabel).join(", ");
            lines.push(`    +${sanitizeLabel(fn.name)}(${paramStr})`);
        });
        if (elements.functions.length > 20) {
            lines.push(`    ... ${elements.functions.length - 20} more`);
        }
        lines.push("  }");
    }

    // Empty module fallback
    if (
        elements.classes.length === 0 &&
        elements.interfaces.length === 0 &&
        elements.functions.length === 0
    ) {
        lines.push("  class EmptyModule {");
        lines.push("    <<empty>>");
        lines.push("  }");
    }

    return lines.join("\n");
}

/**
 * Generate a Mermaid flowchart representing structural relationships.
 *
 * Fixes:
 *   - Replaced meaningless F0→F1→F2 sequential connections with actual
 *     inheritance and implementation edges derived from the AST.
 *   - Classes shown as rectangles; interfaces as hexagons; functions as rounded rects.
 *   - Method sub-nodes shown per class (capped at 5 to keep graphs readable).
 *   - Sanitizes all labels and IDs.
 *
 * @param {Object} elements
 * @returns {string}
 */
function generateFlowchart(elements) {
    const lines = ["flowchart TD"];
    const METHOD_DISPLAY_LIMIT = 5;

    const hasContent =
        elements.classes.length > 0 ||
        elements.interfaces.length > 0 ||
        elements.functions.length > 0;

    if (!hasContent) {
        lines.push('  A["No structures detected"]');
        return lines.join("\n");
    }

    // Emit interfaces
    elements.interfaces.forEach(iface => {
        const id = `I_${sanitizeId(iface.name)}`;
        lines.push(`  ${id}{{"«interface»\\n${sanitizeLabel(iface.name)}"}}`);

        (iface.extends || []).forEach(parent => {
            const parentId = `I_${sanitizeId(parent)}`;
            lines.push(`  ${parentId} --> ${id}`);
        });
    });

    // Emit classes with their methods as child nodes
    elements.classes.forEach(cls => {
        const classId = `C_${sanitizeId(cls.name)}`;
        lines.push(`  ${classId}["${sanitizeLabel(cls.name)}"]`);

        // Show first N methods as sub-nodes
        const displayMethods = cls.methods.slice(0, METHOD_DISPLAY_LIMIT);
        displayMethods.forEach(m => {
            const methodId = `${classId}_${sanitizeId(m.name)}`;
            lines.push(`  ${methodId}("${sanitizeLabel(m.name)}()")`);
            lines.push(`  ${classId} --> ${methodId}`);
        });
        if (cls.methods.length > METHOD_DISPLAY_LIMIT) {
            const moreId = `${classId}_more`;
            lines.push(`  ${moreId}["...+${cls.methods.length - METHOD_DISPLAY_LIMIT} more"]`);
            lines.push(`  ${classId} --> ${moreId}`);
        }

        // Inheritance edge
        if (cls.parent) {
            const parentId = `C_${sanitizeId(cls.parent)}`;
            lines.push(`  ${parentId} --> ${classId}`);
        }

        // Implements edges (dashed)
        (cls.implements || []).forEach(iface => {
            const ifaceId = `I_${sanitizeId(iface)}`;
            lines.push(`  ${ifaceId} -.-> ${classId}`);
        });
    });

    // Emit standalone functions
    if (elements.functions.length > 0) {
        const displayFuncs = elements.functions.slice(0, 15);
        displayFuncs.forEach(fn => {
            const fnId = `F_${sanitizeId(fn.name)}`;
            lines.push(`  ${fnId}("${sanitizeLabel(fn.name)}()")`);
        });
        if (elements.functions.length > 15) {
            lines.push(`  F_more["...+${elements.functions.length - 15} more functions"]`);
        }
    }

    return lines.join("\n");
}

/**
 * Generate a Mermaid dependency graph from imports.
 *
 * Fixes:
 *   - Groups multiple imports from the same source into one node (avoids duplicates)
 *   - Differentiates external packages (double-rect) from local files (single-rect)
 *   - Caps named import sub-nodes at 10 per source to prevent bloat
 *   - Sanitizes all labels and IDs
 *
 * @param {Object} elements
 * @returns {string}
 */
function generateDependencyGraph(elements) {
    const lines = ["flowchart LR"];
    const NAMED_IMPORT_LIMIT = 10;

    if (elements.imports.length === 0) {
        lines.push('  A["No dependencies detected"]');
        return lines.join("\n");
    }

    lines.push('  APP["Current Module"]');

    // Group all imports by source so the same package appears once
    const grouped = new Map();
    elements.imports.forEach(imp => {
        const src = imp.source;
        if (!grouped.has(src)) grouped.set(src, { named: new Set(), defaults: new Set() });
        const entry = grouped.get(src);
        (imp.named || []).forEach(n => entry.named.add(n));
        if (imp.default) entry.defaults.add(imp.default);
    });

    Array.from(grouped.entries()).forEach(([source, info], i) => {
        const nodeId = `D${i}`;
        const isExternal = !source.startsWith(".") && !source.startsWith("/");
        const displayName = sanitizeLabel(source.split("/").pop() || source);

        // External packages: double-bordered rectangle [[...]] — local: single [...]
        if (isExternal) {
            lines.push(`  ${nodeId}[["${displayName}"]]`);
        } else {
            lines.push(`  ${nodeId}["${displayName}"]`);
        }
        lines.push(`  APP --> ${nodeId}`);

        // Named imports as sub-nodes (capped)
        const namedArr = Array.from(info.named).slice(0, NAMED_IMPORT_LIMIT);
        namedArr.forEach((name, j) => {
            const subId = `${nodeId}N${j}`;
            lines.push(`  ${subId}("${sanitizeLabel(name)}")`);
            lines.push(`  ${nodeId} --> ${subId}`);
        });
        if (info.named.size > NAMED_IMPORT_LIMIT) {
            const moreId = `${nodeId}NMore`;
            lines.push(`  ${moreId}["...+${info.named.size - NAMED_IMPORT_LIMIT} more"]`);
            lines.push(`  ${nodeId} --> ${moreId}`);
        }

        // Default / namespace imports (only if not already listed as named)
        info.defaults.forEach((def, j) => {
            if (!info.named.has(def)) {
                const defId = `${nodeId}D${j}`;
                lines.push(`  ${defId}("${sanitizeLabel(def)}")`);
                lines.push(`  ${nodeId} --> ${defId}`);
            }
        });
    });

    return lines.join("\n");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate Mermaid diagram strings from source code.
 *
 * @param {Object} params
 * @param {string} params.code      - Source code to parse
 * @param {string} params.language  - "javascript" | "typescript" | "python" | "java"
 * @returns {{
 *   classDiagram: string,
 *   flowchart: string,
 *   dependencyGraph: string,
 *   metadata: {
 *     classes: number,
 *     interfaces: number,
 *     functions: number,
 *     imports: number,
 *     exports: number,
 *     language: string
 *   }
 * }}
 */
export function generateDiagram({ code, language = "javascript" }) {
    if (!code || typeof code !== "string") {
        throw new TypeError("generateDiagram: `code` must be a non-empty string.");
    }

    const lang = language.toLowerCase();
    const supported = ["javascript", "typescript", "python", "java"];
    if (!supported.includes(lang)) {
        throw new RangeError(`generateDiagram: unsupported language "${lang}". Supported: ${supported.join(", ")}`);
    }

    const elements = extractElements(code, lang);

    return {
        classDiagram:    generateClassDiagram(elements),
        flowchart:       generateFlowchart(elements),
        dependencyGraph: generateDependencyGraph(elements),
        metadata: {
            classes:    elements.classes.length,
            interfaces: elements.interfaces.length,
            functions:  elements.functions.length,
            imports:    elements.imports.length,
            exports:    elements.exports.length,
            language:   lang,
        },
    };
}