import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST - Redeem access code
export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Access code is required" },
        { status: 400 }
      );
    }

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

    // Find the access code
    const { data: accessCode, error: fetchError } = await supabaseAdmin
      .from("access_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Invalid access code" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // Check if code is disabled
    if (accessCode.disabled) {
      return NextResponse.json(
        { error: "Access code is disabled" },
        { status: 400 }
      );
    }

    // Check if code has reached max redemptions
    if (accessCode.times_redeemed >= accessCode.max_redemptions) {
      return NextResponse.json(
        { error: "Access code has reached maximum redemptions" },
        { status: 400 }
      );
    }

    // Update the access code with redemption info
    const { data: updatedCode, error: updateError } = await supabaseAdmin
      .from("access_codes")
      .update({
        times_redeemed: accessCode.times_redeemed + 1,
        redeemed_email: email,
        redeemed_at: new Date().toISOString(),
      })
      .eq("id", accessCode.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Access code redeemed successfully",
      access_code: updatedCode,
    });
  } catch (error) {
    console.error("Access code redemption error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
