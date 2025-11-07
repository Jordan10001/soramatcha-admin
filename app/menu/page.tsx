"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { NewCategoryModal } from "@/components/new-category-modal"
import { NewMenuModal } from "@/components/new-menu-modal"
import { createCategory, getCategories, deleteCategory } from "@/app/actions/category"
import { createMenu, getMenus, deleteMenu } from "@/app/actions/menu"
import { MenusSection } from "@/components/menus-section"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { EditMenuModal } from "@/components/edit-menu-modal"

interface Category {
  id: string
  name: string
}

interface Menu {
  id: string
  name: string
  description: string
  price: number
  category_id: string
  img_url: string
  created_at: string
}

export default function MenuPage() {
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false)
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "menu" | "category"
    id: string
    name?: string
  } | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Menu | null>(null)

  // Fetch categories and menus on mount
  useEffect(() => {
    fetchCategories()
    fetchMenus()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const data = await getCategories()
      setCategories(data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to fetch categories")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMenus = async () => {
    try {
      const data = await getMenus()
      setMenus(data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching menus:", err)
      // Show the real error message in the UI for debugging
      setError(String(err))
    }
  }

  const handleDeleteMenu = async (id: string) => {
    try {
      await deleteMenu(id)
      await fetchMenus()
      setError(null)
    } catch (err) {
      console.error("Error deleting menu:", err)
      setError(String(err))
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      await fetchCategories()
      await fetchMenus()
      setError(null)
    } catch (err) {
      console.error("Error deleting category:", err)
      setError(String(err))
    }
  }

  const handleCreateCategory = async (name: string) => {
    try {
      setIsCreating(true)
      await createCategory(name)
      setIsNewCategoryOpen(false)
      await fetchCategories()
      setError(null)
    } catch (err) {
      console.error("Error creating category:", err)
      setError("Failed to create category")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateMenu = async (data: {
    name: string
    description: string
    price: string
    categoryId: string
    imageUrl: string
  }) => {
    try {
      setIsCreating(true)
      await createMenu(
        data.name,
        data.description,
        parseFloat(data.price),
        data.categoryId,
        data.imageUrl
      )
      setIsNewMenuOpen(false)
      setError(null)
      setSuccess("Menu created successfully")
      await fetchMenus()
    } catch (err) {
      console.error("Error creating menu:", err)
      setError(String(err))
    } finally {
      setIsCreating(false)
    }
  }

  // Open delete confirmation for menu or category
  const openDelete = (type: "menu" | "category", id: string, name?: string) => {
    setDeleteTarget({ type, id, name })
    setIsDeleteOpen(true)
  }

  const openEdit = (id: string) => {
    const m = menus.find((x) => x.id === id) || null
    setEditTarget(m)
    setIsEditOpen(true)
  }

  const closeEdit = () => {
    setIsEditOpen(false)
    setEditTarget(null)
  }

  const closeDelete = () => {
    setIsDeleteOpen(false)
    setDeleteTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const { type, id } = deleteTarget
    try {
      if (type === "menu") {
        await deleteMenu(id)
        await fetchMenus()
      } else {
        await deleteCategory(id)
        await fetchCategories()
        await fetchMenus()
      }
      setSuccess("Deleted successfully")
      setError(null)
    } catch (err) {
      console.error("Error confirming delete:", err)
      setError(String(err))
    } finally {
      closeDelete()
    }
  }

  const handleUpdateMenu = async (data: {
    id: string
    name: string
    description: string
    price: string
    categoryId: string
    imageUrl: string | null
  }) => {
    try {
      setIsCreating(true)
      // call server action updateMenu
      // import dynamic at top - using existing app/actions/menu updateMenu
      const { updateMenu } = await import("@/app/actions/menu")
      await updateMenu(
        data.id,
        data.name,
        data.description,
        parseFloat(data.price),
        data.categoryId || null,
        data.imageUrl || null
      )
      setSuccess("Menu updated successfully")
      await fetchMenus()
      closeEdit()
    } catch (err) {
      console.error("Error updating menu:", err)
      setError(String(err))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <NewCategoryModal
        isOpen={isNewCategoryOpen}
        onClose={() => setIsNewCategoryOpen(false)}
        onSubmit={handleCreateCategory}
        isLoading={isCreating}
      />

      <NewMenuModal
        isOpen={isNewMenuOpen}
        onClose={() => setIsNewMenuOpen(false)}
        onSubmit={handleCreateMenu}
        categories={categories}
        isLoading={isCreating}
      />

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg">
          {success}
        </div>
      )}

      

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <button
                onClick={() => setIsNewCategoryOpen(true)}
                className="w-full bg-light-orange hover:bg-pastel-orange text-gray-orange px-6 py-4 text-base font-bold rounded-[8px] transition-colors uppercase"
              >
                New Category
              </button>

              <div className="bg-light-orange rounded-[8px] p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-orange uppercase mb-3">
                  List Category:
                </h3>
                {isLoading ? (
                  <p className="text-sm text-gray-orange">Loading...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-orange">No categories yet</p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-sm text-gray-orange">{category.name}</span>
                      <button
                        onClick={() => openDelete("category", category.id, category.name)}
                        className="bg-pastel-orange  text-gray-orange px-3 py-1 text-xs font-medium rounded-[8px] transition-colors uppercase"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Menu */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <button
                onClick={() => setIsNewMenuOpen(true)}
                className="w-full bg-light-orange hover:bg-pastel-orange text-gray-orange px-6 py-4 text-base font-bold rounded-[8px] transition-colors uppercase"
              >
                New Menu
              </button>

              <div className="bg-light-orange rounded-[8px] p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="SEARCH :"
                    className="flex-1 bg-light-orange border-0 px-4 py-2 text-sm text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange"
                  />
                  <button className="bg-pastel-orange  text-gray-orange px-4 py-2 text-sm font-medium rounded-[8px] transition-colors uppercase">
                    Enter
                  </button>
                </div>
              </div>

              {/* menus moved below to span full width */}
            </div>
          </div>
          {/* Menus section placed inside the grid so it lines up with the left column */}
          <div className="lg:col-span-3">
              <div className="rounded-[8px] p-0">
                {menus.length === 0 ? (
                <p className="text-sm text-gray-orange text-center">No menus yet</p>
              ) : (
                <MenusSection
                      menus={menus}
                      categories={categories}
                      onDelete={(id) => openDelete("menu", id)}
                      onEdit={(id) => openEdit(id)}
                    />
              )}
            </div>
          </div>
        </div>
      </main>
      <EditMenuModal
        isOpen={isEditOpen}
        onClose={closeEdit}
        onSubmit={handleUpdateMenu}
        categories={categories}
        initialData={editTarget}
        isLoading={isCreating}
      />
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        title={deleteTarget ? `Delete ${deleteTarget.type}` : "Delete"}
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete this ${deleteTarget.type}${deleteTarget.name ? `: ${deleteTarget.name}` : ""}? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={closeDelete}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
