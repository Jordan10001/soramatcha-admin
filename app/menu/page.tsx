"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { NewCategoryModal } from "@/components/new-category-modal"
import { NewMenuModal } from "@/components/new-menu-modal"
import { createCategory, getCategories, deleteCategory } from "@/app/actions/category"
import { createMenu, getMenus, deleteMenu } from "@/app/actions/menu"
import { MenusSection } from "@/components/menus-section"

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

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      await fetchCategories()
      setError(null)
    } catch (err) {
      console.error("Error deleting category:", err)
      setError("Failed to delete category")
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
                        onClick={() => handleDeleteCategory(category.id)}
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
                  onDelete={handleDeleteMenu}
                  onEdit={(id) => console.log("Edit menu", id)}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
