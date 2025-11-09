"use server"

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function uploadEventImage(file: File, fileName?: string) {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase is not configured in uploadEventImage")
      return { success: false, message: "Supabase is not configured" }
    }

    const supabase = await createClient()
    const fileExt = file.name.split(".").pop()
    const filePath = `${fileName || uuidv4()}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await (supabase as any).storage
      .from("event")
      .upload(filePath, buffer, {
        contentType: file.type,
      })

    if (error) {
      console.error("Supabase storage.upload error in uploadEventImage:", error)
      return { success: false, message: error.message }
    }

    const { data: urlData } = (supabase as any).storage
      .from("event")
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading image:", error)
    return { success: false, message: "Server error while uploading image" }
  }
}

export async function deleteEventImage(filePath: string) {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase is not configured in deleteEventImage")
      return { success: false, message: "Supabase is not configured" }
    }

    const supabase = await createClient()

    const { error } = await (supabase as any).storage
      .from("event")
      .remove([filePath])

    if (error) {
      console.error("Supabase storage.remove error in deleteEventImage:", error)
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting image:", error)
    return { success: false, message: "Server error while deleting image" }
  }
}

export async function createEvent(name: string, description: string, locations: string, imageUrl: string) {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase is not configured in createEvent")
      return { success: false, message: "Supabase is not configured" }
    }

    const supabase = await createClient()
    const id = uuidv4()
    const createdAt = new Date().toISOString()

    // Prevent duplicate event names (case-insensitive)
    try {
      const nameTrim = (name || "").trim()
      if (nameTrim.length > 0) {
        const { data: existing, error: existingError } = await (supabase as any)
          .from("event")
          .select("id")
          .ilike("name", nameTrim)

        if (existingError) {
          console.error("Error checking duplicate event name:", existingError)
        }

        if (Array.isArray(existing) && existing.length > 0) {
          return { success: false, message: "Event name already exists" }
        }
      }
    } catch (e) {
      // ignore duplicate-check errors and continue with insert
      console.error("Duplicate name check failed:", e)
    }

    const { data, error } = await (supabase as any).from("event").insert({
      id,
      name,
      description,
      locations,
      img_url: imageUrl,
      created_at: createdAt,
    })

    if (error) {
      console.error("Supabase insert error in createEvent:", error)
      return { success: false, message: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating event:", error)
    return { success: false, message: "Server error while creating event" }
  }
}

export async function getEvents() {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase is not configured in getEvents")
      return []
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from("event")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error fetching events:", error)
      return []
    }

    // Normalize DB shape: some schemas use `locations` column — map to `location` for the UI
    try {
      return Array.isArray(data)
        ? data.map((row: any) => ({ ...row, location: row.locations ?? row.location ?? null }))
        : data
    } catch (e) {
      return data
    }
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export async function deleteEvent(id: string) {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase is not configured in deleteEvent")
      return { success: false, message: "Supabase is not configured" }
    }

    const supabase = await createClient()

    const { data: rows, error: selectError } = await (supabase as any)
      .from("event")
      .select("*")
      .eq("id", id)

    if (selectError) {
      console.error("Supabase select error in deleteEvent:", selectError)
      return { success: false, message: selectError.message }
    }

    const ev = Array.isArray(rows) && rows.length > 0 ? rows[0] : null

    if (!ev) {
      console.error("Event not found when attempting delete:", id)
      return { success: false, message: "Event not found" }
    }

    if (ev.img_url) {
      try {
        const filePath = extractEventStoragePath(ev.img_url)
        if (filePath) {
          const { error: rmError } = await (supabase as any).storage.from("event").remove([filePath])
          if (rmError) {
            console.error("Failed to remove event image from storage:", rmError)
          }
        }
      } catch (e) {
        console.error("Error while removing event image:", e)
      }
    }

    const { data: deletedData, error } = await (supabase as any).from("event").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error in deleteEvent:", error)
      return { success: false, message: error.message }
    }

    return { success: true, data: deletedData }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { success: false, message: "Server error while deleting event" }
  }
}

function extractEventStoragePath(url?: string | null) {
  if (!url) return null
  try {
    // Accept both /event/ and /events/ segments and /public/event/ fallback
    const candidates = ["/event/", "/events/", "/public/event/", "/public/events/"]
    for (const seg of candidates) {
      const idx = url.indexOf(seg)
      if (idx !== -1) {
        let path = url.substring(idx + seg.length)
        const q = path.indexOf("?")
        if (q !== -1) path = path.substring(0, q)
        return path.replace(/^\/+/, "")
      }
    }
    return null
  } catch (e) {
    return null
  }
}

export async function updateEvent(id: string, name: string, description: string, locations: string, imageUrl?: string | null) {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase is not configured in updateEvent")
      return { success: false, message: "Supabase is not configured" }
    }

    const supabase = await createClient()

    // Prevent duplicate event names (case-insensitive), excluding the current id
    try {
      const nameTrim = (name || "").trim()
      if (nameTrim.length > 0) {
        const { data: existing, error: existingError } = await (supabase as any)
          .from("event")
          .select("id")
          .ilike("name", nameTrim)
          .neq("id", id)

        if (existingError) {
          console.error("Error checking duplicate event name (update):", existingError)
        }

        if (Array.isArray(existing) && existing.length > 0) {
          return { success: false, message: "Event name already exists" }
        }
      }
    } catch (e) {
      console.error("Duplicate name check failed (update):", e)
    }

    // Fetch existing row to determine if image needs removal
    const { data: rows, error: selectError } = await (supabase as any)
      .from("event")
      .select("*")
      .eq("id", id)

    if (selectError) {
      console.error("Supabase select error in updateEvent:", selectError)
      return { success: false, message: selectError.message }
    }

    const ev = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
    if (!ev) {
      return { success: false, message: "Event not found" }
    }

    // Handle previous image removal cases:
    // - If imageUrl is a string (new URL) and differs from existing, remove previous file.
    // - If imageUrl is explicitly null, remove previous file and clear the column.
    try {
      if (typeof imageUrl !== "undefined") {
        // If imageUrl is explicitly null => admin requested to clear the image
        if (imageUrl === null) {
          if (ev.img_url) {
            try {
              const filePath = extractEventStoragePath(ev.img_url)
              if (filePath) {
                const { error: rmError } = await (supabase as any).storage.from("event").remove([filePath])
                if (rmError) console.error("Failed to remove previous event image:", rmError)
              }
            } catch (e) {
              console.error("Error removing previous image during update (clear):", e)
            }
          }
        } else if (typeof imageUrl === "string") {
          // If a new URL string is provided and differs from existing, remove previous file
          if (ev.img_url && ev.img_url !== imageUrl) {
            try {
              const filePath = extractEventStoragePath(ev.img_url)
              if (filePath) {
                const { error: rmError } = await (supabase as any).storage.from("event").remove([filePath])
                if (rmError) console.error("Failed to remove previous event image:", rmError)
              }
            } catch (e) {
              console.error("Error removing previous image during update (replace):", e)
            }
          }
        }
      }
    } catch (e) {
      console.error("Error while handling previous image removal:", e)
    }

    // Build update payload: only set img_url if provided (can be null to clear)
    const payload: any = {
      name,
      description,
      locations,
      // update the updated_at timestamp so DB records reflect the modification time
      updated_at: new Date().toISOString(),
    }
    if (typeof imageUrl !== "undefined") payload.img_url = imageUrl

    const { data: updated, error } = await (supabase as any).from("event").update(payload).eq("id", id)

    if (error) {
      console.error("Supabase update error in updateEvent:", error)
      return { success: false, message: error.message }
    }

    return { success: true, data: updated }
  } catch (error) {
    console.error("Error updating event:", error)
    return { success: false, message: "Server error while updating event" }
  }
}
