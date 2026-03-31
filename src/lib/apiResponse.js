/**
 * API Response Helpers
 * ---------------------
 * Standardized response format for all API endpoints.
 * Ensures consistent JSON structure across the application.
 */

import { NextResponse } from "next/server";

/**
 * Send a success response.
 * @param {*} data - Response payload
 * @param {number} status - HTTP status code (default 200)
 * @param {Object} headers - Additional headers to set
 * @returns {NextResponse}
 */
export function successResponse(data, status = 200, headers = {}) {
    const response = NextResponse.json(
        { success: true, data },
        { status }
    );

    // Apply any additional headers (e.g., Set-Cookie)
    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

/**
 * Send an error response.
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default 400)
 * @returns {NextResponse}
 */
export function errorResponse(message, status = 400) {
    return NextResponse.json(
        { success: false, error: message },
        { status }
    );
}
