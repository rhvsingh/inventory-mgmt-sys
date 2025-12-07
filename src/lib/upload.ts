import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
// We use the SERVICE_ROLE_KEY for server-side uploads to bypass RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const bucketName = process.env.SUPABASE_BUCKET || "products"

const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadImage(file: File): Promise<string | null> {
    if (!file || file.size === 0) return null

    try {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        })

        if (error) {
            console.error("Supabase storage error:", error)
            return null
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        console.error("Error uploading file:", error)
        return null
    }
}
