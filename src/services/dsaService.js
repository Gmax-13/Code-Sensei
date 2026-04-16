/**
 * DSA Engine Service
 * -------------------
 * Implements core data structures and algorithms with
 * step-by-step state tracking for visualization purposes.
 *
 * Supported algorithms:
 *   - Bubble Sort (with optimization)
 *   - Merge Sort (recursive divide & conquer)
 *   - Stack operations (push, pop, peek)
 *   - Queue operations (enqueue, dequeue, peek)
 */

// ============================================================
// SORTING ALGORITHMS
// ============================================================

/**
 * Bubble Sort with step-by-step state recording.
 * Repeatedly swaps adjacent elements if they are in the wrong order.
 *
 * @param {number[]} inputArray - Array to sort
 * @returns {Object} { sorted, steps } — final array and step states
 */
export function bubbleSort(inputArray) {
    const arr = [...inputArray]; // Don't mutate the original
    const steps = [];

    // Record initial state
    steps.push({
        array: [...arr],
        comparing: [],
        swapped: false,
        description: "Initial array state",
    });

    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let swappedInPass = false;

        for (let j = 0; j < n - i - 1; j++) {
            // Record comparison step
            steps.push({
                array: [...arr],
                comparing: [j, j + 1],
                swapped: false,
                description: `Comparing elements at index ${j} (${arr[j]}) and ${j + 1} (${arr[j + 1]})`,
            });

            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swappedInPass = true;

                // Record swap step
                steps.push({
                    array: [...arr],
                    comparing: [j, j + 1],
                    swapped: true,
                    description: `Swapped ${arr[j + 1]} and ${arr[j]}`,
                });
            }
        }

        // Optimization: if no swaps occurred, the array is sorted
        if (!swappedInPass) {
            steps.push({
                array: [...arr],
                comparing: [],
                swapped: false,
                description: "No swaps in this pass — array is sorted!",
            });
            break;
        }
    }

    return { sorted: arr, steps };
}

/**
 * Merge Sort with step-by-step state recording.
 * Divides the array into halves, sorts each half, then merges.
 *
 * @param {number[]} inputArray - Array to sort
 * @returns {Object} { sorted, steps }
 */
export function mergeSort(inputArray) {
    const steps = [];

    /**
     * Recursive merge sort implementation.
     * @param {number[]} arr - Sub-array to sort
     * @param {number} depth - Current recursion depth (for visualization)
     * @returns {number[]} Sorted sub-array
     */
    function mergeSortRecursive(arr, depth = 0) {
        // Base case: single element or empty is already sorted
        if (arr.length <= 1) {
            steps.push({
                array: [...arr],
                action: "base-case",
                depth,
                description: `Base case reached: [${arr}]`,
            });
            return arr;
        }

        // Split the array in half
        const mid = Math.floor(arr.length / 2);
        const left = arr.slice(0, mid);
        const right = arr.slice(mid);

        steps.push({
            array: [...arr],
            left: [...left],
            right: [...right],
            action: "split",
            depth,
            description: `Splitting [${arr}] into [${left}] and [${right}]`,
        });

        // Recursively sort both halves
        const sortedLeft = mergeSortRecursive(left, depth + 1);
        const sortedRight = mergeSortRecursive(right, depth + 1);

        // Merge the sorted halves
        const merged = merge(sortedLeft, sortedRight, depth);
        return merged;
    }

    /**
     * Merge two sorted arrays into one sorted array.
     * @param {number[]} left
     * @param {number[]} right
     * @param {number} depth
     * @returns {number[]}
     */
    function merge(left, right, depth) {
        const result = [];
        let i = 0;
        let j = 0;

        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            }
        }

        // Append remaining elements
        const merged = result.concat(left.slice(i)).concat(right.slice(j));

        steps.push({
            array: [...merged],
            left: [...left],
            right: [...right],
            action: "merge",
            depth,
            description: `Merged [${left}] and [${right}] → [${merged}]`,
        });

        return merged;
    }

    const sorted = mergeSortRecursive([...inputArray]);
    return { sorted, steps };
}

// ============================================================
// DATA STRUCTURES
// ============================================================

