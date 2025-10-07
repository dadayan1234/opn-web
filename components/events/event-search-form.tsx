"use client"

import { useState } from "react"
import { Search, Calendar as CalendarIcon, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface EventSearchParams {
  keyword?: string
  date?: string
  status?: "akan datang" | "selesai" | string
  page?: number
  limit?: number
}

interface EventSearchFormProps {
  onSearch: (params: EventSearchParams) => void
  isSearching?: boolean
  onReset?: () => void
}

export function EventSearchForm({ onSearch, isSearching = false, onReset }: EventSearchFormProps) {
  const [keyword, setKeyword] = useState("")
  const [date, setDate] = useState<string>("")
  const [status, setStatus] = useState<string>("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const hasFilters = !!date || (status !== 'all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params: EventSearchParams = {}

    if (keyword.trim()) {
      params.keyword = keyword.trim()
    }
    if (date) {
      params.date = date
    }
    if (status && status !== 'all') {
      params.status = status
    }
    onSearch(params)
  }

  const handleReset = () => {
    setKeyword("")
    setDate("")
    setStatus("all")
    onReset?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari acara..."
            className="pl-8 w-full"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant={hasFilters ? "default" : "outline"}>
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {hasFilters && (
                <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-background text-primary text-xs font-bold">
                  {(date ? 1 : 0) + (status !== 'all' ? 1 : 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Acara</h4>

              <div className="space-y-2">
                <Label htmlFor="event-date-filter">Tanggal</Label>
                <Input
                  id="event-date-filter"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="event-status">
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="akan datang">Akan Datang</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ✨ Perubahan: Mengembalikan tombol "Terapkan Filter" dengan fungsi submit */}
              <div className="flex justify-between pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setDate("");
                    setStatus("all");
                  }}
                >
                  Reset Filter
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    // Membuat event palsu untuk memanggil handleSubmit
                    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                    setIsFilterOpen(false);
                  }}
                >
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button type="submit" disabled={isSearching}>
          <Search className="mr-2 h-4 w-4" />
          Cari
        </Button>

        {(keyword || hasFilters) && (
          <Button type="button" variant="ghost" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            Reset Semua
          </Button>
        )}
      </div>
    </form>
  )
}