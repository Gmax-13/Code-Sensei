/**
 * Report Generator Service
 * -------------------------
 * Takes code or project text and generates a structured
 * practical report with: Aim, Theory, Procedure, Code,
 * Result, and Conclusion sections.
 *
 * NOTE: This uses a rule-based stub. In production, this
 * would be replaced with an LLM API call (e.g., OpenAI).
 * The abstraction layer is ready for that swap.
 */

/**
 * Generate a structured report from code input.
 *
 * @param {Object} params
 * @param {string} params.code - The source code or project description
 * @param {string} params.language - Programming language (default: "javascript")
 * @param {string} params.title - Report title
 * @returns {Object} Structured report object
 */
export function generateReport({ code, language = "javascript", title = "Untitled Report" }) {
    // Count basic metrics from the code
    const lines = code.split("\n");
    const lineCount = lines.length;
    const functionMatches = code.match(/function\s+\w+|const\s+\w+\s*=\s*(\(|async)/g) || [];
    const classMatches = code.match(/class\s+\w+/g) || [];
    const importMatches = code.match(/import\s+/g) || [];

    // Extract function names for procedure section
    const functionNames = (code.match(/function\s+(\w+)/g) || [])
        .map((m) => m.replace("function ", ""));

    // Build a structured report
    const report = {
        title,
        language,
        generatedAt: new Date().toISOString(),

        /** Aim: What the code intends to achieve */
        aim: `To implement and demonstrate a ${language} program titled "${title}" `
            + `that contains ${lineCount} lines of code with ${functionMatches.length} functions `
            + `and ${classMatches.length} class(es).`,

        /** Theory: Background explanation */
        theory: generateTheory(language, code),

        /** Procedure: Step-by-step process */
        procedure: generateProcedure(functionNames, language),

        /** Code: The actual source code */
        code: code,

        /** Result: Expected output / behavior */
        result: `The program successfully compiles and executes. `
            + `It defines ${functionMatches.length} function(s), `
            + `${classMatches.length} class(es), and uses ${importMatches.length} import(s). `
            + `Total lines of code: ${lineCount}.`,

        /** Conclusion: Summary and learnings */
        conclusion: `This program demonstrates practical application of ${language} programming concepts. `
            + `Key concepts covered include ${getConceptsList(code, language)}. `
            + `The implementation follows clean coding practices with modular design.`,
    };

    return report;
}

/**
 * Generate theory section based on detected concepts.
 * [STUB] In production, this would call an LLM.
 *
 * @param {string} language
 * @param {string} code
 * @returns {string}
 */
function generateTheory(language, code) {
    const concepts = [];

    if (code.includes("async") || code.includes("await") || code.includes("Promise")) {
        concepts.push(
            "**Asynchronous Programming**: The use of async/await or Promises to handle operations that take time without blocking the main thread."
        );
    }
    if (code.includes("class ")) {
        concepts.push(
            "**Object-Oriented Programming**: Classes encapsulate data and behavior into reusable objects."
        );
    }
    if (code.includes("import ") || code.includes("require(")) {
        concepts.push(
            "**Modular Architecture**: The code uses imports/modules to separate concerns and promote reusability."
        );
    }
    if (code.includes("if ") || code.includes("switch")) {
        concepts.push(
            "**Control Flow**: Conditional statements control the execution path based on runtime conditions."
        );
    }
    if (code.includes("for ") || code.includes("while ") || code.includes(".map(") || code.includes(".forEach(")) {
        concepts.push(
            "**Iteration**: Loops and higher-order functions process collections of data systematically."
        );
    }
    if (code.includes("try") && code.includes("catch")) {
        concepts.push(
            "**Error Handling**: Try-catch blocks gracefully handle runtime errors and edge cases."
        );
    }

    if (concepts.length === 0) {
        concepts.push(
            `**${language} Fundamentals**: The code demonstrates core programming fundamentals including variables, functions, and data manipulation.`
        );
    }

    return concepts.join("\n\n");
}

/**
 * Generate procedure steps from function names.
 *
 * @param {string[]} functionNames
 * @param {string} language
 * @returns {string[]}
 */
function generateProcedure(functionNames, language) {
    const steps = [
        `Set up the ${language} development environment.`,
        `Create a new ${language} source file.`,
    ];

    if (functionNames.length > 0) {
        functionNames.forEach((name) => {
            steps.push(`Implement the \`${name}\` function with its required logic.`);
        });
    } else {
        steps.push("Write the main program logic.");
    }

    steps.push("Test the program with sample inputs.");
    steps.push("Verify the output matches expected results.");
    steps.push("Document the code with appropriate comments.");

    return steps;
}

/**
 * Detect and list key programming concepts found in the code.
 *
 * @param {string} code
 * @param {string} language
 * @returns {string}
 */
function getConceptsList(code, language) {
    const concepts = [];
    if (code.includes("function") || code.includes("=>")) concepts.push("functions");
    if (code.includes("class")) concepts.push("OOP");
    if (code.includes("async")) concepts.push("async programming");
    if (code.includes("import") || code.includes("require")) concepts.push("modularity");
    if (code.includes("for") || code.includes("while") || code.includes("map")) concepts.push("iteration");
    if (code.includes("if") || code.includes("switch")) concepts.push("control flow");

    return concepts.length > 0 ? concepts.join(", ") : `basic ${language} programming`;
}