/**
 * Simulate a Stack with step-by-step state recording.
 * Supports push, pop, peek operations.
 *
 * @param {Array<{operation: string, value?: number}>} operations
 * @returns {Object} { finalStack, steps }
 */
export function simulateStack(operations) {
    const stack = [];
    const steps = [];

    // Record initial state
    steps.push({
        stack: [...stack],
        operation: "init",
        value: null,
        result: null,
        description: "Stack initialized (empty)",
    });

    operations.forEach((op) => {
        switch (op.operation) {
            case "push": {
                stack.push(op.value);
                steps.push({
                    stack: [...stack],
                    operation: "push",
                    value: op.value,
                    result: null,
                    description: `Pushed ${op.value} onto stack. Stack size: ${stack.length}`,
                });
                break;
            }

            case "pop": {
                if (stack.length === 0) {
                    steps.push({
                        stack: [...stack],
                        operation: "pop",
                        value: null,
                        result: "UNDERFLOW",
                        description: "Cannot pop — stack is empty (underflow)!",
                    });
                } else {
                    const popped = stack.pop();
                    steps.push({
                        stack: [...stack],
                        operation: "pop",
                        value: null,
                        result: popped,
                        description: `Popped ${popped} from stack. Stack size: ${stack.length}`,
                    });
                }
                break;
            }

            case "peek": {
                const top = stack.length > 0 ? stack[stack.length - 1] : "EMPTY";
                steps.push({
                    stack: [...stack],
                    operation: "peek",
                    value: null,
                    result: top,
                    description: `Peek: top element is ${top}`,
                });
                break;
            }

            default:
                steps.push({
                    stack: [...stack],
                    operation: "unknown",
                    value: null,
                    result: null,
                    description: `Unknown operation: ${op.operation}`,
                });
        }
    });

    return { finalStack: stack, steps };
}

/**
 * Simulate a Queue with step-by-step state recording.
 * Supports enqueue, dequeue, peek operations.
 *
 * @param {Array<{operation: string, value?: number}>} operations
 * @returns {Object} { finalQueue, steps }
 */
export function simulateQueue(operations) {
    const queue = [];
    const steps = [];

    // Record initial state
    steps.push({
        queue: [...queue],
        operation: "init",
        value: null,
        result: null,
        description: "Queue initialized (empty)",
    });

    operations.forEach((op) => {
        switch (op.operation) {
            case "enqueue": {
                queue.push(op.value);
                steps.push({
                    queue: [...queue],
                    operation: "enqueue",
                    value: op.value,
                    result: null,
                    description: `Enqueued ${op.value}. Queue size: ${queue.length}`,
                });
                break;
            }

            case "dequeue": {
                if (queue.length === 0) {
                    steps.push({
                        queue: [...queue],
                        operation: "dequeue",
                        value: null,
                        result: "UNDERFLOW",
                        description: "Cannot dequeue — queue is empty (underflow)!",
                    });
                } else {
                    const dequeued = queue.shift();
                    steps.push({
                        queue: [...queue],
                        operation: "dequeue",
                        value: null,
                        result: dequeued,
                        description: `Dequeued ${dequeued}. Queue size: ${queue.length}`,
                    });
                }
                break;
            }

            case "peek": {
                const front = queue.length > 0 ? queue[0] : "EMPTY";
                steps.push({
                    queue: [...queue],
                    operation: "peek",
                    value: null,
                    result: front,
                    description: `Peek: front element is ${front}`,
                });
                break;
            }

            default:
                steps.push({
                    queue: [...queue],
                    operation: "unknown",
                    value: null,
                    result: null,
                    description: `Unknown operation: ${op.operation}`,
                });
        }
    });

    return { finalQueue: queue, steps };
}

// ============================================================
// NEW ALGORITHMS (Trees, Graphs, DP, Binary Search)
// ============================================================

/**
 * Simulate a Binary Search Tree with step-by-step state recording.
 * Supports insert operations (deletions omitted for brevity, can be added later).
 * Nodes stored with { id, value, left, right, x, y }. Layout computed simple grid based on depth and pos.
 *
 * @param {Array<{operation: string, value: number}>} operations
 * @returns {Object} { root, steps }
 */
