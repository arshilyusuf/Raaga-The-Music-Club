'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
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

  // 1. Check if a member with the same roll number already exists in either table
  if (reg.roll_number) {
    // Check team_members
    const { data: existingTeamMember, error: teamCheckError } = await supabase
      .from('team_members')
      .select('id')
      .eq('roll_number', reg.roll_number)
      .maybeSingle()

    if (teamCheckError) {
      console.error('Team members validation query failed:', teamCheckError.message)
      throw new Error(`Validation error: ${teamCheckError.message}`)
    }

    if (existingTeamMember) {
      throw new Error(`A member with Roll Number ${reg.roll_number} is already in the current team.`)
    }

    // Check club_members
    const { data: existingClubMember, error: clubCheckError } = await supabase
      .from('club_members')
      .select('id')
      .eq('roll_number', reg.roll_number)
      .maybeSingle()

    if (clubCheckError) {
      console.error('Club members validation query failed:', clubCheckError.message)
      throw new Error(`Validation error: ${clubCheckError.message}`)
    }

    if (existingClubMember) {
      throw new Error(`A member with Roll Number ${reg.roll_number} is already in the club roster.`)
    }
  }

  // 2. Map values and check formats for Postgres structure compliance
  const integerYear = parseYearToInteger(reg.year)
  
  const domain = 'musician'
  const role = reg.registration_type === 'vocalist' 
    ? 'Vocalist' 
    : `Instrumentalist`

  // 3. Perform insertion query
  const { data, error } = await supabase
    .from('team_members')
    .insert([
      {
        name: reg.full_name,
        email: reg.email,
        phone: reg.phone_number,
        roll_number: reg.roll_number,
        year: integerYear,
        branch: reg.branch,
        domain: domain,
        role: role,
        is_active: true
      }
    ])
    .select()

  if (error) {
    console.error('Database insertion failed:', error.message)
    throw new Error(`Failed to add member: ${error.message}`)
  }

  revalidatePath('/admin/auditions')
  
  return { success: true, data }
}