import { serverSupabaseClient } from '#supabase/server'
import { H3Event, readMultipartFormData } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient(event)
  const form = await readMultipartFormData(event)

  const file = form?.find(f => f.name === 'file')
  if (!file || !file.data) {
    return { error: 'No file uploaded' }
  }

  const fileName = `${Date.now()}-${file.filename}`
  const { data, error } = await supabase.storage
    .from('animal-images') // Asegúrate que este bucket exista
    .upload(fileName, file.data, {
      contentType: file.type,
      upsert: true
    })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const { data: urlData } = supabase.storage.from('animal-images').getPublicUrl(fileName)

  return {
    url: urlData?.publicUrl
  }
})
