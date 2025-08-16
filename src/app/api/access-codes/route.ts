import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { make6 } from "@/lib/access-codes";

// Generate multiple unique access codes
async function generateUniqueCodes(count: number): Promise<string[]> {
  const codes: string[] = [];
  const maxAttempts = 10;

  while (codes.length < count) {
    let attempts = 0;
    let code: string;

    do {
      code = make6();
      attempts++;

      // Check if code already exists in database or in our current batch
      const { data, error } = await supabaseAdmin
        .from("access_codes")
        .select("code")
        .eq("code", code)
        .single();

      if (error && error.code === "PGRST116" && !codes.includes(code)) {
        // Code doesn't exist in database and not in our current batch
        codes.push(code);
        break;
      }

      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate unique codes after maximum attempts");
      }
    } while (true);
  }

  return codes;
}

// POST - Generate new access codes
export async function POST(request: NextRequest) {
  try {
    const { count = 1 } = await request.json();

    // Validate count
    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: "Count must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Generate unique codes
    const codes = await generateUniqueCodes(count);

    // Prepare data for bulk insertion
    const accessCodesData = codes.map(code => ({
      code,
      max_redemptions: 1,
      times_redeemed: 0,
      disabled: false,
    }));

    // Insert the access codes
    const { data, error } = await supabaseAdmin
      .from("access_codes")
      .insert(accessCodesData)
      .select();

    if (error) {
      console.error("Error creating access codes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      access_codes: data,
      count: data.length,
    });
  } catch (error) {
    console.error("Access code generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
