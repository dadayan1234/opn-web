"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown, Image, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { TipTapContent } from "@/components/ui/tiptap-editor"
import { TransactionForm } from "./components/transaction-form";
import { FinanceDocumentGallery } from "./components/finance-document-gallery";
import { TruncatedDescription } from "@/components/finance/truncated-description";
import { formatRupiah } from "@/lib/utils";
import { useFinanceData } from "@/lib/hooks/use-finance-data";
import {
  useFinanceHistoryPage,
  useFinanceMutations,
  type FinanceData,
  type FinanceTransaction
} from "@/hooks/useFinance";
import "./finance.css";

// -----------------------------
// INTERFACES
// -----------------------------
interface Transaction extends FinanceTransaction {
  type?: "income" | "expense";
}

interface TransactionFormData {
  amount: string;
  type: "income" | "expense";
  date: Date;
  title: string;
  description: string;
}

// -----------------------------
// MAIN COMPONENT
// -----------------------------
export default function FinancePage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const [dialog, setDialog] = useState({
    add: false,
    edit: false,
    delete: false,
    gallery: false,
  });
  const [selected, setSelected] = useState<Transaction | null>(null);

  const queryClient = useQueryClient();
  const { data: financeSummary, isLoading } = useFinanceData();
  const { data: transactionsData, isLoading: isLoadingTransactions } = useFinanceHistoryPage(page, limit);
  const { createFinance, updateFinance, deleteFinance } = useFinanceMutations();

  const transactions: Transaction[] = (transactionsData?.data || []).map((t) => ({
    ...t,
    type: t.category === "Pemasukan" ? "income" : "expense",
  }));

  const meta = transactionsData?.meta || { page: 1, total_pages: 1, total: 0 };

  // -----------------------------
  // ACTION HANDLERS
  // -----------------------------
  const invalidateFinance = () => {
    queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    queryClient.invalidateQueries({ queryKey: ["finance-history"] });
  };

  const handleAdd = (data: TransactionFormData) => {
    const payload: FinanceData = {
      amount: Number(data.amount),
      category: data.type === "income" ? "Pemasukan" : "Pengeluaran",
      date: data.date.toISOString(),
      title: data.title,
      description: data.description,
    };

    createFinance.mutate(payload, {
      onSuccess: () => {
        setDialog((d) => ({ ...d, add: false }));
        invalidateFinance();
      },
    });
  };

  const handleEdit = (data: TransactionFormData) => {
    if (!selected) return;
    const payload: FinanceData = {
      amount: Number(data.amount),
      category: data.type === "income" ? "Pemasukan" : "Pengeluaran",
      date: data.date.toISOString(),
      title: data.title,
      description: data.description,
    };

    updateFinance.mutate({ id: selected.id, data: payload }, {
      onSuccess: () => {
        setDialog((d) => ({ ...d, edit: false }));
        setSelected(null);
        invalidateFinance();
      },
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteFinance.mutate(selected.id, {
      onSuccess: () => {
        setDialog((d) => ({ ...d, delete: false }));
        setSelected(null);
        invalidateFinance();
      },
    });
  };

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.total_pages) setPage(newPage);
  };

  // -----------------------------
  // UI RENDER
  // -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Manajemen Keuangan
            </h1>
            <p className="text-slate-600 text-sm mt-1">Kelola keuangan Anda dengan mudah</p>
          </div>

          <Dialog open={dialog.add} onOpenChange={(v) => setDialog({ ...dialog, add: v })}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg px-6 py-3 rounded-xl">
                <PlusCircle className="mr-2 h-5 w-5" /> Tambah Transaksi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold text-blue-600">
                  Tambah Transaksi Baru
                </DialogTitle>
              </DialogHeader>
              <TransactionForm onSubmit={handleAdd} />
            </DialogContent>
          </Dialog>
        </div>

        {/* SUMMARY */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Saldo Saat Ini", value: financeSummary?.current_balance, icon: Wallet, color: "blue" },
            { title: "Total Pemasukan", value: financeSummary?.total_income, icon: TrendingUp, color: "emerald" },
            { title: "Total Pengeluaran", value: financeSummary?.total_expense, icon: TrendingDown, color: "rose" },
          ].map(({ title, value, icon: Icon, color }) => (
            <Card key={title} className="shadow-lg rounded-2xl">
              <CardHeader className={`bg-gradient-to-br from-${color}-500 to-${color}-600 text-white`}>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Icon className="h-5 w-5" /> {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <Skeleton className="h-10 w-full rounded-lg" />
                ) : (
                  <p className={`text-3xl font-bold text-${color}-600`}>
                    {formatRupiah(value || "0")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* TRANSACTION TABLE */}
        <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b p-6">
            <CardTitle className="text-2xl font-bold text-slate-800">Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingTransactions ? (
              <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Wallet className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-lg font-medium">Belum ada transaksi</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{format(new Date(t.date), "dd MMM yyyy")}</TableCell>
                          <TableCell>
                            <div className="font-semibold">{t.title || "Tanpa Judul"}</div>
                            <TruncatedDescription
                              description={t.description}
                              maxLength={20}
                              isRichText={true}
                            />
                          </TableCell>
                          <TableCell>
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${
                                t.category === "Pemasukan"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {t.category === "Pemasukan" ? (
                                <ArrowDown className="mr-1 h-4 w-4" />
                              ) : (
                                <ArrowUp className="mr-1 h-4 w-4" />
                              )}
                              {t.category}
                            </div>
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              t.category === "Pemasukan"
                                ? "text-emerald-700"
                                : "text-rose-700"
                            }`}
                          >
                            {formatRupiah(Number(t.amount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {/* 🟢 Edit Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelected(t);
                                  setDialog((d) => ({ ...d, edit: true }));
                                }}
                                className="rounded-xl border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                                title="Edit Transaksi"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              {/* 🟣 Document Gallery */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelected(t);
                                  setDialog((d) => ({ ...d, gallery: true }));
                                }}
                                className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
                                title={
                                  t.document_url
                                    ? "Lihat Bukti Transaksi"
                                    : "Unggah Bukti Transaksi"
                                }
                              >
                                <Image className="h-4 w-4" />
                              </Button>

                              {/* 🔴 Delete Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelected(t);
                                  setDialog((d) => ({ ...d, delete: true }));
                                }}
                                className="rounded-xl border-slate-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-between items-center py-4 px-6 border-t bg-slate-50">
                  <span className="text-sm text-slate-600">
                    Halaman {meta.page} dari {meta.total_pages} | Total {meta.total} transaksi
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => changePage(page - 1)}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === meta.total_pages}
                      onClick={() => changePage(page + 1)}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        {/* ✳️ Edit Transaction Dialog */}
        <Dialog open={dialog.edit} onOpenChange={(v) => setDialog({ ...dialog, edit: v })}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Edit Transaksi
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <TransactionForm
                onSubmit={handleEdit}
                defaultValues={{
                  date: new Date(selected.date),
                  description: selected.description,
                  title: selected.title,
                  amount: String(selected.amount),
                  type: selected.category === "Pemasukan" ? "income" : "expense",
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* 🔴 Delete Alert */}
        <AlertDialog open={dialog.delete} onOpenChange={(v) => setDialog({ ...dialog, delete: v })}>
          <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-800">
                Hapus Transaksi
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat
                dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="rounded-xl border-slate-200 hover:bg-slate-50">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-xl"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 🟣 Document Gallery */}
        {dialog.gallery && selected && (
          <FinanceDocumentGallery
            open={dialog.gallery}
            onOpenChange={(v) => setDialog({ ...dialog, gallery: v })}
            financeId={selected.id}
            documentUrl={selected.document_url}
            onSuccess={() => invalidateFinance()}
          />
        )}
      </div>
    </div>
  );
}
