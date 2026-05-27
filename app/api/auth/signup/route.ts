import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, firmName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Create the user with metadata
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          firm_name: firmName || null,
        },
      },
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    if (!authData.user) {
      console.error("No user returned from signup");
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 },
      );
    }

    console.log("User created successfully:", authData.user.id);

    // Return success with user data
    return NextResponse.json(
      {
        success: true,
        user: authData.user,
        session: authData.session,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
