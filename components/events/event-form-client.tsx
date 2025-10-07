"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

// Zod untuk validasi skema
import { z } from "zod";

// React Hook Form untuk manajemen state dan validasi form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Library & Tipe Data
import { format } from "date-fns";
import type { Event } from "@/lib/api-service";
import { eventApi } from "@/lib/api-service";

// Komponen UI dari Shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";


// ============================================================================
// 1. SKEMA VALIDASI & TIPE DATA (Zod)
// ============================================================================
const eventFormSchema = z.object({
  title: z.string().min(3, { message: "Judul acara minimal 3 karakter." }),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal tidak valid." }),
  time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Format waktu tidak valid." }),
  location: z.string().min(3, { message: "Lokasi minimal 3 karakter." }),
  status: z.enum(["akan datang", "selesai"]).default("akan datang"),
  minutes: z.string().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;


// ============================================================================
// 2. PROPS KOMPONEN
// ============================================================================
interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}


// ============================================================================
// 3. KOMPONEN UTAMA
// ============================================================================
export function EventFormClient({ event, onSuccess }: EventFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const isEditing = !!event;

  // Inisialisasi React Hook Form, menggantikan banyak useState
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    // Mengisi nilai default form, termasuk memformat tanggal dan waktu
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      date: event?.date ? event.date.substring(0, 10) : format(new Date(), "yyyy-MM-dd"),
      time: event?.time ? event.time.substring(0, 5) : "08:00",
      location: event?.location || "",
      status: event?.status || "akan datang",
      minutes: event?.minutes || "",
    },
  });

  // Fungsi yang dijalankan saat form disubmit dan valid
  const onSubmit = async (data: EventFormData) => {
    setErrorMessage("");
    try {
      let result;
      if (isEditing && event.id) {
        result = await eventApi.updateEvent(event.id, data);
      } else {
        result = await eventApi.createEvent(data);
      }
      
      onSuccess?.();
      router.push(`/dashboard/events/${result.id}`);

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Terjadi kesalahan saat menyimpan.";
      setErrorMessage(message);
      console.error("Error submitting form:", error);
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Acara" : "Buat Acara Baru"}</CardTitle>
            <CardDescription>
              {isEditing ? "Edit informasi acara yang sudah ada." : "Isi detail untuk membuat acara baru."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Acara</FormLabel>
                  <FormControl>
                    <Input placeholder="Rapat bulanan..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detail acara..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi</FormLabel>
                  <FormControl>
                    <Input placeholder="Ruang meeting..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="akan datang">Akan Datang</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Menyimpan..." : (isEditing ? "Update Acara" : "Buat Acara")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}