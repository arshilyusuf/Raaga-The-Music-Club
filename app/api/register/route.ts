import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { appendToSheet } from "@/lib/googleSheets";
import { Resend } from "resend";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const maxDuration = 10;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const resend = new Resend(process.env.RESEND_API_KEY);

const RESTRICTED_EMAILS = [
  "faculty@nitrr.ac.in",
  "deans@nitrr.ac.in",
  "users@nitrr.ac.in",
  "employees@nitrr.ac.in",
  "all@nitrr.ac.in",
];

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const host = request.headers.get("host");
    if (!host) {
      return false;
    }

    return originUrl.host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        { error: "Origin not allowed." },
        { status: 403 },
      );
    }

    const rateLimit = enforceRateLimit(req, {
      key: "registration",
      limit: 3,
      windowMs: 60_000,
      message:
        "Too many registration attempts from this IP. Please try again later.",
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > 32_768) {
      return NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 },
      );
    }

    const body = await req.json();
    const registrationType = String(body.registration_type ?? "")
      .toLowerCase()
      .trim();
    const rollNumber = String(body.roll_number ?? "").trim();
    const fullName = String(body.full_name ?? "").trim();
    const email = String(body.email ?? "")
      .toLowerCase()
      .trim();

    if (!fullName || fullName.length > 120) {
      return NextResponse.json(
        { error: "Full name is required and must be 120 characters or fewer." },
        { status: 400 },
      );
    }

    if (email && RESTRICTED_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: "Registration with this email address is not permitted." },
        { status: 403 },
      );
    }

    // --- 1. Validation Rules ---
    if (!["vocalist", "instrumentalist"].includes(registrationType)) {
      return NextResponse.json(
        { error: "Invalid registration type" },
        { status: 400 },
      );
    }
    if (!rollNumber) {
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
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email address is invalid." },
        { status: 400 },
      );
    }

    // --- 2. Insert into Supabase ---
    const { data, error } = await supabase
      .from("audition_registrations")
      .insert([
        {
          full_name: fullName,
          email,
          roll_number: rollNumber,
          branch: body.branch,
          year: body.year,
          phone_number: body.phone_number,
          remarks: body.remarks ?? null,
          registration_type: registrationType,
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
    const auditionDate = "September 5th/6th, at 10:30 AM";
    const safeName = escapeHtml(fullName);
    const safeBranch = escapeHtml(data.branch);
    const safeYear = escapeHtml(data.year);
    const safeRollNumber = escapeHtml(data.roll_number);
    const safeRegistrationType = escapeHtml(registrationType.toUpperCase());
    const safeInstruments = escapeHtml(data.instruments);
    const safeLanguages = escapeHtml(data.languages);
    const safeAuditionDate = escapeHtml(auditionDate);

    const textFallback = `Hello ${fullName},\n\nYour registration for the upcoming Raaga: The Music Club auditions has been received.\n\nRegistration Summary:\n- Category: ${registrationType.toUpperCase()}\n- Roll Number: ${data.roll_number}\n- Branch / Year: ${data.branch} (Year ${data.year})\n\nAudition Schedule:\nPlease report directly to the yoga hall on: ${auditionDate}\n\nIf you have any questions or need to reschedule, reply to this email or reach our support team at 9302689470 or 8349816667.\n\nBest regards,\nRaaga Auditions Coordination Team`;

    console.log(`Initiating background tasks for ${email}...`);

    const results = await Promise.allSettled([
      appendToSheet(data),
      resend.emails.send({
        from: "Raaga The Music Club <auditions@raagathemusicclub.in>",
        replyTo: "support@raagathemusicclub.in",
        to: email,
        subject: `Audition Registration Confirmation - ${fullName}`,
        text: textFallback,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 550px; color: #222222;">
            <p>Hello <strong>${safeName}</strong>,</p>
            <p>Your registration for the upcoming <strong>Raaga: The Music Club</strong> auditions has been received.</p>
            
            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 15px 0;" />
            
            <p><strong>Registration Summary:</strong></p>
            <ul>
              <li><strong>Category:</strong> ${safeRegistrationType}</li>
              <li><strong>Roll Number:</strong> ${safeRollNumber}</li>
              <li><strong>Branch / Year:</strong> ${safeBranch} (Year ${safeYear})</li>
              ${data.instruments ? `<li><strong>Instruments:</strong> ${safeInstruments}</li>` : ""}
              ${data.languages ? `<li><strong>Languages:</strong> ${safeLanguages}</li>` : ""}
            </ul>

            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 15px 0;" />

            <p><strong>Audition Schedule:</strong><br />
            Please report directly to the Yoga Hall on: <strong>${safeAuditionDate}</strong></p>

            <p>If you have any questions, contact us at 8349816667 - Debanjan or 9302689470 - Himanshu.</p>
            
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
      console.error("❌ Email dispatch request failed:", emailResult.reason);
    } else {
      // Resend specific error handling structure
      if (emailResult.value.error) {
        console.error(
          "❌ Resend API returned an error:",
          emailResult.value.error,
        );
      } else {
        console.log("✅ Email sent successfully.");
        console.log("   - Message ID:", emailResult.value.data?.id);
      }
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error("❌ Registration route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
