import { supabase } from '@/lib/supabase/client'
import type { DbWorkspace, DbWorkspaceMember } from '@/types/db'
import type { WorkspaceWithRole } from '@/types/entities'
import type { CreateWorkspaceParams } from './types'

export async function fetchMyWorkspaces(
  userId: string
): Promise<WorkspaceWithRole[]> {
  const { data: memberships, error: mError } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', userId)

  if (mError) throw mError
  if (!memberships || memberships.length === 0) return []

  const wsIds = memberships.map((m) => m.workspace_id)

  const { data: workspaces, error: wError } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', wsIds)
    .order('created_at', { ascending: false })

  if (wError) throw wError

  const roleMap = new Map(
    memberships.map((m) => [m.workspace_id, m.role as DbWorkspaceMember['role']])
  )

  return (workspaces ?? []).map((ws: DbWorkspace) => ({
    ...ws,
    role: roleMap.get(ws.id) ?? 'member',
  }))
}

export async function fetchWorkspaceBySlug(
  slug: string
): Promise<DbWorkspace | null> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw error
  }
  return data
}

export async function createWorkspace(
  userId: string,
  params: CreateWorkspaceParams
): Promise<DbWorkspace> {
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      name: params.name,
      slug: params.slug,
      description: params.description ?? '',
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/** Create the default #general channel when a workspace is created */
export async function createDefaultChannel(
  workspaceId: string,
  userId: string
) {
  const { error } = await supabase.from('channels').insert({
    workspace_id: workspaceId,
    name: 'general',
    slug: 'general',
    description: 'General discussion',
    visibility: 'public',
    created_by: userId,
  })
  if (error) throw error
}
