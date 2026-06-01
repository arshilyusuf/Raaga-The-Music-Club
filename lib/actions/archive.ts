'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function archiveAuditionData() {
  const supabase = await createServerSupabaseClient()

  // 1. Fetch all current registrations
  const { data: registrations, error: fetchError } = await supabase
    .from('audition_registrations')
    .select('*')

  if (fetchError) {
    throw new Error(`Failed to read current records: ${fetchError.message}`)
  }

  if (!registrations || registrations.length === 0) {
    throw new Error('No current audition registrations to archive.')
  }

  // 2. Map records to match audition_archive schema expectations
  const archivedRows = registrations.map((reg) => {
    // Extract the calendar year from the entry's original submission timestamp
    const registrationYear = reg.submitted_at 
      ? new Date(reg.submitted_at).getFullYear().toString()
      : new Date().getFullYear().toString();

    return {
      academic_year_id: null, // Left as null since label is driven by registration date
      academic_year_label: registrationYear, // e.g., "2025" or "2026"
      full_name: reg.full_name,
      email: reg.email,
      roll_number: reg.roll_number,
      branch: reg.branch,
      year: reg.year,
      phone_number: reg.phone_number,
      registration_type: reg.registration_type,
      languages: reg.languages,
      backing_track_links: reg.backing_track_links,
      instruments: reg.instruments,
      needs_instrument: reg.needs_instrument,
      remarks: reg.remarks,
      submitted_at: reg.submitted_at,
    }
  })

  // 3. Batch insert into the archive table
  const { error: insertError } = await supabase
    .from('audition_archive')
    .insert(archivedRows)

  if (insertError) {
    throw new Error(`Archiving snapshot failed: ${insertError.message}`)
  }

  // 4. Purge the live registrations table
  const registrationIds = registrations.map(reg => reg.id)

  const { error: deleteError } = await supabase
    .from('audition_registrations')
    .delete()
    .in('id', registrationIds) // Explicitly deletes only the transferred IDs

  if (deleteError) {
    console.error('Purging live roster failed:', deleteError.message)
    throw new Error(`Purging live roster failed: ${deleteError.message}`)
  }
  revalidatePath('/admin/auditions')
  return { success: true, count: archivedRows.length }
}