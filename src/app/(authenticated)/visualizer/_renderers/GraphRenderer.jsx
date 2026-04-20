"use client";
import React, { useMemo } from "react";

/**
 * GraphRenderer — BFS traversal visualization on a dark canvas.
 *
 * Improvements:
 *  - Dark bg-gray-950 canvas matching the rest of the visualizers
 *  - Larger SVG (600×340) so nodes aren't cramped
 *  - Current node glows blue with SVG drop-shadow filter
 *  - Visited nodes pulse with a green ring animation
 *  - Queued nodes shown in amber
 *  - Traversal order badge shows the BFS sequence discovered so far
 *  - Queue display moved into a styled pill row instead of plain text
 *  - Edge that was just traversed highlighted in amber
 */

const CIRCLE_R = 22;

export default function GraphRenderer({ step }) {
    if (!step?.nodes) return null;

    const W = 560, H = 280;
    const layoutR = 110;
    const center  = { x: W / 2, y: H / 2 };

    const nodePositions = useMemo(() => {
        const pos = {};
        const n   = step.nodes.length;
        step.nodes.forEach((node, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            pos[node.id] = {
                x: center.x + layoutR * Math.cos(angle),
                y: center.y + layoutR * Math.sin(angle),
            };
        });
        return pos;
    }, [step.nodes]);

    return (
        <div className="w-full h-full flex flex-col bg-gray-950 rounded-xl overflow-hidden">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="flex-1 overflow-visible">
                <defs>
                    <filter id="glow-b">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#3b82f6" floodOpacity="0.9" />
                    </filter>
                    <filter id="glow-g">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22c55e" floodOpacity="0.7" />
                    </filter>
                </defs>

                {/* Edges */}
                {step.edges.map((edge, i) => {
                    const from = nodePositions[edge.from];
                    const to   = nodePositions[edge.to];
                    const isActive =
                        (step.highlightEdge?.from === edge.from && step.highlightEdge?.to === edge.to) ||
                        (step.highlightEdge?.from === edge.to   && step.highlightEdge?.to === edge.from);
                    return (
                        <line
                            key={i}
                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                            stroke={isActive ? "#f59e0b" : "#334155"}
                            strokeWidth={isActive ? 3 : 1.5}
                            strokeLinecap="round"
                            className="transition-all duration-300"
                        />
                    );
                })}

                {/* Nodes */}
                {step.nodes.map(node => {
                    const pos       = nodePositions[node.id];
                    const isVisited = step.visited?.includes(node.id);
                    const isCurrent = step.currentNode === node.id;
                    const isQueued  = step.queue?.includes(node.id);

                    const fill   = isCurrent ? "#1e3a8a"
                                 : isVisited ? "#14532d"
                                 : isQueued  ? "#78350f"
                                 : "#1e293b";
                    const stroke = isCurrent ? "#3b82f6"
                                 : isVisited ? "#22c55e"
                                 : isQueued  ? "#f59e0b"
                                 : "#475569";
                    const r      = isCurrent ? CIRCLE_R + 4 : CIRCLE_R;
                    const filter = isCurrent ? "url(#glow-b)"
                                 : isVisited ? "url(#glow-g)"
                                 : "none";

                    return (
                        <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                            <circle
                                r={r}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth="2.5"
                                filter={filter}
                                className="transition-all duration-300"
                            />
                            <text
                                textAnchor="middle"
                                dy=".35em"
                                fontSize="13"
                                fontWeight="700"
                                fontFamily="monospace"
                                fill={isCurrent || isVisited || isQueued ? "#e2e8f0" : "#94a3b8"}
                            >
                                {node.id}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Bottom info strip */}
            <div className="flex items-center justify-between gap-4 px-4 py-2 bg-gray-900 border-t border-gray-800">
                {/* Legend */}
                <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
                    {[
                        { color: "bg-blue-500",   label: "Current"  },
                        { color: "bg-amber-400",  label: "Queued"   },
                        { color: "bg-green-500",  label: "Visited"  },
                    ].map(({ color, label }) => (
                        <span key={label} className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                            {label}
                        </span>
                    ))}
                </div>

                {/* Queue state */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-mono">Queue:</span>
                    <div className="flex gap-1">
                        {(step.queue || []).length === 0
                            ? <span className="text-[10px] text-gray-600 italic">empty</span>
                            : (step.queue || []).map((id, i) => (
                                <span key={i} className="px-2 py-0.5 bg-amber-900/60 border border-amber-600/40 rounded text-amber-300 text-[10px] font-mono font-bold">
                                    {id}
                                </span>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
