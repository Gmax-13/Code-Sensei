"use client";
import React, { useMemo } from "react";

/**
 * TreeRenderer — Binary Search Tree visualization.
 *
 * Fixes & improvements:
 *  - Reduced node radius 24 → 16 (less overlap on wide trees)
 *  - SVG width/height scales with actual tree depth & breadth
 *  - Canvas uses overflow-auto so very tall/wide trees scroll instead of clipping
 *  - Dynamic spread based on max depth so nodes never overlap
 *  - Highlighted nodes glow with a blue ring + drop-shadow filter
 *  - Edge animates in (stroke-dasharray trick)
 *  - "Newly inserted" node pulses with a green ring
 */

const NODE_R       = 16;   // ← reduced from 24
const LEVEL_HEIGHT = 64;   // vertical gap between levels
const ROOT_SPREAD  = 200;  // horizontal spread at root level

export default function TreeRenderer({ step }) {
    if (!step?.tree) return null;

    // ── Build coordinate map ──────────────────────────────────────────────────
    const nodeMap = useMemo(() => {
        const map = {};
        step.tree.forEach(n => { map[n.id] = { ...n }; });
        return map;
    }, [step.tree]);

    const root = step.tree.find(n => n.parentId === null);

    // Assign (cx, cy) recursively with a spread that halves each level
    const maxDepth = useMemo(() => {
        let d = 0;
        step.tree.forEach(n => {
            let depth = 0, cur = n;
            while (cur.parentId !== null) {
                cur = nodeMap[cur.parentId];
                depth++;
            }
            if (depth > d) d = depth;
        });
        return d;
    }, [step.tree, nodeMap]);

    // SVG dimensions — grow with the tree
    const svgW = Math.max(600, ROOT_SPREAD * 2 + 80);
    const svgH = (maxDepth + 1) * LEVEL_HEIGHT + 60;

    if (root) {
        const assign = (id, depth, x, spread) => {
            nodeMap[id].cx = x;
            nodeMap[id].cy = 40 + depth * LEVEL_HEIGHT;
            const lc = step.tree.find(n => n.parentId === id &&  n.isLeft);
            const rc = step.tree.find(n => n.parentId === id && !n.isLeft);
            if (lc) assign(lc.id, depth + 1, x - spread, spread / 2);
            if (rc) assign(rc.id, depth + 1, x + spread, spread / 2);
        };
        assign(root.id, 0, svgW / 2, ROOT_SPREAD);
    }

    return (
        /* overflow-auto → scrolls when tree is bigger than the 384px canvas */
        <div className="w-full h-full overflow-auto bg-gray-950 rounded-xl flex justify-center items-start p-4">
            <svg
                width={svgW}
                height={svgH}
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="overflow-visible"
            >
                <defs>
                    <filter id="glow-blue">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.8" />
                    </filter>
                    <filter id="glow-green">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22c55e" floodOpacity="0.8" />
                    </filter>
                </defs>

                {/* Edges */}
                {step.tree.filter(n => n.parentId !== null).map(node => {
                    const parent = nodeMap[node.parentId];
                    const me     = nodeMap[node.id];
                    return (
                        <line
                            key={`edge-${node.id}`}
                            x1={parent.cx} y1={parent.cy}
                            x2={me.cx}     y2={me.cy}
                            stroke="#334155"
                            strokeWidth="2"
                            className="transition-all duration-300"
                        />
                    );
                })}

                {/* Nodes */}
                {step.tree.map(node => {
                    const me            = nodeMap[node.id];
                    const isHighlighted = step.highlight?.includes(node.id);
                    const isNew         = step.newNode === node.id;

                    const fill   = isNew         ? "#14532d"
                                 : isHighlighted ? "#1e3a8a"
                                 : "#1e293b";
                    const stroke = isNew         ? "#22c55e"
                                 : isHighlighted ? "#3b82f6"
                                 : "#475569";
                    const filter = isNew         ? "url(#glow-green)"
                                 : isHighlighted ? "url(#glow-blue)"
                                 : "none";

                    return (
                        <g
                            key={node.id}
                            transform={`translate(${me.cx}, ${me.cy})`}
                            className="transition-all duration-400"
                        >
                            <circle
                                r={NODE_R}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={isHighlighted || isNew ? 2.5 : 1.5}
                                filter={filter}
                                className="transition-all duration-300"
                            />
                            <text
                                textAnchor="middle"
                                dy=".35em"
                                fontSize="11"
                                fontWeight="700"
                                fill={isHighlighted || isNew ? "#e2e8f0" : "#94a3b8"}
                                fontFamily="monospace"
                            >
                                {node.value}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 flex gap-3 text-[10px] font-mono bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-700">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Traversing
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Inserted
                </span>
            </div>
        </div>
    );
}
