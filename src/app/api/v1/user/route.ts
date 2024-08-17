import dbConnect from "@/lib/db/dbConnect";
import userModel from "@/app/models/user";
import { ApiResponse } from "@/types/ApiResponse";


export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const address = url.searchParams.get("address");

    await dbConnect();

    if (!address) {
        return createResponse({
            success: false,
            message: "No address provided"
        }, 400);
    }

    try {
        console.log("Connected to database, attempting to fetch data...");
        const user = await userModel.findOne({ address });
        console.log("Data fetched...");

        if (!user) {
            console.log("No data found in the collection.");
            return createResponse({
                success: false,
                message: "User not found"
            }, 404);
        }

        return createResponse({
            success: true,
            data: user
        }, 200);

    } catch (error) {
        console.error('Error fetching user data:', error);
        return createResponse({
            success: false,
            message: "Internal server error"
        }, 500);
    }
}

function createResponse(responseData: ApiResponse, status: number): Response {
    return new Response(JSON.stringify(responseData), {
        status: status,
        headers: { 'Content-Type': 'application/json' }
    });
}