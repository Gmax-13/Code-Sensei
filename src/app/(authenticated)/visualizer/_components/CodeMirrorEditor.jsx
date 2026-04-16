"use client";
import React from "react";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

export default function CodeMirrorEditor({ value, onChange, language = "javascript", readOnly = false, highlightLine = null }) {
    const extensions = [
        language === "python" ? python() : javascript({ jsx: true }),
        // Simple line highlighter extension if requested
        // CodeMirror makes it slightly tricky to do external line decorations quickly, 
        // so for an MVP line highlighting we can rely on standard features or CSS targeting.
        // For now, extensions array will just handle language formatting.
    ];
    
    return (
        <div className={`border rounded-lg overflow-hidden ${readOnly ? 'border-gray-300 dark:border-gray-600 opacity-90' : 'border-gray-300 dark:border-gray-600'}`}>
            <CodeMirror
                value={value}
                height="400px"
                extensions={extensions}
                onChange={onChange ? (val) => onChange(val) : undefined}
                readOnly={readOnly}
                theme="dark" // Ideally bound to next-themes, hardcoded dark looks sleek for MVP editors though
                className="text-sm"
            />
            {highlightLine !== null && (
                <div className="bg-blue-500/10 border-t border-b border-blue-500/20 px-4 py-2 text-xs text-blue-400 absolute bottom-0 w-full z-10 backdrop-blur-sm pointer-events-none">
                    Executing line: {highlightLine}
                </div>
            )}
        </div>
    );
}
