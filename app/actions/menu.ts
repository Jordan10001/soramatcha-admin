"use server"

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function uploadMenuImage(file: File, fileName?: string) {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured")
    }

    const supabase = await createClient()
    const fileExt = file.name.split(".").pop()
    const filePath = `${fileName || uuidv4()}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await (supabase as any).storage
      .from("menus")
      .upload(filePath, buffer, {
        contentType: file.type,
      })

    if (error) {
      throw new Error(error.message)
    }

    // Get public URL
    const { data: urlData } = (supabase as any).storage
      .from("menus")
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

export async function deleteMenuImage(filePath: string) {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured")
    }

    const supabase = await createClient()

    const { error } = await (supabase as any).storage
      .from("menus")
      .remove([filePath])

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting image:", error)
    throw error
  }
}

export async function createMenu(
  name: string,
  description: string,
  price: number,
  categoryId: string,
  imageUrl: string
) {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured")
    }

    const supabase = await createClient()
    const id = uuidv4()
    const createdAt = new Date().toISOString()

    const { data, error } = await (supabase as any).from("menu").insert({
      id,
      name,
      description,
      price,
      category_id: categoryId,
      img_url: imageUrl,
      created_at: createdAt,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating menu:", error)
    throw error
  }
}

export async function getMenus() {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured")
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from("menu")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Error fetching menus:", error)
    throw error
  }
}

export async function deleteMenu(id: string) {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured")
    }

    const supabase = await createClient()
    // Fetch the menu row to get the image path
    const { data: rows, error: selectError } = await (supabase as any)
      .from("menu")
      .select("*")
      .eq("id", id)

    if (selectError) {
      throw new Error(selectError.message)
    }

    const menu = Array.isArray(rows) && rows.length > 0 ? rows[0] : null

    if (!menu) {
      throw new Error("Menu not found")
    }

    // If menu has an image URL, try to remove it from storage
    if (menu.img_url) {
      try {
        const filePath = extractMenuStoragePath(menu.img_url)
        if (filePath) {
          const { error: rmError } = await (supabase as any).storage.from("menus").remove([filePath])
          if (rmError) {
            // Log and continue — don't block DB deletion on storage failure
            console.error("Failed to remove menu image from storage:", rmError)
          }
        }
      } catch (e) {
        console.error("Error while removing menu image:", e)
      }
    }

    // Permanently delete the menu row
    const { data: deletedData, error } = await (supabase as any).from("menu").delete().eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: deletedData }
  } catch (error) {
    console.error("Error deleting menu:", error)
    throw error
  }
}

function extractMenuStoragePath(url?: string | null) {
  if (!url) return null
  try {
    // Find the 'menus/' segment and take everything after it as the file path
    const idx = url.indexOf("/menus/")
    if (idx === -1) return null
    let path = url.substring(idx + "/menus/".length)
    // Strip query string if present
    const q = path.indexOf("?")
    if (q !== -1) path = path.substring(0, q)
    // Remove leading slashes
    return path.replace(/^\/+/, "")
  } catch (e) {
    return null
  }
}
