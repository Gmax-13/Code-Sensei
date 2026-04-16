"use client";
import React, { useMemo } from 'react';

export default function TreeRenderer({ step }) {
    if (!step?.tree) return null;
    
    // Convert flat array format to coordinates
    const nodeMap = {};
    step.tree.forEach(n => { nodeMap[n.id] = { ...n }; });
    
    const root = step.tree.find(n => n.parentId === null);
    
    if (root) {
        // Recursive coordinate assignment
        // Base width for the root level = 160
        const assignCoords = (nodeId, depth, x, spread) => {
            nodeMap[nodeId].cx = x;
            nodeMap[nodeId].cy = 40 + depth * 60;
            // find children
            const leftChild = step.tree.find(n => n.parentId === nodeId && n.isLeft);
            if (leftChild) assignCoords(leftChild.id, depth + 1, x - spread, spread / 2);
            
            const rightChild = step.tree.find(n => n.parentId === nodeId && !n.isLeft);
            if (rightChild) assignCoords(rightChild.id, depth + 1, x + spread, spread / 2);
        };
        // We set root to center (300) assuming svg width 600
        assignCoords(root.id, 0, 300, 160);
    }

    return (
        <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto min-h-[350px] w-full">
            <svg width="600" height="350" className="overflow-visible min-w-[600px]">
                {/* Edges */}
                {step.tree.filter(n => n.parentId !== null).map(node => {
                    const parent = nodeMap[node.parentId];
                    const me = nodeMap[node.id];
                    return (
                        <line 
                            key={`edge-${node.id}`} 
                            x1={parent.cx} y1={parent.cy} 
                            x2={me.cx} y2={me.cy} 
                            stroke="#cbd5e1" strokeWidth="3" 
                            className="transition-all duration-300"
                        />
                    );
                })}
                {/* Nodes */}
                {step.tree.map(node => {
                    const me = nodeMap[node.id];
                    const isHighlighted = step.highlight?.includes(node.id);
                    return (
                        <g key={node.id} transform={`translate(${me.cx}, ${me.cy})`} className="transition-all duration-300">
                            <circle 
                                r="24" 
                                fill={isHighlighted ? "#bfdbfe" : "#ffffff"} 
                                stroke={isHighlighted ? "#2563eb" : "#94a3b8"} 
                                strokeWidth="3" 
                                className="transition-all duration-300"
                            />
                            <text textAnchor="middle" dy=".3em" fontSize="14" fontWeight="bold" fill="#1e293b">
                                {node.value}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
