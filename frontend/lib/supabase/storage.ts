import { buildApiUrl, type ApiFetcher } from '@/lib/api'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function parseUploadError(responseText: string, status: number): string {
  if (!responseText) {
    return `Failed to upload image (${status})`
  }

  try {
    const data = JSON.parse(responseText) as { detail?: unknown; message?: unknown; error?: unknown }
    const detail = data.detail ?? data.message ?? data.error
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }
  } catch {
    // Fall through to a generic message below.
  }

  return `Failed to upload image (${status})`
}

export function validateImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Unsupported image type. Please upload JPG, PNG, or WEBP files.')
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large. Maximum allowed size is 10MB.')
  }
}

export async function uploadPropertyImage(
  file: File,
  onProgress?: (percent: number) => void,
  fetcher?: ApiFetcher,
): Promise<string> {
  validateImageFile(file)

  if (fetcher) {
    onProgress?.(0)
    try {
      const response = await fetcher(buildApiUrl('/admin/upload-image'), {
        method: 'POST',
        body: (() => {
          const formData = new FormData()
          formData.append('file', file, file.name)
          return formData
        })(),
      })

      if (!response.ok) {
        const responseText = await response.text().catch(() => '')
        throw new Error(parseUploadError(responseText, response.status))
      }

      const data = (await response.json()) as { url?: unknown }
      if (typeof data.url !== 'string' || !data.url) {
        throw new Error('Uploaded image URL could not be resolved')
      }

      onProgress?.(100)
      return data.url
    } catch (error) {
      onProgress?.(0)
      throw new Error(error instanceof Error ? error.message : 'Failed to upload image')
    }
  }

  // A fetcher must be provided (e.g. `fetchWithAuth`) so the request can
  // include authentication headers. We no longer use localStorage helpers.
  throw new Error('uploadPropertyImage requires a fetcher (e.g. fetchWithAuth) in this environment')
}
