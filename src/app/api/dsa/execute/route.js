/**
 * POST /api/dsa/execute
 * -----------------------
 * Execute DSA algorithms with step-by-step visualization data.
 * Supports: bubbleSort, mergeSort, stack, queue
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import {
    bubbleSort,
    mergeSort,
    simulateStack,
    simulateQueue,
} from "@/services/dsaService";

async function handler(request) {
    try {
        const body = await request.json();
        const { algorithm, data, operations } = body;

        if (!algorithm) {
            return errorResponse("Algorithm type is required.", 400);
        }

        let result;

        switch (algorithm) {
            case "bubbleSort": {
                if (!Array.isArray(data) || data.length === 0) {
                    return errorResponse("An array of numbers is required for sorting.", 400);
                }
                result = bubbleSort(data.map(Number));
                break;
            }

            case "mergeSort": {
                if (!Array.isArray(data) || data.length === 0) {
                    return errorResponse("An array of numbers is required for sorting.", 400);
                }
                result = mergeSort(data.map(Number));
                break;
            }

            case "stack": {
                if (!Array.isArray(operations) || operations.length === 0) {
                    return errorResponse("An array of stack operations is required.", 400);
                }
                result = simulateStack(operations);
                break;
            }

            case "queue": {
                if (!Array.isArray(operations) || operations.length === 0) {
                    return errorResponse("An array of queue operations is required.", 400);
                }
                result = simulateQueue(operations);
                break;
            }

            default:
                return errorResponse(
                    `Unknown algorithm: ${algorithm}. Supported: bubbleSort, mergeSort, stack, queue`,
                    400
                );
        }

        return successResponse({ algorithm, result });
    } catch (error) {
        console.error("DSA execution error:", error);
        return errorResponse("Failed to execute algorithm.", 500);
    }
}

export const POST = withAuth(handler);
