import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { MemberFormData, BiodataFormData } from "@/lib/api-service" // Updated path
import DatePicker from "react-datepicker"
import { Controller } from "react-hook-form"
import "react-datepicker/dist/react-datepicker.css"
import { format as formatDate } from "date-fns"

// Form schema
const createSchema = z.object({
  full_name: z.string().min(3, { message: "Nama lengkap harus diisi minimal 3 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  phone_number: z.string().min(10, { message: "Nomor telepon harus diisi minimal 10 karakter" }),
  birth_place: z.string().optional(),
  birth_date: z.date({ required_error: "Tanggal lahir harus diisi" }),
  division: z.string().min(1, { message: "Divisi harus diisi" }),
  address: z.string().min(5, { message: "Alamat harus diisi minimal 5 karakter" }),
  username: z.string().min(3, { message: "Username harus diisi minimal 3 karakter" }),
  password: z.string().min(6, { message: "Password harus diisi minimal 6 karakter" }),
  role: z.string().optional(),
})

const editSchema = createSchema.omit({ username: true, password: true })

interface MemberFormProps {
  defaultValues?: Partial<{
    full_name: string
    email: string
    phone_number: string
    birth_place?: string
    birth_date: Date | string
    division: string
    address: string
    photo_url?: string
    username?: string
    password?: string
    role?: string
  }>
  onSubmit: (data: MemberFormData) => void
  isSubmitting?: boolean
  isEditMode?: boolean
}

export function MemberForm({ defaultValues, onSubmit, isSubmitting = false, isEditMode = false }: MemberFormProps) {
  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(isEditMode ? editSchema : createSchema),
    defaultValues: {
      username: defaultValues?.username || "",
      password: defaultValues?.password || "",
      full_name: defaultValues?.full_name || "",
      email: defaultValues?.email || "",
      phone_number: defaultValues?.phone_number || "",
      birth_place: defaultValues?.birth_place || "",
      birth_date: defaultValues?.birth_date
        ? (defaultValues.birth_date instanceof Date
            ? defaultValues.birth_date
            : new Date(defaultValues.birth_date))
        : new Date(),
      division: defaultValues?.division && defaultValues.division !== "string" ? defaultValues.division : "",
      address: defaultValues?.address || "",
      role: defaultValues?.role || "member",
    },
  })

  console.log(form.formState.errors)


  // We're now using text inputs for division and position instead of dropdowns

  const handleSubmit = (values: z.infer<typeof createSchema>) => {
    // Format date ke "YYYY-MM-DD"
    const birthDate = formatDate(values.birth_date, "yyyy-MM-dd")

    if (isEditMode) {
      const biodataData: BiodataFormData = {
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        division: values.division,
        birth_place: values.birth_place || "",
        birth_date: birthDate,
        address: values.address
      }

      console.log("Submitting biodata update:", biodataData)
      onSubmit(biodataData)
    } else {
      const userData: MemberFormData = {
        user_data: {
          username: values.username,
          password: values.password
        },
        biodata: {
          full_name: values.full_name,
          email: values.email,
          phone_number: values.phone_number,
          birth_place: values.birth_place || "",
          birth_date: birthDate,
          division: values.division,
          address: values.address,
          photo_url: ""
        }
      }

      console.log("Submitting new user data:", {
        ...userData,
        user_data: { ...userData.user_data, password: "******" }
      })
      onSubmit(userData)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {!isEditMode && (
          <>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama lengkap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan alamat email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nomor telepon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birth_place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tempat Lahir</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan tempat lahir" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          control={form.control}
          name="birth_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Lahir</FormLabel>
              <FormControl>
                <DatePicker
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="dd MMMM yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  showMonthDropdown
                  placeholderText="Pilih tanggal lahir"
                  maxDate={new Date()}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="birth_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Lahir</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: id })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="w-[280px] p-3">
                      <DayPicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        className="rdp w-full"
                        classNames={{
                          table: "w-full border-collapse",
                          head_cell: "text-center text-muted-foreground font-normal text-xs w-9 h-9",
                          cell: "text-center align-middle w-9 h-9 relative p-0 flex items-center justify-center",
                          day: "h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground font-normal text-sm transition-colors",
                          day_selected:
                            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground font-semibold",
                          day_outside:
                            "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                          day_disabled: "text-muted-foreground opacity-50",
                        }}
                        components={{
                          caption: CustomCaption, // ✅ pakai custom caption
                        }}
                      />

                    </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="division"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Divisi</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih divisi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="agama">Divisi Agama</SelectItem>
                  <SelectItem value="sosial">Divisi Sosial</SelectItem>
                  <SelectItem value="lingkungan">Divisi Lingkungan</SelectItem>
                  <SelectItem value="perlengkapan">Divisi Perlengkapan</SelectItem>
                  <SelectItem value="media">Divisi Media</SelectItem>
                  <SelectItem value="anggota">Anggota</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan alamat lengkap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan"
          )}
        </Button>
      </form>
    </Form>
  )
}