export function simulateBinaryTree(operations) {
    let treeNodes = []; // flat array of nodes { id, value, parentId, isLeft }
    let root = null;
    const steps = [];

    steps.push({
        tree: [],
        operation: "init",
        value: null,
        description: "Binary Tree initialized (empty)",
    });

    let idCounter = 1;

    operations.forEach(op => {
        if (op.operation === "insert") {
            const val = op.value;
            if (!root) {
                root = { id: idCounter++, value: val };
                treeNodes.push({ ...root, parentId: null, isLeft: false });
                steps.push({
                    tree: [...treeNodes],
                    highlight: [root.id],
                    operation: "insert",
                    value: val,
                    description: `Inserted ${val} as the root node.`,
                });
            } else {
                let curr = root;
                steps.push({
                    tree: [...treeNodes],
                    highlight: [curr.id],
                    operation: "insert",
                    value: val,
                    description: `Inserting ${val}. Comparing with root ${curr.value}.`,
                });

                while (true) {
                    if (val < curr.value) {
                        if (!curr.left) {
                            const newNode = { id: idCounter++, value: val };
                            curr.left = newNode;
                            treeNodes.push({ ...newNode, parentId: curr.id, isLeft: true });
                            steps.push({
                                tree: [...treeNodes],
                                highlight: [newNode.id],
                                operation: "insert",
                                value: val,
                                description: `Inserted ${val} to the left of ${curr.value}.`,
                            });
                            break;
                        } else {
                            curr = curr.left;
                            steps.push({
                                tree: [...treeNodes],
                                highlight: [curr.id],
                                operation: "insert",
                                value: val,
                                description: `${val} < parent. Moving left to ${curr.value}.`,
                            });
                        }
                    } else {
                        if (!curr.right) {
                            const newNode = { id: idCounter++, value: val };
                            curr.right = newNode;
                            treeNodes.push({ ...newNode, parentId: curr.id, isLeft: false });
                            steps.push({
                                tree: [...treeNodes],
                                highlight: [newNode.id],
                                operation: "insert",
                                value: val,
                                description: `Inserted ${val} to the right of ${curr.value}.`,
                            });
                            break;
                        } else {
                            curr = curr.right;
                            steps.push({
                                tree: [...treeNodes],
                                highlight: [curr.id],
                                operation: "insert",
                                value: val,
                                description: `${val} >= parent. Moving right to ${curr.value}.`,
                            });
                        }
                    }
                }
            }
        }
    });

    return { result: "Tree built", steps };
}

/**
 * Binary Search with step-by-step state recording.
 *
 * @param {number[]} array - The array to search in (must be sorted)
 * @param {number} target - The element to find
 * @returns {Object} { index, steps }
 */
export function binarySearch(array, target) {
    const arr = [...array];
    // Guarantee sorted
    arr.sort((a,b)=>a-b);
    const steps = [];
    
    let low = 0;
    let high = arr.length - 1;
    let found = false;
    let index = -1;

    steps.push({
        array: [...arr],
        low, high, mid: null,
        target,
        description: `Starting binary search for ${target}. Sorted array length ${arr.length}.`,
    });

    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        
        steps.push({
            array: [...arr],
            low, high, mid,
            target,
            description: `Calculated mid index: ${mid} (value: ${arr[mid]}). Range: [${low}, ${high}].`,
        });

        if (arr[mid] === target) {
            found = true;
            index = mid;
            steps.push({
                array: [...arr],
                low, high, mid,
                target,
                found: true,
                description: `Target ${target} found at index ${mid}!`,
            });
            break;
        } else if (arr[mid] < target) {
            low = mid + 1;
            steps.push({
                array: [...arr],
                low, high, mid,
                target,
                description: `Value ${arr[mid]} is less than target ${target}. Adjusting low pointer to ${low}.`,
            });
        } else {
            high = mid - 1;
            steps.push({
                array: [...arr],
                low, high, mid,
                target,
                description: `Value ${arr[mid]} is greater than target ${target}. Adjusting high pointer to ${high}.`,
            });
        }
    }

    if (!found) {
        steps.push({
            array: [...arr],
            low, high, mid: null,
            target,
            found: false,
            description: `Target ${target} not found in array.`,
        });
    }

    return { result: index, steps };
}

