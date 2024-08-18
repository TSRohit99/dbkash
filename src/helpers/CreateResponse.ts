import { ApiResponse } from "@/types/ApiResponse";

export function createResponse(responseData: ApiResponse, status: number): Response {
    return new Response(JSON.stringify(responseData), {
        status: status,
        headers: { 'Content-Type': 'application/json' }
    });
}