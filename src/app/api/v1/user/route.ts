import dbConnect from "@/lib/db/dbConnect";
import userModel from "@/app/models/user";
import { createResponse } from "@/helpers/CreateResponse";
import { headers } from "next/headers";

export async function GET(): Promise<Response> {

  const address = headers().get("x-user-address");

  await dbConnect();

  if (!address) {
    return createResponse(
      {
        success: false,
        message: "No address provided",
      },
      400
    );
  }

  try {
    console.log("Connected to database, attempting to fetch data...");
    const user = await userModel.findOne({ address });
    console.log("Data fetched...");

    if (!user) {
      console.log("No data found in the collection.");
      return createResponse(
        {
          success: false,
          message: "User not found",
        },
        404
      );
    }

    return createResponse(
      {
        success: true,
        data: user,
      },
      200
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return createResponse(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  }
}