/**
 * Simulates Breadth-First Search (BFS) on an unweighted graph.
 *
 * @param {Object} graphData - { nodes: [{id}], edges: [{from, to}] }
 * @param {string|number} startNode - Starting node ID
 * @returns {Object} { steps }
 */
export function bfsGraph(graphData, startNode) {
    const { nodes, edges } = graphData;
    const adjList = {};
    nodes.forEach(n => { adjList[n.id] = []; });
    edges.forEach(e => {
        if(adjList[e.from]) adjList[e.from].push(e.to);
        if(adjList[e.to]) adjList[e.to].push(e.from); // assuming undirected
    });

    const steps = [];
    const visited = new Set();
    const queue = [];

    steps.push({
        nodes, edges,
        visited: Array.from(visited),
        queue: [...queue],
        currentNode: null,
        description: `Initialized BFS. Start node is ${startNode}.`,
    });

    queue.push(startNode);
    visited.add(startNode);

    steps.push({
        nodes, edges,
        visited: Array.from(visited),
        queue: [...queue],
        currentNode: null,
        description: `Enqueued start node ${startNode} and marked as visited.`,
    });

    while (queue.length > 0) {
        const current = queue.shift();
        
        steps.push({
            nodes, edges,
            visited: Array.from(visited),
            queue: [...queue],
            currentNode: current,
            description: `Dequeued ${current}. Exploring its neighbors.`,
        });

        const neighbors = adjList[current] || [];
        for (const neighbor of neighbors) {
            steps.push({
                nodes, edges,
                visited: Array.from(visited),
                queue: [...queue],
                currentNode: current,
                highlightEdge: {from: current, to: neighbor},
                description: `Checking neighbor ${neighbor} of ${current}.`,
            });

            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
                steps.push({
                    nodes, edges,
                    visited: Array.from(visited),
                    queue: [...queue],
                    currentNode: current,
                    description: `Neighbor ${neighbor} not visited. Marked visited and enqueued.`,
                });
            } else {
                steps.push({
                    nodes, edges,
                    visited: Array.from(visited),
                    queue: [...queue],
                    currentNode: current,
                    description: `Neighbor ${neighbor} already visited. Skipping.`,
                });
            }
        }
    }

    steps.push({
        nodes, edges,
        visited: Array.from(visited),
        queue: [...queue],
        currentNode: null,
        description: "Queue is empty. BFS traversal complete.",
    });

    return { result: "BFS Complete", steps };
}

/**
 * Longest Common Subsequence (DP step by step)
 * 
 * @param {string} str1 
 * @param {string} str2 
 */
export function dpLCS(str1, str2) {
    const steps = [];
    const n = str1.length;
    const m = str2.length;
    
    // Initialize DP table filled with 0s
    let dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

    steps.push({
        str1, str2,
        dp: JSON.parse(JSON.stringify(dp)),
        i: null, j: null,
        description: `Initialized ${n+1}x${m+1} DP table with zeros for LCS calculation.`,
    });

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            
            steps.push({
                str1, str2,
                dp: JSON.parse(JSON.stringify(dp)),
                i, j,
                description: `Comparing str1[${i-1}]='${str1[i-1]}' with str2[${j-1}]='${str2[j-1]}'`,
            });

            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                steps.push({
                    str1, str2,
                    dp: JSON.parse(JSON.stringify(dp)),
                    i, j,
                    match: true,
                    description: `Characters match! dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}`,
                });
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                steps.push({
                    str1, str2,
                    dp: JSON.parse(JSON.stringify(dp)),
                    i, j,
                    match: false,
                    description: `No match. dp[${i}][${j}] = max(dp[${i-1}][${j}], dp[${i}][${j-1}]) = ${dp[i][j]}`,
                });
            }
        }
    }

    steps.push({
        str1, str2,
        dp: JSON.parse(JSON.stringify(dp)),
        i: null, j: null,
        description: `DP table complete. The length of the Longest Common Subsequence is ${dp[n][m]}.`,
    });

    return { result: dp[n][m], steps };
}
