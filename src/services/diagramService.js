/**
 * Architecture Diagram Generator Service
 * ----------------------------------------
 * Parses code to extract structure (functions, classes, imports)
 * and generates Mermaid.js diagram syntax for visualization.
 * Uses ts-morph for TypeScript/JavaScript parsing when available,
 * with regex fallback for other languages.
 */

/**
 * Generate a Mermaid diagram string from source code.
 *
 * @param {Object} params
 * @param {string} params.code - Source code to parse
 * @param {string} params.language - Programming language
 * @returns {Object} Object with mermaid diagram string and metadata
 */
export function generateDiagram({ code, language = "javascript" }) {
    // Extract structural elements from the code
    const elements = extractElements(code, language);

    // Generate both class diagram and flowchart representations
    const classDiagram = generateClassDiagram(elements);
    const flowchart = generateFlowchart(elements);
    const dependencyGraph = generateDependencyGraph(elements);

    return {
        classDiagram,
        flowchart,
        dependencyGraph,
        metadata: {
            classes: elements.classes.length,
            functions: elements.functions.length,
            imports: elements.imports.length,
            language,
        },
    };
}

/**
 * Extract structural elements (classes, functions, imports)
 * from source code using regex pattern matching.
 *
 * @param {string} code - Source code
 * @param {string} language - Language hint
 * @returns {Object} Extracted elements
 */
function extractElements(code, language) {
    const elements = {
        classes: [],
        functions: [],
        imports: [],
        variables: [],
        exports: [],
    };

    // --- Extract classes ---
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{/g;
    let match;
    while ((match = classRegex.exec(code)) !== null) {
        const className = match[1];
        const parentClass = match[2] || null;

        // Extract methods within the class body
        const classBodyStart = match.index + match[0].length;
        const classBody = extractBlock(code, classBodyStart);
        const methods = [];
        const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g;
        let methodMatch;
        while ((methodMatch = methodRegex.exec(classBody)) !== null) {
            if (methodMatch[1] !== "constructor") {
                methods.push(methodMatch[1]);
            }
        }

        elements.classes.push({ name: className, parent: parentClass, methods });
    }

    // --- Extract standalone functions ---
    const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
    while ((match = funcRegex.exec(code)) !== null) {
        elements.functions.push({
            name: match[1],
            params: match[2].split(",").map((p) => p.trim()).filter(Boolean),
        });
    }

    // Arrow functions assigned to const/let
    const arrowRegex = /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g;
    while ((match = arrowRegex.exec(code)) !== null) {
        elements.functions.push({
            name: match[1],
            params: match[2].split(",").map((p) => p.trim()).filter(Boolean),
        });
    }

    // --- Extract imports ---
    const importRegex = /import\s+(?:(\w+)(?:,\s*)?)?(?:\{([^}]+)\})?\s+from\s+["']([^"']+)["']/g;
    while ((match = importRegex.exec(code)) !== null) {
        elements.imports.push({
            default: match[1] || null,
            named: match[2] ? match[2].split(",").map((s) => s.trim()) : [],
            source: match[3],
        });
    }

    // --- Extract exports ---
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
    while ((match = exportRegex.exec(code)) !== null) {
        elements.exports.push(match[1]);
    }

    return elements;
}

/**
 * Extract a brace-delimited block from code starting at a given position.
 *
 * @param {string} code - Full source code
 * @param {number} start - Start position (right after opening brace)
 * @returns {string} The block content
 */
function extractBlock(code, start) {
    let depth = 1;
    let i = start;
    while (i < code.length && depth > 0) {
        if (code[i] === "{") depth++;
        if (code[i] === "}") depth--;
        i++;
    }
    return code.slice(start, i - 1);
}

/**
 * Generate a Mermaid class diagram from extracted elements.
 *
 * @param {Object} elements
 * @returns {string} Mermaid class diagram syntax
 */
function generateClassDiagram(elements) {
    const lines = ["classDiagram"];

    // Add classes
    elements.classes.forEach((cls) => {
        if (cls.parent) {
            lines.push(`  ${cls.parent} <|-- ${cls.name}`);
        }
        if (cls.methods.length > 0) {
            lines.push(`  class ${cls.name} {`);
            cls.methods.forEach((method) => {
                lines.push(`    +${method}()`);
            });
            lines.push("  }");
        }
    });

    // Add standalone functions as a utility class
    if (elements.functions.length > 0 && elements.classes.length > 0) {
        lines.push("  class Functions {");
        elements.functions.forEach((fn) => {
            const params = fn.params.join(", ");
            lines.push(`    +${fn.name}(${params})`);
        });
        lines.push("  }");
    }

    // Fallback for code with no classes
    if (elements.classes.length === 0) {
        lines.push("  class Module {");
        elements.functions.forEach((fn) => {
            const params = fn.params.join(", ");
            lines.push(`    +${fn.name}(${params})`);
        });
        lines.push("  }");
    }

    return lines.join("\n");
}

/**
 * Generate a Mermaid flowchart from extracted elements.
 *
 * @param {Object} elements
 * @returns {string} Mermaid flowchart syntax
 */
function generateFlowchart(elements) {
    const lines = ["flowchart TD"];

    if (elements.functions.length === 0 && elements.classes.length === 0) {
        lines.push('  A["No structures detected"]');
        return lines.join("\n");
    }

    // Create nodes for each function
    elements.functions.forEach((fn, i) => {
        const nodeId = `F${i}`;
        lines.push(`  ${nodeId}["${fn.name}()"]`);

        // Connect sequential functions
        if (i > 0) {
            lines.push(`  F${i - 1} --> ${nodeId}`);
        }
    });

    // Create nodes for classes
    elements.classes.forEach((cls, i) => {
        const nodeId = `C${i}`;
        lines.push(`  ${nodeId}[["${cls.name}"]}`);

        // Connect class methods
        cls.methods.forEach((method, j) => {
            const methodId = `C${i}M${j}`;
            lines.push(`  ${methodId}("${method}()")`);
            lines.push(`  ${nodeId} --> ${methodId}`);
        });
    });

    return lines.join("\n");
}

/**
 * Generate a Mermaid dependency graph from imports.
 *
 * @param {Object} elements
 * @returns {string} Mermaid graph syntax
 */
function generateDependencyGraph(elements) {
    const lines = ["flowchart LR"];

    if (elements.imports.length === 0) {
        lines.push('  A["No dependencies detected"]');
        return lines.join("\n");
    }

    lines.push('  APP["Current Module"]');

    elements.imports.forEach((imp, i) => {
        const nodeId = `D${i}`;
        // Clean up the source name for display
        const displayName = imp.source.split("/").pop();
        lines.push(`  ${nodeId}["${displayName}"]`);
        lines.push(`  APP --> ${nodeId}`);

        // Show named imports as sub-nodes
        if (imp.named.length > 0) {
            imp.named.forEach((name, j) => {
                const subId = `D${i}N${j}`;
                lines.push(`  ${subId}("${name}")`);
                lines.push(`  ${nodeId} --> ${subId}`);
            });
        }
    });

    return lines.join("\n");
}
