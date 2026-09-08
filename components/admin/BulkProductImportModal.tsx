'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { bulkImportProductsAction, type BulkProductImportRow } from '@/lib/actions/products'

interface ParsedRow {
  rawIndex: number
  name: string
  description?: string
  price: number
  cost_price?: number
  category?: string
  stock_qty: number
  sku?: string
  supplier_ref?: string
  images: string[]
  errors: string[]
  isValid: boolean
}

interface BulkProductImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BulkProductImportModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkProductImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  if (!isOpen) return null

  // ── Download Sample CSV Template ──────────────────────────
  const downloadSampleCsv = () => {
    const csvContent =
      'name,description,price,cost_price,category,stock_qty,sku,supplier_ref,image_urls\n' +
      '"Men Slim Fit Cotton Shirt","100% Breathable cotton everyday wear",1250,750,"Men Fashion",25,"SHIRT-001","LG-84920","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf"\n' +
      '"Wireless Bluetooth Earbuds","Deep bass active noise cancellation",1650,900,"Electronics",40,"EARBUD-PRO","LG-12491","https://images.unsplash.com/photo-1590658268037-6bf12165a8df"\n' +
      '"Leather Formal Belt","Genuine cowhide leather with metal buckle",650,320,"Accessories",50,"BELT-BRN","LG-99214","https://images.unsplash.com/photo-1624222247344-550fb60583dc"'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'poshra_product_import_sample.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ── Parse Uploaded CSV ────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setGlobalError(null)
    setParsing(true)

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsing(false)
        const rows: ParsedRow[] = []

        results.data.forEach((row: any, idx: number) => {
          const errors: string[] = []

          // Normalized access
          const name = (row.name || row['Product Name'] || '').trim()
          const rawPrice = (row.price || row['Price'] || '').toString().trim()
          const rawCost = (row.cost_price || row['Cost Price'] || row['cost'] || '').toString().trim()
          const rawStock = (row.stock_qty || row['Stock'] || row['stock'] || '').toString().trim()
          const category = (row.category || row['Category'] || '').trim()
          const description = (row.description || row['Description'] || '').trim()
          const sku = (row.sku || row['SKU'] || '').trim()
          const supplier_ref = (row.supplier_ref || row['Supplier Ref'] || row['supplier'] || '').trim()
          const rawImages = (row.image_urls || row.images || row['Image URLs'] || '').trim()

          // Validation
          if (!name) {
            errors.push('Missing product name')
          }

          const priceNum = parseFloat(rawPrice)
          if (isNaN(priceNum) || priceNum <= 0) {
            errors.push(`Invalid price: "${rawPrice}"`)
          }

          let costNum: number | undefined
          if (rawCost) {
            costNum = parseFloat(rawCost)
            if (isNaN(costNum) || costNum < 0) {
              errors.push(`Invalid cost price: "${rawCost}"`)
            }
          }

          const stockNum = rawStock ? parseInt(rawStock, 10) : 10
          if (isNaN(stockNum) || stockNum < 0) {
            errors.push(`Invalid stock quantity: "${rawStock}"`)
          }

          const images = rawImages
            ? rawImages.split(/[,;\n]+/).map((u: string) => u.trim()).filter(Boolean)
            : []

          rows.push({
            rawIndex: idx + 1,
            name,
            description,
            price: priceNum || 0,
            cost_price: costNum,
            category,
            stock_qty: isNaN(stockNum) ? 0 : stockNum,
            sku,
            supplier_ref,
            images,
            errors,
            isValid: errors.length === 0,
          })
        })

        setParsedRows(rows)
      },
      error: (err) => {
        setParsing(false)
        setGlobalError(`Failed to parse CSV file: ${err.message}`)
      },
    })
  }

  // ── Commit Valid Rows ─────────────────────────────────────
  const validRows = parsedRows.filter((r) => r.isValid)
  const invalidRows = parsedRows.filter((r) => !r.isValid)

  const handleImport = async () => {
    if (validRows.length === 0) return

    setImporting(true)
    setGlobalError(null)

    const payload: BulkProductImportRow[] = validRows.map((r) => ({
      name: r.name,
      description: r.description,
      price: r.price,
      cost_price: r.cost_price,
      category: r.category,
      stock_qty: r.stock_qty,
      sku: r.sku,
      supplier_ref: r.supplier_ref,
      images: r.images,
    }))

    const res = await bulkImportProductsAction(payload)

    setImporting(false)

    if (res.success) {
      onSuccess()
      onClose()
    } else {
      setGlobalError(res.error || 'Failed to import products.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Bulk Product Import (LIFEGOOD)
              </h2>
              <p className="text-xs text-gray-500">
                Upload CSV or spreadsheet data with real-time error checking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadSampleCsv}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Sample CSV</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {globalError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {globalError}
            </div>
          )}

          {/* Upload Dropzone */}
          {parsedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-900 transition-colors bg-gray-50/50">
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm font-bold text-gray-900">
                Select your product catalog CSV
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Columns supported: <code>name</code>, <code>price</code>, <code>cost_price</code>, <code>category</code>, <code>stock_qty</code>, <code>sku</code>, <code>supplier_ref</code>, <code>image_urls</code>
              </p>

              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-gray-800 transition-colors">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                Browse CSV File
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-bold uppercase text-gray-500">
                    Total Rows Parsed
                  </div>
                  <div className="text-2xl font-black text-gray-900 mt-1">
                    {parsedRows.length}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Valid & Ready
                  </div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    {validRows.length}
                  </div>
                </div>

                <div
                  className={`rounded-xl border p-4 ${
                    invalidRows.length > 0
                      ? 'border-red-200 bg-red-50/60 text-red-900'
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Errors Detected
                  </div>
                  <div className="text-2xl font-black mt-1">
                    {invalidRows.length}
                  </div>
                </div>
              </div>

              {/* Rows Preview Table */}
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5">Row</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5">Name</th>
                        <th className="px-3 py-2.5">Price</th>
                        <th className="px-3 py-2.5">Cost</th>
                        <th className="px-3 py-2.5">Category</th>
                        <th className="px-3 py-2.5">Stock</th>
                        <th className="px-3 py-2.5">Supplier Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedRows.map((row) => (
                        <tr
                          key={row.rawIndex}
                          className={
                            row.isValid ? 'hover:bg-gray-50' : 'bg-red-50/40 hover:bg-red-50/60'
                          }
                        >
                          <td className="px-3 py-2 font-mono text-gray-500">
                            #{row.rawIndex}
                          </td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                ✓ Valid
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full"
                                title={row.errors.join(', ')}
                              >
                                ✕ {row.errors[0]}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-900 max-w-[200px] truncate">
                            {row.name || <em className="text-gray-400">Empty</em>}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {row.price > 0 ? `৳${row.price}` : <span className="text-red-600 font-bold">0</span>}
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-500">
                            {row.cost_price ? `৳${row.cost_price}` : '—'}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {row.category || 'General'}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {row.stock_qty}
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-500 max-w-[120px] truncate">
                            {row.supplier_ref || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Error instructions */}
              {invalidRows.length > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3 border border-amber-200">
                  ⚠️ <strong>{invalidRows.length} invalid row(s)</strong> have errors and will be safely skipped. Only the <strong>{validRows.length} valid row(s)</strong> will be imported.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div>
            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setParsedRows([])
                  setFile(null)
                }}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline"
              >
                Choose another file
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validRows.length === 0 || importing}
              onClick={handleImport}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-xs"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing {validRows.length} Products...</span>
                </>
              ) : (
                <>
                  <span>Import {validRows.length} Products</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
