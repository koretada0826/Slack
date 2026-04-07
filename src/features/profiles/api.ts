import { supabase } from '@/lib/supabase/client'
import type { DbProfile } from '@/types/db'
import type { UpdateProfileParams } from './types'

export async function fetchProfile(userId: string): Promise<DbProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(
  userId: string,
  params: UpdateProfileParams
): Promise<DbProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(params)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function hasCompletedProfile(userId: string): Promise<boolean> {
  const profile = await fetchProfile(userId)
  return profile.display_name.trim().length > 0
}
