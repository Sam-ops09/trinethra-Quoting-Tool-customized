import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "wouter"
import {
  FileText,
  Users,
  Package,
  Search,
  Receipt,
  Loader2
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { apiRequest } from "@/lib/queryClient"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [, setLocation] = useLocation()
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Listen for cmd+k or ctrl+k
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const { data: results, isLoading } = useQuery({
    queryKey: ["/api/search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return []
      const res = await apiRequest("GET", `/api/search?q=${encodeURIComponent(debouncedSearch)}`)
      return res.json()
    },
    enabled: debouncedSearch.length > 1,
  })

  // Group results
  const quotes = results?.filter((r: any) => r.type === "Quote") || []
  const invoices = results?.filter((r: any) => r.type === "Invoice") || []
  const clients = results?.filter((r: any) => r.type === "Client") || []
  const products = results?.filter((r: any) => r.type === "Product") || []

  const handleSelect = (url: string) => {
    setLocation(url)
    setOpen(false)
    setSearchQuery("")
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "Quote": return <FileText className="mr-2 h-4 w-4" />
      case "Invoice": return <Receipt className="mr-2 h-4 w-4" />
      case "Client": return <Users className="mr-2 h-4 w-4" />
      case "Product": return <Package className="mr-2 h-4 w-4" />
      default: return <Search className="mr-2 h-4 w-4" />
    }
  }

  return (
    <>
      <div 
        className="hidden md:flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors mr-2 w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput 
          placeholder="Search quotes, clients, invoices, products..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading && <div className="p-4 flex justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>}
          {!isLoading && debouncedSearch.length > 1 && results?.length === 0 && (
            <CommandEmpty>No results found for "{debouncedSearch}".</CommandEmpty>
          )}
          {!isLoading && debouncedSearch.length <= 1 && (
            <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
          )}

          {quotes.length > 0 && (
            <CommandGroup heading="Quotes">
              {quotes.map((r: any) => (
                <CommandItem key={r.id} onSelect={() => handleSelect(r.url)} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getIcon(r.type)}
                    <div className="flex flex-col ml-1">
                      <span className="font-medium">{r.title}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {invoices.length > 0 && (
            <CommandGroup heading="Invoices">
              {invoices.map((r: any) => (
                <CommandItem key={r.id} onSelect={() => handleSelect(r.url)} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getIcon(r.type)}
                    <div className="flex flex-col ml-1">
                      <span className="font-medium">{r.title}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {clients.length > 0 && (
            <CommandGroup heading="Clients">
              {clients.map((r: any) => (
                <CommandItem key={r.id} onSelect={() => handleSelect(r.url)} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getIcon(r.type)}
                    <div className="flex flex-col ml-1">
                      <span className="font-medium">{r.title}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {products.length > 0 && (
            <CommandGroup heading="Products">
              {products.map((r: any) => (
                <CommandItem key={r.id} onSelect={() => handleSelect(r.url)} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getIcon(r.type)}
                    <div className="flex flex-col ml-1">
                      <span className="font-medium">{r.title}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
