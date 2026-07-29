import * as React from "react"
import { Check, ChevronsUpDown, Filter } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface FilterOption {
  id: string
  label: string
}

export interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
}

interface FilterPanelProps {
  groups: FilterGroup[]
  selectedFilters: Record<string, string[]>
  onFilterChange: (groupId: string, optionId: string, checked: boolean) => void
  onClearFilters?: () => void
  className?: string
}

export function FilterPanel({
  groups,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  className,
}: FilterPanelProps) {
  const activeFilterCount = Object.values(selectedFilters).reduce(
    (acc, curr) => acc + curr.length,
    0
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                onClearFilters()
              }}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {groups.map((group, groupIdx) => (
          <React.Fragment key={group.id}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
              {group.options.map((option) => {
                const isSelected = (selectedFilters[group.id] || []).includes(option.id);
                return (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={(e) => {
                      e.preventDefault();
                      onFilterChange(group.id, option.id, !isSelected);
                    }}
                    className="flex items-center justify-between"
                  >
                    {option.label}
                    {isSelected && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            {groupIdx < groups.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
