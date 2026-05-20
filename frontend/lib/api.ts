import type { Property } from "@/lib/types"

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"


function getToken() {
  return localStorage.getItem("token")
}

export function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`,
  }
}


export const buildApiUrl = (path: string) => {
  if (path.startsWith("http")) {
    return path
  }
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`
}

export type SavePropertyOptions = {
  isEdit?: boolean
}

export type PropertyGroupMember = {
  id: string
  property_id: string
  is_whole_property: boolean
  property: Pick<Property, "id" | "name" | "city" | "state" | "is_published">
}

export type PropertyGroup = {
  id: string
  name: string
  created_at: string
  members: PropertyGroupMember[]
}

export async function saveProperty(property: Property, options: SavePropertyOptions = {}) {
  const useApi = process.env.NEXT_PUBLIC_USE_API === "true"

  if (!useApi) {
    // Stub for now; enable API by setting NEXT_PUBLIC_USE_API=true and wiring endpoints.
    return property
  }

  const isEdit = Boolean(options.isEdit)
  const endpoint = isEdit ? `/admin/properties/${property.id}` : "/admin/properties"
  const response = await fetch(buildApiUrl(endpoint), {
    method: isEdit ? "PATCH" : "POST",
    headers: authHeaders(),
    body: JSON.stringify(property),
  })

  if (!response.ok) {
    throw new Error(`Failed to save property (${response.status})`)
  }

  return response.json() as Promise<Property>
}

export async function listAdminProperties() {
  const useApi = process.env.NEXT_PUBLIC_USE_API === "true"
  if (!useApi) {
    return [] as Property[]
  }

  const response = await fetch(buildApiUrl("/admin/properties"), { headers: authHeaders() })
  if (!response.ok) {
    throw new Error(`Failed to load properties (${response.status})`)
  }
  return response.json() as Promise<Property[]>
}

export async function listPropertyGroups() {
  const useApi = process.env.NEXT_PUBLIC_USE_API === "true"
  if (!useApi) {
    return [] as PropertyGroup[]
  }

  const response = await fetch(buildApiUrl("/admin/groups"), { headers: authHeaders() })
  if (!response.ok) {
    throw new Error(`Failed to load property groups (${response.status})`)
  }
  return response.json() as Promise<PropertyGroup[]>
}

export async function createPropertyGroup(name: string) {
  const response = await fetch(buildApiUrl("/admin/groups"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    throw new Error(`Failed to create group (${response.status})`)
  }
  return response.json() as Promise<PropertyGroup>
}

export async function addPropertyGroupMember(groupId: string, propertyId: string, isWholeProperty: boolean) {
  const response = await fetch(buildApiUrl(`/admin/groups/${groupId}/members`), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ property_id: propertyId, is_whole_property: isWholeProperty }),
  })
  if (!response.ok) {
    throw new Error(`Failed to add group member (${response.status})`)
  }
  return response.json() as Promise<PropertyGroup>
}

export async function updatePropertyGroupMember(groupId: string, memberId: string, isWholeProperty: boolean) {
  const response = await fetch(buildApiUrl(`/admin/groups/${groupId}/members/${memberId}`), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ is_whole_property: isWholeProperty }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update group member (${response.status})`)
  }
  return response.json() as Promise<PropertyGroup>
}
  