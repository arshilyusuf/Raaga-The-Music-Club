import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { appendToSheet } from '@/lib/googleSheets'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configure the Nodemailer Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { registration_type, roll_number, email, full_name } = body

    if (!['vocalist', 'instrumentalist'].includes(registration_type)) {
      return NextResponse.json({ error: 'Invalid registration type' }, { status: 400 })
    }

    if (!roll_number) {
      return NextResponse.json({ error: 'Roll number is required' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // --- 1. Check for Duplicate within the same category ---
    const { data: existingRegistration, error: checkError } = await supabase
      .from('audition_registrations')
      .select('id')
      .eq('roll_number', roll_number.trim())
      .eq('registration_type', registration_type)
      .maybeSingle()

    if (checkError) {
      console.error('Database validation error:', checkError)
      return NextResponse.json({ error: 'Failed to validate registration info' }, { status: 500 })
    }

    if (existingRegistration) {
      return NextResponse.json(
        { error: `You have already submitted an audition registration for ${registration_type}` },
        { status: 409 }
      )
    }

    // --- 2. Insert into Supabase ---
    const { data, error } = await supabase
      .from('audition_registrations')
      .insert([
        {
          full_name:           body.full_name,
          email:               body.email,
          roll_number:         body.roll_number.trim(),
          branch:              body.branch,
          year:                body.year,
          phone_number:        body.phone_number,
          remarks:             body.remarks ?? null,
          registration_type:   body.registration_type,

          // Vocalist fields
          languages:           body.languages ?? null,
          backing_track_links: body.backing_track_links ?? null,

          // Instrumentalist fields
          instruments:         body.instruments ?? null,
          needs_instrument:    body.needs_instrument ?? false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // --- 3. Sync to Google Sheets (non-blocking) ---
    appendToSheet(data).catch((err) =>
      console.error('Google Sheets sync failed (non-fatal):', err)
    )

    // --- 4. Send Confirmation Email via Gmail (non-blocking) ---
    const auditionDate = "October 15, 2026, at 10:00 AM"

    const textFallback = `Hello ${full_name},\n\nYour registration for the upcoming Raaga: The Music Club auditions has been received.\n\nRegistration Summary:\n- Category: ${registration_type.toUpperCase()}\n- Roll Number: ${data.roll_number}\n- Branch / Year: ${data.branch} (Year ${data.year})\n\nAudition Schedule:\nPlease report directly to the main auditorium on: ${auditionDate}\n\nIf you have any questions or need to reschedule, reply to this email or reach our support team at 98357828123 or 7808361946.\n\nBest regards,\nRaaga Auditions Coordination Team`

    transporter.sendMail({
      from: `"Raaga The Music Club"<${process.env.GMAIL_USER}>`,
      to: email,
      replyTo: process.env.GMAIL_USER, 
      subject: `Audition Registration Confirmation - ${full_name}`,
      text: textFallback,
      headers: {
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        'Precedence': 'bulk'
      },
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
            ${data.instruments ? `<li><strong>Instruments:</strong> ${data.instruments}</li>` : ''}
            ${data.languages ? `<li><strong>Languages:</strong> ${data.languages}</li>` : ''}
          </ul>

          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 15px 0;" />

          <p><strong>Audition Schedule:</strong><br />
          Please report directly to the main auditorium on: <strong>${auditionDate}</strong></p>

          <p>If you have any questions, reply to this email or contact us at 98357828123 or 7808361946.</p>
          
          <p>Best regards,<br />Raaga Auditions Coordination Team</p>
        </div>
      `,
    }).catch((err) =>
      console.error('Gmail dispatch failed (non-fatal):', err)
    )

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })

  } catch (err) {
    console.error('Registration route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}