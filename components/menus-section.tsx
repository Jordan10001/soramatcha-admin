"use client"
import { MenuCard } from "./menu-card"

interface Category {
  id: string
  name: string
}

interface Menu {
  id: string
  name: string
  description: string
  price: number
  category_id: string | null
  img_url?: string | null
  created_at?: string
}

interface MenusSectionProps {
  menus: Menu[]
  categories: Category[]
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

export function MenusSection({ menus, categories, onDelete, onEdit }: MenusSectionProps) {
  // Group menus by category_id
  const byCategory: Record<string, Menu[]> = {}
  const uncategorized: Menu[] = []

  menus.forEach((m) => {
    if (m.category_id) {
      byCategory[m.category_id] = byCategory[m.category_id] || []
      byCategory[m.category_id].push(m)
    } else {
      uncategorized.push(m)
    }
  })

  const sortedCategories = [...categories].sort((a, b) => b.name.localeCompare(a.name))

  const sortMenusDesc = (items: Menu[]) =>
    items.slice().sort((a, b) => {
      const ta = a.created_at ? Date.parse(a.created_at) : 0
      const tb = b.created_at ? Date.parse(b.created_at) : 0
      return tb - ta
    })

  return (
  // Use smaller top padding so the menus sit closer to the controls above
  <section className="pt-2">
      {/* No background wrapper here — the list should be plain */}
      <div className="p-0">
        

        {/* For each category, render list with minimal spacing */}
        {sortedCategories.map((cat) => {
          const items = byCategory[cat.id] || []
          const ordered = sortMenusDesc(items)
          return (
            <div key={cat.id} className="mb-6">
              <h4 className="text-sm font-bold text-gray-orange uppercase mb-2">{cat.name}</h4>
              {ordered.length === 0 ? (
                <div className="text-sm text-gray-orange mb-4">No menus in this category</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {ordered.map((m) => (
                    <div key={m.id}>
                      <MenuCard
                        id={m.id}
                        name={m.name}
                        description={m.description}
                        price={m.price}
                        img_url={m.img_url}
                        onDelete={onDelete}
                        onEdit={onEdit}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Un-categorized section */}
        {uncategorized.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-orange uppercase mb-2">Uncategorized</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {sortMenusDesc(uncategorized).map((m) => (
                <div key={m.id}>
                  <MenuCard
                    id={m.id}
                    name={m.name}
                    description={m.description}
                    price={m.price}
                    img_url={m.img_url}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
