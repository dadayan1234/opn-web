"use client";

import { useFinanceData } from "@/lib/hooks/use-finance-data";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown, Image, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { TransactionForm } from "./components/transaction-form"
import { useFinanceHistory, useFinanceMutations, type FinanceData, type FinanceTransaction } from "@/hooks/useFinance"
import { formatRupiah } from "@/lib/utils"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FinanceDocumentGallery } from "./components/finance-document-gallery"
import { TipTapContent } from "@/components/ui/tiptap-editor"
import { TruncatedDescription } from "@/components/finance/truncated-description"
import "./finance.css"

// Local interface for displaying transactions in the UI
interface Transaction extends FinanceTransaction {
  type?: "income" | "expense"
}

interface TransactionFormData {
  amount: string;
  type: "income" | "expense";
  date: Date;
  title: string;
  description: string;
}

export default function FinancePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [selectedFinanceId, setSelectedFinanceId] = useState<number | null>(null)
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null)

  const { data: financeSummary, isLoading } = useFinanceData();
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    refetch
  } = useFinanceHistory();

  const transactions: Transaction[] = (transactionsData?.transactions || []).map(t => ({
    ...t,
    type: t.category === "Pemasukan" ? "income" : "expense"
  }));
  const { createFinance, updateFinance, deleteFinance } = useFinanceMutations();

  const handleAddTransaction = (data: TransactionFormData) => {
    const financeData: FinanceData = {
      amount: Number(data.amount),
      category: data.type === "income" ? "Pemasukan" : "Pengeluaran",
      date: data.date.toISOString(),
      title: data.title,
      description: data.description
    }

    createFinance.mutate(financeData, {
      onSuccess: () => {
        setIsDialogOpen(false)
        refetch()
      }
    })
  }

  const handleEditTransaction = (data: TransactionFormData) => {
    if (!transactionToEdit) return

    const financeData: FinanceData = {
      amount: Number(data.amount),
      category: data.type === "income" ? "Pemasukan" : "Pengeluaran",
      date: data.date.toISOString(),
      title: data.title,
      description: data.description
    }

    updateFinance.mutate({
      id: transactionToEdit.id,
      data: financeData
    }, {
      onSuccess: () => {
        setIsEditDialogOpen(false)
        setTransactionToEdit(null)
        refetch()
      }
    })
  }

  const handleDeleteTransaction = () => {
    if (!transactionToDelete) return

    deleteFinance.mutate(transactionToDelete, {
      onSuccess: () => {
        setIsDeleteAlertOpen(false)
        setTransactionToDelete(null)
        refetch()
      }
    })
  }

  const openEditDialog = (transaction: Transaction) => {
    setTransactionToEdit(transaction)
    setIsEditDialogOpen(true)
  }

  const openDeleteAlert = (id: number) => {
    setTransactionToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const openDocumentGallery = (transaction: Transaction) => {
    setSelectedFinanceId(transaction.id)
    let documentUrl = transaction.document_url;
    console.log("Opening document gallery with URL:", documentUrl);
    setSelectedDocumentUrl(documentUrl)
    setIsGalleryOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Manajemen Keuangan
            </h1>
            <p className="text-slate-600 mt-1">Kelola keuangan Anda dengan mudah dan efisien</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3 h-auto"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                <span className="font-medium">Tambah Transaksi</span>
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-md rounded-2xl border-0 shadow-2xl"
              onPointerDownOutside={(e) => {
                if (e.target && (e.target as HTMLElement).closest('.tiptap')) {
                  e.preventDefault();
                }
              }}
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Tambah Transaksi Baru
                </DialogTitle>
              </DialogHeader>
              <TransactionForm onSubmit={handleAddTransaction} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-slate-600 to-slate-700 text-white pb-3">
              <CardTitle className="flex items-center text-lg font-semibold">
                <Wallet className="mr-3 h-5 w-5" />
                Saldo Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-slate-800">
                  {formatRupiah(financeSummary?.current_balance || "0")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-emerald-500 to-green-600 text-white pb-3">
              <CardTitle className="flex items-center text-lg font-semibold">
                <TrendingUp className="mr-3 h-5 w-5" />
                Total Pemasukan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-emerald-700">
                  {formatRupiah(financeSummary?.total_income || "0")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-rose-500 to-red-600 text-white pb-3">
              <CardTitle className="flex items-center text-lg font-semibold">
                <TrendingDown className="mr-3 h-5 w-5" />
                Total Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-rose-700">
                  {formatRupiah(financeSummary?.total_expense || "0")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800">Riwayat Transaksi</CardTitle>
            <p className="text-slate-600 text-sm">Semua aktivitas keuangan Anda</p>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingTransactions ? (
              <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-lg font-medium">Belum ada transaksi</p>
                <p className="text-sm text-slate-400">Mulai dengan menambahkan transaksi pertama Anda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-700 py-4">Tanggal</TableHead>
                      <TableHead className="font-semibold text-slate-700">Deskripsi</TableHead>
                      <TableHead className="font-semibold text-slate-700">Kategori</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Jumlah</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: Transaction, index) => (
                      <TableRow 
                        key={transaction.id} 
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-200"
                      >
                        <TableCell className="py-4">
                          <div className="font-medium text-slate-700">
                            {format(new Date(transaction.date), "dd MMM yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[200px] max-w-[300px]">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800 text-sm">
                              {transaction.title || "Tanpa Judul"}
                            </div>
                            <TruncatedDescription
                              description={transaction.description}
                              maxLength={20}
                              isRichText={true}
                              title={`Deskripsi Transaksi - ${format(new Date(transaction.date), "dd MMM yyyy")}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            transaction.category === "Pemasukan" 
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                              : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                          }`}>
                            {transaction.category === "Pemasukan" ? (
                              <ArrowDown className="mr-2 h-4 w-4" />
                            ) : (
                              <ArrowUp className="mr-2 h-4 w-4" />
                            )}
                            {transaction.category}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold text-lg ${
                            transaction.category === "Pemasukan" ? "text-emerald-700" : "text-rose-700"
                          }`}>
                            {formatRupiah(Number(transaction.amount))}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(transaction)}
                              className="rounded-xl border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                              title="Edit Transaksi"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDocumentGallery(transaction)}
                              className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all duration-200"
                              title={transaction.document_url ? "Lihat Bukti Transaksi" : "Unggah Bukti Transaksi"}
                            >
                              <Image className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteAlert(transaction.id)}
                              className="rounded-xl border-slate-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all duration-200"
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
            )}
          </CardContent>
        </Card>

        {/* Edit Transaction Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent
            className="sm:max-w-md rounded-2xl border-0 shadow-2xl"
            onPointerDownOutside={(e) => {
              if (e.target && (e.target as HTMLElement).closest('.tiptap')) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Edit Transaksi
              </DialogTitle>
            </DialogHeader>
            {transactionToEdit && (
              <TransactionForm
                onSubmit={handleEditTransaction}
                defaultValues={{
                  date: new Date(transactionToEdit.date),
                  description: transactionToEdit.description,
                  title: transactionToEdit.title,
                  amount: String(transactionToEdit.amount),
                  type: transactionToEdit.category === "Pemasukan" ? "income" : "expense"
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Transaction Alert */}
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-800">Hapus Transaksi</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="rounded-xl border-slate-200 hover:bg-slate-50">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTransaction}
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-xl"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Document Gallery */}
        {selectedFinanceId && (
          <FinanceDocumentGallery
            open={isGalleryOpen}
            onOpenChange={setIsGalleryOpen}
            financeId={selectedFinanceId}
            documentUrl={selectedDocumentUrl}
            onSuccess={() => {
              refetch()
            }}
          />
        )}
      </div>
    </div>
  )
}