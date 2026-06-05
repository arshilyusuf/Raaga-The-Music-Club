'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { enforceAdminCheck } from '@/lib/supabase/auth-guard'
import { revalidatePath } from 'next/cache'

type AddToTeamInput = {
  full_name: string
  email: string
  phone_number: string
  roll_number: string
  year: string
  branch: string
  registration_type: 'vocalist' | 'instrumentalist'
  instruments?: string[]
}

const parseYearToInteger = (yearStr: string): number => {
  const match = yearStr.match(/\d+/)
  return match ? parseInt(match[0], 10) : 1
}

export async function addRegistrationToTeam(reg: AddToTeamInput) {
  const supabase = await createServerSupabaseClient()

  // ─── ENFORCE SERVER-SIDE SECURITY GUARD FOR THE ACTION ───────────────────
  const guard = await enforceAdminCheck(supabase)
  if (!guard.authorized) {
    throw new Error("Unauthorized Access: Administrative privileges required.")
  }

  const integerYear = parseYearToInteger(reg.year)
  
  // 1. Generate the standard active academic year string (e.g., "2026-27")
  const currentCalendarYear = new Date().getFullYear()
  const shortNextYear = String(currentCalendarYear + 1).slice(-2)
  const activeAcademicYearStr = `${currentCalendarYear}-${shortNextYear}`

  // 2. Map payload domains and roles out of incoming configuration variants
  const domain = 'musician'
  const role = reg.registration_type === 'vocalist' 
    ? 'Vocalist' 
    : 'Instrumentalist' 

  let memberId: string | null = null

  // 3. Check if the profile already exists in the permanent team_members table
  if (reg.roll_number) {
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('team_members')
      .select('id')
      .eq('roll_number', reg.roll_number)
      .maybeSingle()

    if (profileCheckError) {
      console.error('Profile validation query failed:', profileCheckError.message)
      throw new Error(`Validation error: ${profileCheckError.message}`)
    }

    if (existingProfile) {
      memberId = existingProfile.id

      // Check if they are already registered as active in THIS specific academic year
      const { data: existingMembership, error: membershipCheckError } = await supabase
        .from('club_memberships')
        .select('id')
        .eq('member_id', memberId)
        .eq('academic_year', activeAcademicYearStr)
        .maybeSingle()

      if (membershipCheckError) {
        throw new Error(`Membership validation error: ${membershipCheckError.message}`)
      }

      if (existingMembership) {
        throw new Error(`This member is already registered as active for the ${activeAcademicYearStr} academic year.`)
      }

      // If they exist but aren't active this year, set older historical tracking items to inactive
      await supabase
        .from('club_memberships')
        .update({ is_active: false })
        .eq('member_id', memberId)
    }
  }

  // 4. Scenario A: If no profile exists, create their primary record first
  if (!memberId) {
    const { data: newProfile, error: insertionError } = await supabase
      .from('team_members')
      .insert([
        {
          name: reg.full_name,
          email: reg.email,
          phone: reg.phone_number,
          roll_number: reg.roll_number,
          branch: reg.branch,
        }
      ])
      .select('id')
      .single()

    if (insertionError) {
      console.error('Profile baseline insertion failed:', insertionError.message)
      throw new Error(`Failed to create member profile: ${insertionError.message}`)
    }
    
    memberId = newProfile.id
  }

  // 5. Scenario B: Create their active entry in the club memberships log
  const { data: membershipData, error: membershipError } = await supabase
    .from('club_memberships')
    .insert([
      {
        member_id: memberId,
        academic_year: activeAcademicYearStr,
        year_of_study: integerYear,
        domain: domain,
        role: role,
        is_active: true
      }
    ])
    .select()
    .single()

  if (membershipError) {
    console.error('Membership assignment entry failed:', membershipError.message)
    throw new Error(`Failed to assign member to current team: ${membershipError.message}`)
  }

  // 6. Force path revalidations so layouts fetch fresh rows immediately
  revalidatePath('/admin/auditions')
  revalidatePath('/admin/dashboard')
  
  return { success: true, data: membershipData }
}