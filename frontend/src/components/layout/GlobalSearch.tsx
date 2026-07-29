'use client';

import * as React from "react"
import { Search, History, BookOpen, Briefcase, Star, Clock, MessageSquare, Mic } from "lucide-react"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const recentSearches = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager"
]

const suggestions = [
  { id: "1", title: "Frontend Developer", category: "Career", icon: Briefcase },
  { id: "2", title: "React", category: "Skill", icon: BookOpen },
  { id: "3", title: "Backend Developer", category: "Saved", icon: Star },
  { id: "4", title: "Tech Roadmap 2024", category: "Roadmap", icon: Clock },
  { id: "5", title: "AI Career Mentor", category: "Mentor", icon: MessageSquare },
  { id: "6", title: "Mock Interview", category: "Interview", icon: Mic },
]

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)

  const filteredSuggestions = query
    ? suggestions.filter(s => s.title.toLowerCase().includes(query.toLowerCase()))
    : suggestions

  const listLength = query ? filteredSuggestions.length : recentSearches.length

  React.useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % listLength)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + listLength) % listLength)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (listLength > 0) {
        if (query) {
          // Action for suggestion
          onOpenChange(false)
        } else {
          // Action for recent search
          setQuery(recentSearches[activeIndex])
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden" hideCloseButton>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search careers, skills, roadmaps..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
        </div>
        
        <ScrollArea className="max-h-[300px]">
          {!query && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Recent Searches</p>
                <div className="flex flex-col gap-1">
                  {recentSearches.map((search, idx) => (
                    <Button 
                      key={search} 
                      variant="ghost" 
                      className={`justify-start font-normal h-8 px-2 ${idx === activeIndex ? 'bg-muted' : ''}`}
                      onClick={() => setQuery(search)}
                    >
                      <History className="mr-2 h-4 w-4 text-muted-foreground" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query && filteredSuggestions.length > 0 && (
            <div className="p-2 space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">Results</p>
              {filteredSuggestions.map((item, idx) => (
                <Button 
                  key={item.id} 
                  variant="ghost" 
                  className={`w-full justify-between font-normal h-10 px-2 ${idx === activeIndex ? 'bg-muted' : ''}`}
                  onClick={() => onOpenChange(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{item.category}</span>
                </Button>
              ))}
            </div>
          )}

          {query && filteredSuggestions.length === 0 && (
            <div className="py-14 text-center">
              <EmptyState 
                icon={Search}
                title="No results found"
                description={`No results found for "${query}"`}
              />
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
