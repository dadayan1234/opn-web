"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { DayPicker } from "react-day-picker"

const transactionFormSchema = z.object({
  date: z.date({
    required_error: "Tanggal harus diisi",
  }),
  title: z.string().min(1, "Judul harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  amount: z
    .string()
    .min(1, "Jumlah harus diisi")
    .refine(
      (value) => !isNaN(Number(value)) && Number(value) > 0,
      "Jumlah harus berupa angka positif"
    ),
  type: z.enum(["income", "expense"], {
    required_error: "Silakan pilih jenis transaksi",
  }),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

interface TransactionFormProps {
  onSubmit: (data: TransactionFormValues) => void
  defaultValues?: Partial<TransactionFormValues>
}

export function TransactionForm({ onSubmit, defaultValues }: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: new Date(),
      title: "",
      description: "",
      amount: "",
      type: "income",
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Judul Transaksi */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Transaksi</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan judul transaksi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tanggal */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  sideOffset={4}
                  
                >
                  <div className="w-[280px] p-3">
                    <DayPicker
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="rdp w-full"
                      classNames={{
                        table: "w-full border-collapse",
                        head_row: "", // biarkan default (table-row)
                        head_cell:
                          "text-center text-muted-foreground font-normal text-xs w-9 h-9",
                        row: "", // biarkan default (table-row)
                        cell: "text-center align-middle w-9 h-9 relative p-0 flex items-center justify-center",
                        day: "h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground font-normal text-sm transition-colors",
                        day_selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        day_today:
                          "bg-accent text-accent-foreground font-semibold",
                        day_outside:
                          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                        day_disabled: "text-muted-foreground opacity-50",
                      }}
                    />

                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Deskripsi */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <div className="mt-1">
                  <TipTapEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Masukkan deskripsi transaksi"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Jumlah */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah (Rupiah)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Masukkan jumlah"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Jenis */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis transaksi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Simpan
        </Button>
      </form>
    </Form>
  )
}
