import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  })
}

type RegistrationRow = {
  id: string
  full_name: string
  email: string
  roll_number: string
  branch: string
  year: string
  phone_number: string
  registration_type: 'vocalist' | 'instrumentalist'
  languages?: string
  backing_track_links?: string
  instruments?: string[]
  needs_instrument?: boolean
  remarks?: string
  submitted_at: string
}

const VOCALIST_HEADERS = [
  'Full Name', 'Email', 'Roll Number', 'Branch', 'Year',
  'Phone Number', 'Languages', 'Backing Track Links', 'Remarks', 'Submitted At'
]

const INSTRUMENTALIST_HEADERS = [
  'Full Name', 'Email', 'Roll Number', 'Branch', 'Year',
  'Phone Number', 'Instruments', 'Needs Instrument From Club', 'Remarks', 'Submitted At'
]

async function ensureHeaders(
  sheets: any,
  spreadsheetId: string,
  headers: string[]
) {
  // Read the first row to check if headers already exist
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:Z1',
  })

  const firstRow = res.data.values?.[0]
  if (!firstRow || firstRow.length === 0) {
    // Sheet is empty — write headers first
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    })
  }
}

export async function appendToSheet(data: RegistrationRow) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const isVocalist = data.registration_type === 'vocalist'
  const spreadsheetId = isVocalist
    ? process.env.GOOGLE_SHEET_ID_VOCALISTS!
    : process.env.GOOGLE_SHEET_ID_INSTRUMENTALISTS!
  const headers = isVocalist ? VOCALIST_HEADERS : INSTRUMENTALIST_HEADERS

  // Auto-create headers if the sheet is empty
  await ensureHeaders(sheets, spreadsheetId, headers)

  const row = isVocalist
    ? [
        data.full_name,
        data.email ?? '',
        data.roll_number,
        data.branch,
        data.year,
        data.phone_number,
        data.languages ?? '',
        data.backing_track_links ?? '',
        data.remarks ?? '',
        new Date(data.submitted_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ]
    : [
        data.full_name,
        data.email ?? '',
        data.roll_number,
        data.branch,
        data.year,
        data.phone_number,
        (data.instruments ?? []).join(', '),
        data.needs_instrument ? 'Yes' : 'No',
        data.remarks ?? '',
        new Date(data.submitted_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ]

  // IMPORTANT: range must be a single column "A:A" not "A:Z"
  // This tells Sheets to find the next empty ROW starting at column A
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:A',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row],
    },
  })

  // Mark as synced in Supabase
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await supabase
      .from('audition_registrations')
      .update({ synced_to_sheet: true })
      .eq('id', data.id)
  } catch (_) {}
}