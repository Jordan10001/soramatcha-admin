"use server"

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function createCategory(name: string) {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured")
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from("category")
      .insert([
        {
          id: uuidv4(),
          name: name.trim().toUpperCase(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/menu")
    return { success: true, data }
  } catch (error) {
    console.error("Error creating category:", error)
    throw error
  }
}

export async function getCategories() {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured")
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from("category")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured")
    }

    const supabase = await createClient()

    // Find menus that reference this category so we can remove their images and delete them
    const { data: menus, error: fetchMenusError } = await (supabase as any)
      .from("menu")
      .select("id, img_url")
      .eq("category_id", id)

    if (fetchMenusError) {
      throw new Error(fetchMenusError.message)
    }

    // Remove images for each menu (best-effort)
    if (Array.isArray(menus) && menus.length > 0) {
      for (const m of menus) {
        try {
          if (m.img_url) {
            const idx = m.img_url.indexOf("/menus/")
            if (idx !== -1) {
              let path = m.img_url.substring(idx + "/menus/".length)
              const q = path.indexOf("?")
              if (q !== -1) path = path.substring(0, q)
              await (supabase as any).storage.from("menus").remove([path])
            }
          }
        } catch (e) {
          console.error("Failed to remove menu image for category delete:", e)
        }
      }

      // Delete the menu rows that referenced this category
      const { error: delMenusError } = await (supabase as any).from("menu").delete().eq("category_id", id)
      if (delMenusError) {
        throw new Error(delMenusError.message)
      }
    }

    // Permanently delete the category
    const { error } = await (supabase as any).from("category").delete().eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/menu")
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}
