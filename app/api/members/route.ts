import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain')   // optional filter

  let query = supabase
    .from('team_members')
    .select('id, name, year, branch, domain, role, instagram, photo_url')
    .eq('is_active', true)
    .order('year', { ascending: true })
    .order('name', { ascending: true })

  if (domain) {
    query = query.eq('domain', domain)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/members — admin only, add a new member
export async function POST(req: NextRequest) {
  // In production, validate the session here using createServerClient
  const body = await req.json()

  const { data, error } = await supabase
    .from('team_members')
    .insert([body])
    .select()
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
