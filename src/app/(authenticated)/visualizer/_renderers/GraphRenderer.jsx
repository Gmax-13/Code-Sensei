"use client";
import React, { useMemo } from 'react';

export default function GraphRenderer({ step }) {
    if (!step?.nodes) return null;
    
    // Circular layout
    const radius = 120;
    const center = { x: 250, y: 150 };
    
    const nodePositions = useMemo(() => {
        const pos = {};
        const n = step.nodes.length;
        step.nodes.forEach((node, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            pos[node.id] = {
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle)
            };
        });
        return pos;
    }, [step.nodes]);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[350px]">
            <svg width="500" height="300" className="overflow-visible">
                {/* Edges */}
                {step.edges.map((edge, i) => {
                    const from = nodePositions[edge.from];
                    const to = nodePositions[edge.to];
                    const isHighlighted = (step.highlightEdge?.from === edge.from && step.highlightEdge?.to === edge.to) 
                                        || (step.highlightEdge?.from === edge.to && step.highlightEdge?.to === edge.from);
                    
                    return (
                        <line 
                            key={i} 
                            x1={from.x} y1={from.y} x2={to.x} y2={to.y} 
                            stroke={isHighlighted ? "#f59e0b" : "#9ca3af"} 
                            strokeWidth={isHighlighted ? 4 : 2} 
                            className="transition-all duration-300"
                        />
                    );
                })}
                {/* Nodes */}
                {step.nodes.map((node) => {
                    const pos = nodePositions[node.id];
                    const isVisited = step.visited?.includes(node.id);
                    const isCurrent = step.currentNode === node.id;
                    const isQueued = step.queue?.includes(node.id);
                    
                    let fill = "#f3f4f6"; // gray-100
                    let stroke = "#d1d5db"; // gray-300
                    let textColor = "#374151"; // gray-700
                    let radius = 20;
                    
                    if (isCurrent) {
                        fill = "#bfdbfe"; // blue-200
                        stroke = "#2563eb"; // blue-600
                        textColor = "#1e3a8a"; // blue-900
                        radius = 24;
                    } else if (isVisited) {
                        fill = "#bbf7d0"; // green-200
                        stroke = "#16a34a"; // green-600
                        textColor = "#14532d"; // green-900
                    } else if (isQueued) {
                        fill = "#fef08a"; // yellow-200
                        stroke = "#ca8a04"; // yellow-600
                        textColor = "#713f12"; // yellow-900
                        radius = 22;
                    }

                    return (
                        <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`} className="transition-all duration-300">
                            <circle r={radius} fill={fill} stroke={stroke} strokeWidth="3" className="transition-all duration-300" />
                            <text textAnchor="middle" dy=".3em" fontSize="14" fontWeight="bold" fill={textColor}>
                                {node.id}
                            </text>
                        </g>
                    );
                })}
            </svg>
            
            {/* Legend / Status */}
            <div className="mt-8 flex flex-wrap gap-4 text-xs font-mono bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Current</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> In Queue</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Visited</div>
            </div>
            
            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 font-mono bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                Queue: [{step.queue?.join(", ")}]
            </div>
        </div>
    );
}
