import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { appendToSheet } from "@/lib/googleSheets";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const RESTRICTED_EMAILS = [
  "faculty@nitrr.ac.in",
  "deans@nitrr.ac.in",
  "users@nitrr.ac.in",
  "employees@nitrr.ac.in",
  "all@nitrr.ac.in"
];
const transporter = nodemailer.createTransport({
  // service: "gmail",
  // auth: {
  //   type: "OAuth2",
  //   user: process.env.GMAIL_USER,
  //   clientId: process.env.OAUTH_CLIENT_ID,
  //   clientSecret: process.env.OAUTH_CLIENT_SECRET,
  //   refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  // },
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registration_type, roll_number, full_name } = body;
    const email = body.email?.toLowerCase().trim();
    
    if (email && RESTRICTED_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: "Registration with this email address is not permitted." },
        { status: 403 },
      );
    }
    // --- 1. Validation Rules ---
    if (!["vocalist", "instrumentalist"].includes(registration_type)) {
      return NextResponse.json(
        { error: "Invalid registration type" },
        { status: 400 },
      );
    }
    if (!roll_number) {
      return NextResponse.json(
        { error: "Roll number is required" },
        { status: 400 },
      );
    }
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 },
      );
    }

    // --- 2. Insert into Supabase ---
    const { data, error } = await supabase
      .from("audition_registrations")
      .insert([
        {
          full_name: body.full_name,
          email: body.email,
          roll_number: body.roll_number.trim(),
          branch: body.branch,
          year: body.year,
          phone_number: body.phone_number,
          remarks: body.remarks ?? null,
          registration_type: body.registration_type,
          languages: body.languages ?? null,
          backing_track_links: body.backing_track_links ?? null,
          instruments: body.instruments ?? null,
          needs_instrument: body.needs_instrument ?? false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error: `You have already submitted an audition registration for ${body.registration_type}`,
          },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // --- 3. Send Email & Sync Data ---
    const auditionDate = "October 15, 2026, at 10:00 AM";

    const textFallback = `Hello ${full_name},\n\nYour registration for the upcoming Raaga: The Music Club auditions has been received.\n\nRegistration Summary:\n- Category: ${registration_type.toUpperCase()}\n- Roll Number: ${data.roll_number}\n- Branch / Year: ${data.branch} (Year ${data.year})\n\nAudition Schedule:\nPlease report directly to the main auditorium on: ${auditionDate}\n\nIf you have any questions or need to reschedule, reply to this email or reach our support team at 98357828123 or 7808361946.\n\nBest regards,\nRaaga Auditions Coordination Team`;

    console.log(`Initiating background tasks for ${email}...`);

    // CRITICAL FIX: Await the Promise.allSettled so the serverless function does not exit prematurely.
    const results = await Promise.allSettled([
      appendToSheet(data),
      transporter.sendMail({
        from: `"Raaga The Music Club" <${process.env.GMAIL_USER}>`,
        replyTo: process.env.GMAIL_USER, // Added Reply-To header to improve deliverability
        to: email,
        subject: `Audition Registration Confirmation - ${full_name}`,
        text: textFallback,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 550px; color: #222222;">
            <p>Hello <strong>${full_name}</strong>,</p>
            <p>Your registration for the upcoming <strong>Raaga: The Music Club</strong> auditions has been received.</p>
            
            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 15px 0;" />
            
            <p><strong>Registration Summary:</strong></p>
            <ul>
              <li><strong>Category:</strong> ${registration_type.toUpperCase()}</li>
              <li><strong>Roll Number:</strong> ${data.roll_number}</li>
              <li><strong>Branch / Year:</strong> ${data.branch} (Year ${data.year})</li>
              ${data.instruments ? `<li><strong>Instruments:</strong> ${data.instruments}</li>` : ""}
              ${data.languages ? `<li><strong>Languages:</strong> ${data.languages}</li>` : ""}
            </ul>

            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 15px 0;" />

            <p><strong>Audition Schedule:</strong><br />
            Please report directly to the main auditorium on: <strong>${auditionDate}</strong></p>

            <p>If you have any questions, reply to this email or contact us at 98357828123 or 7808361946.</p>
            
            <p>Best regards,<br />Raaga Auditions Coordination Team</p>
          </div>
        `,
      }),
    ]);

    // --- 4. Process Results and Log ---
    const [sheetResult, emailResult] = results;

    if (sheetResult.status === "rejected") {
      console.error("❌ Google Sheets sync failed:", sheetResult.reason);
    } else {
      console.log("✅ Google Sheets sync successful.");
    }

    if (emailResult.status === "rejected") {
      console.error("❌ Email dispatch failed:", emailResult.reason);
    } else {
      // Nodemailer returns an object containing details about the sent email on success
      console.log("✅ Email sent successfully.");
      console.log("   - Message ID:", emailResult.value.messageId);
      console.log("   - Accepted by:", emailResult.value.accepted);
      if (emailResult.value.rejected.length > 0) {
        console.warn("   ⚠️ Rejected by:", emailResult.value.rejected);
      }
    }

    // Only return the response after the promises have fully resolved
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error("❌ Registration route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
