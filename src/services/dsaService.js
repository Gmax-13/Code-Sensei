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
