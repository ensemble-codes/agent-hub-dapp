import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST - Request access
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Insert the access request
    const { data, error } = await supabaseAdmin
      .from("requested_access")
      .insert({ email })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "Access request already submitted",
        });
      }
      
      console.error("Error creating access request:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Access request submitted successfully",
      request: data,
    });
  } catch (error) {
    console.error("Access request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
