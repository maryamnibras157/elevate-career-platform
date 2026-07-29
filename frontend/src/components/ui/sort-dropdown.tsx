import * as React from "react"
import { ArrowDownAZ, ArrowUpAZ, ChevronDown, SortAsc, SortDesc } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface SortOption {
  id: string
  label: string
  icon?: React.ReactNode
}

interface SortDropdownProps {
  options: SortOption[]
  selectedSort: string
  onSortChange: (sortId: string) => void
  className?: string
  sortDirection?: "asc" | "desc"
  onDirectionChange?: (direction: "asc" | "desc") => void
}

export function SortDropdown({
  options,
  selectedSort,
  onSortChange,
  className,
  sortDirection,
  onDirectionChange,
}: SortDropdownProps) {
  const selectedOption = options.find((o) => o.id === selectedSort) || options[0]

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            {selectedOption?.icon || <SortAsc className="h-4 w-4" />}
            <span>Sort: {selectedOption?.label}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className={cn("gap-2", selectedSort === option.id && "bg-muted font-medium")}
            >
              {option.icon}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {sortDirection && onDirectionChange && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirectionChange(sortDirection === "asc" ? "desc" : "asc")}
          title={`Sort ${sortDirection === "asc" ? "Descending" : "Ascending"}`}
        >
          {sortDirection === "asc" ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  )
}
