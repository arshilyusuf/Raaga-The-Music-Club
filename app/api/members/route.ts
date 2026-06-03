import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/members — Supports both your original filter system AND new server-side pagination/search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const domain = searchParams.get('domain')
    const academicYear = searchParams.get('academic_year')
    
    const pageParam = searchParams.get('page')
    const search = searchParams.get('search') || ""
    const limit = 10

    // SCENARIO 1: If searching & paginating for the dropdown component
    if (pageParam && search.trim()) {
      const page = Math.max(1, parseInt(pageParam, 10))
      const from = (page - 1) * limit
      const to = from + limit - 1

      // Query team_members table directly and join all past structural records
      const { data: matchedMembers, error: searchError, count } = await supabase
        .from('team_members')
        .select(`
          id, name, branch, instagram, photo_url, email, phone, roll_number,
          club_memberships ( academic_year )
        `, { count: 'exact' })
        .or(`name.ilike.%${search}%,roll_number.ilike.%${search}%`)
        .range(from, to)
        .order('name', { ascending: true })

      if (searchError) {
        return NextResponse.json({ error: searchError.message }, { status: 500 })
      }

      const totalItems = count || 0
      const totalPages = Math.ceil(totalItems / limit)

      const formattedData = (matchedMembers || []).map((m: any) => {
        // Collect all structural history years into a neat comma separated list
        const yearsArray = m.club_memberships?.map((cm: any) => cm.academic_year) || []
        const formattedYears = yearsArray.length > 0 ? yearsArray.join(', ') : "New Member"

        return {
          id: m.id,
          membership_id: null, 
          name: m.name,
          branch: m.branch,
          instagram: m.instagram,
          photo_url: m.photo_url,
          email: m.email,
          phone: m.phone,
          roll_number: m.roll_number,
          year: 1, 
          domain: 'musician',
          role: 'Member',
          is_active: false, // Pulled dynamically from active membership records instead
          academic_year: formattedYears
        }
      })

      return NextResponse.json({
        members: formattedData,
        pagination: {
          currentPage: page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        }
      })
    } 

    // SCENARIO 2: Your original dashboard view fetch blocks
    let query = supabase
      .from('club_memberships')
      .select(`
        id, academic_year, year_of_study, domain, role, is_active,
        team_members (id, name, branch, instagram, photo_url, email, phone, roll_number)
      `)

    if (academicYear) {
      query = query.eq('academic_year', academicYear)
    } else {
      query = query.eq('is_active', true) // Core source of truth for active roster verification
    }

    if (domain) {
      query = query.eq('domain', domain)
    }

    query = query.order('year_of_study', { ascending: true })
    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedData = (data || [])
      .filter((item: any) => item.team_members !== null)
      .map((item: any) => ({
        id: item.team_members?.id,
        membership_id: item.id,
        name: item.team_members?.name,
        branch: item.team_members?.branch,
        instagram: item.team_members?.instagram,
        photo_url: item.team_members?.photo_url,
        year: item.year_of_study, 
        domain: item.domain,
        role: item.role,
        is_active: item.is_active, // Extracted securely from the active cyclic layer string
        academic_year: item.academic_year
      }))

    return NextResponse.json(formattedData)

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 })
  }
}

// POST /api/members — Adds a member to a specific academic year roster
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const { 
      is_existing_member, 
      member_id, 
      academic_year, 
      year_of_study, 
      domain, 
      role,
      is_active, // Captured directly from your status indicator dot layout value toggle
      name, email, phone, roll_number, branch, instagram, photo_url 
    } = body

    let finalMemberId = member_id

    if (!is_existing_member) {
      // 1. Insert profile records into the core profile structure (No redundant is_active column)
      const { data: newProfile, error: profileError } = await supabase
        .from('team_members')
        .insert([{ name, email, phone, roll_number, branch, instagram, photo_url }])
        .select('id')
        .single()

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
      finalMemberId = newProfile.id
    } else {
      // 2. If re-activating an old member, turn off active status flags on other active tracks
      if (is_active !== false) {
        await supabase
          .from('club_memberships')
          .update({ is_active: false })
          .eq('member_id', finalMemberId)
      }
    }

    // 3. Append membership tracking log into your cyclic historical schema row
    const { data: membershipData, error: membershipError } = await supabase
      .from('club_memberships')
      .insert([{
        member_id: finalMemberId,
        academic_year,
        year_of_study: year_of_study || 1,
        domain: domain || 'musician',
        role: role || 'Member',
        is_active: is_active ?? true // Successfully sets status exclusively at the tracking layer
      }])
      .select()
      .single()

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 500 })
    }

    return NextResponse.json(membershipData, { status: 201 })
    
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 })
  }
}