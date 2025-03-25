"use client"

import React, { useState, useRef } from 'react'
import { PlusCircle, Trash2, Download, Image, Plus } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface CustomField {
  id: string
  title: string
  content: string
}

export default function InvoiceGenerator() {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [companyName, setCompanyName] = useState("Company name")
  const [companyDetails, setCompanyDetails] = useState("Add your company details")
  const [invoiceTitle, setInvoiceTitle] = useState("INVOICE")
  const [showLogoOptions, setShowLogoOptions] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)

  const [billTo, setBillTo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  })

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: `#INV${Math.floor(Math.random() * 1000)}`,
    invoiceDate: new Date().toLocaleDateString(),
    dueDate: new Date().toLocaleDateString(),
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    },
  ])

  const [taxRate, setTaxRate] = useState(10)
  const [paymentInfo, setPaymentInfo] = useState({
    account: "",
    accountName: "",
    bankDetails: "",
  })
  const [termsAndConditions, setTermsAndConditions] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  )

  const [customFields, setCustomFields] = useState<CustomField[]>([])

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          if (field === "quantity" || field === "rate") {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate)
          }

          return updatedItem
        }
        return item
      })
    )
  }

  const addNewRow = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ])
  }

  const removeRow = (id: string) => {
    if (items.length > 1) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogo(event.target?.result as string)
        setShowLogoOptions(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogo(null)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      {
        id: Date.now().toString(),
        title: "Custom Field",
        content: "",
      },
    ])
  }

  const updateCustomField = (id: string, field: keyof CustomField, value: string) => {
    setCustomFields(
      customFields.map((customField) => (customField.id === id ? { ...customField, [field]: value } : customField))
    )
  }

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter((field) => field.id !== id))
  }

  const generatePDF = () => {
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set initial position
    let y = 20
    const margin = 20
    const pageWidth = pdf.internal.pageSize.getWidth()
    const contentWidth = pageWidth - margin * 2

    // Add invoice title
    pdf.setFontSize(24)
    pdf.setFont("helvetica", "bold")
    pdf.text(invoiceTitle, margin, y)
    y += 10

    // Add company info
    if (logo) {
      pdf.addImage(logo, "JPEG", margin, y, 40, 20)
      y += 25
    }

    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text(companyName, margin, y)
    y += 6

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    // Split company details into lines
    const companyDetailsLines = pdf.splitTextToSize(companyDetails, 80)
    pdf.text(companyDetailsLines, margin, y)
    y += companyDetailsLines.length * 5 + 5

    // Add billed to section
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("BILLED TO:", pageWidth - margin - 80, 30)

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    let billingY = 35
    if (billTo.name) {
      pdf.text(billTo.name, pageWidth - margin - 80, billingY)
      billingY += 5
    }

    if (billTo.address) {
      pdf.text(billTo.address, pageWidth - margin - 80, billingY)
      billingY += 5
    }

    let cityStateZip = ""
    if (billTo.city) cityStateZip += billTo.city
    if (billTo.state) cityStateZip += cityStateZip ? `, ${billTo.state}` : billTo.state
    if (billTo.zip) cityStateZip += cityStateZip ? ` ${billTo.zip}` : billTo.zip

    if (cityStateZip) {
      pdf.text(cityStateZip, pageWidth - margin - 80, billingY)
      billingY += 5
    }

    if (billTo.country) {
      pdf.text(billTo.country, pageWidth - margin - 80, billingY)
    }

    // Add invoice details
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")

    let invoiceDetailsY = Math.max(y, billingY + 15)

    pdf.text("Invoice No:", pageWidth - margin - 80, invoiceDetailsY)
    pdf.setFont("helvetica", "normal")
    pdf.text(invoiceDetails.invoiceNumber, pageWidth - margin - 20, invoiceDetailsY, { align: "right" })
    invoiceDetailsY += 6

    pdf.setFont("helvetica", "bold")
    pdf.text("Invoice Date:", pageWidth - margin - 80, invoiceDetailsY)
    pdf.setFont("helvetica", "normal")
    pdf.text(invoiceDetails.invoiceDate, pageWidth - margin - 20, invoiceDetailsY, { align: "right" })
    invoiceDetailsY += 6

    pdf.setFont("helvetica", "bold")
    pdf.text("Due Date:", pageWidth - margin - 80, invoiceDetailsY)
    pdf.setFont("helvetica", "normal")
    pdf.text(invoiceDetails.dueDate, pageWidth - margin - 20, invoiceDetailsY, { align: "right" })

    y = Math.max(y, invoiceDetailsY + 15)

    // Add items table
    pdf.setFillColor(240, 240, 240)
    pdf.rect(margin, y, contentWidth, 8, "F")

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text("Item Description", margin + 5, y + 5.5)
    pdf.text("Qty", margin + contentWidth * 0.6, y + 5.5)
    pdf.text("Rate", margin + contentWidth * 0.7, y + 5.5)
    pdf.text("Amount", margin + contentWidth * 0.85, y + 5.5)

    y += 8

    // Add item rows
    pdf.setFont("helvetica", "normal")
    items.forEach((item) => {
      const descriptionLines = pdf.splitTextToSize(item.description || "Item description", contentWidth * 0.55)

      pdf.text(descriptionLines, margin + 5, y + 5)
      pdf.text(item.quantity.toString(), margin + contentWidth * 0.6, y + 5)
      pdf.text(item.rate.toFixed(2), margin + contentWidth * 0.7, y + 5)
      pdf.text(item.amount.toFixed(2), margin + contentWidth * 0.85, y + 5)

      const lineHeight = Math.max(descriptionLines.length * 5, 8)
      y += lineHeight

      // Add line
      pdf.setDrawColor(220, 220, 220)
      pdf.line(margin, y, margin + contentWidth, y)
      y += 2
    })

    y += 5

    // Add payment info
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("Payment Info:", margin, y)
    y += 8

    pdf.setFontSize(10)
    if (paymentInfo.account) {
      pdf.setFont("helvetica", "bold")
      pdf.text("Account:", margin, y)
      pdf.setFont("helvetica", "normal")
      pdf.text(paymentInfo.account, margin + 30, y)
      y += 6
    }

    if (paymentInfo.accountName) {
      pdf.setFont("helvetica", "bold")
      pdf.text("A/C Name:", margin, y)
      pdf.setFont("helvetica", "normal")
      pdf.text(paymentInfo.accountName, margin + 30, y)
      y += 6
    }

    if (paymentInfo.bankDetails) {
      pdf.setFont("helvetica", "bold")
      pdf.text("Bank Details:", margin, y)
      pdf.setFont("helvetica", "normal")
      pdf.text(paymentInfo.bankDetails, margin + 30, y)
      y += 6
    }

    // Add totals
    const totalsX = pageWidth - margin - 80
    let totalsY = y - 20

    pdf.setFont("helvetica", "bold")
    pdf.text("Sub Total", totalsX, totalsY)
    pdf.setFont("helvetica", "normal")
    pdf.text(calculateSubtotal().toFixed(2), pageWidth - margin, totalsY, { align: "right" })
    totalsY += 6

    pdf.setFont("helvetica", "bold")
    pdf.text(`Tax (${taxRate}%)`, totalsX, totalsY)
    pdf.setFont("helvetica", "normal")
    pdf.text(calculateTax().toFixed(2), pageWidth - margin, totalsY, { align: "right" })
    totalsY += 6

    pdf.setFillColor(240, 240, 240)
    pdf.rect(totalsX - 5, totalsY - 5, 85, 8, "F")

    pdf.setFont("helvetica", "bold")
    pdf.text("Total", totalsX, totalsY)
    pdf.text(calculateTotal().toFixed(2), pageWidth - margin, totalsY, { align: "right" })

    y = Math.max(y, totalsY + 15)

    // Add terms and conditions
    if (termsAndConditions) {
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("Terms & Conditions", margin, y)
      y += 6

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      const termsLines = pdf.splitTextToSize(termsAndConditions, contentWidth)
      pdf.text(termsLines, margin, y)
      y += termsLines.length * 5 + 10
    }

    // Add custom fields
    if (customFields.length > 0) {
      customFields.forEach((field) => {
        if (field.title || field.content) {
          // Check if we need a new page
          if (y > pdf.internal.pageSize.getHeight() - 30) {
            pdf.addPage()
            y = 20
          }

          if (field.title) {
            pdf.setFontSize(12)
            pdf.setFont("helvetica", "bold")
            pdf.text(field.title, margin, y)
            y += 6
          }

          if (field.content) {
            pdf.setFontSize(10)
            pdf.setFont("helvetica", "normal")
            const contentLines = pdf.splitTextToSize(field.content, contentWidth)
            pdf.text(contentLines, margin, y)
            y += contentLines.length * 5 + 10
          }
        }
      })
    }

    // Save the PDF
    pdf.save(`invoice-${invoiceDetails.invoiceNumber.replace("#", "")}.pdf`)
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div ref={invoiceRef} className="bg-white p-8 rounded-lg">
          {/* Top Section: Company Info and Bill To */}
          <div className="flex justify-between items-start mb-8">
            {/* Company Info */}
            <div className="space-y-2">
              <h1
                className="text-3xl font-bold cursor-pointer"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setInvoiceTitle(e.currentTarget.textContent || "INVOICE")}
              >
                {invoiceTitle}
              </h1>
              
              {/* Logo Section */}
              <div className="relative">
                {logo ? (
                  <div className="relative mb-2">
                    <img 
                      src={logo || "/placeholder.svg"} 
                      alt="Company Logo" 
                      className="h-16 object-contain" 
                    />
                    <button 
                      onClick={removeLogo} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mb-2">
                    <button 
                      onClick={() => setShowLogoOptions(!showLogoOptions)}
                      className="flex items-center border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50"
                    >
                      <Image className="h-4 w-4 mr-2" /> Add Logo
                    </button>
                    {showLogoOptions && (
                      <div className="mt-2">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload} 
                          className="w-full border border-gray-300 p-2 rounded-md"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Company Name and Details */}
                <div
                  className="font-semibold text-lg cursor-pointer"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setCompanyName(e.currentTarget.textContent || "Company name")}
                >
                  {companyName}
                </div>
                <div
                  className="text-sm text-gray-500 cursor-pointer"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setCompanyDetails(e.currentTarget.textContent || "Add your company details")}
                >
                  {companyDetails}
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="space-y-1 w-1/3">
              <div className="text-right mb-2">
                <span className="font-semibold">BILLED TO :</span>
              </div>
              <div className="space-y-2">
                <input
                  value={billTo.name}
                  onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
                  placeholder="Client name"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                />
                <input
                  value={billTo.address}
                  onChange={(e) => setBillTo({ ...billTo, address: e.target.value })}
                  placeholder="Street address"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={billTo.city}
                    onChange={(e) => setBillTo({ ...billTo, city: e.target.value })}
                    placeholder="City"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  />
                  <input
                    value={billTo.state}
                    onChange={(e) => setBillTo({ ...billTo, state: e.target.value })}
                    placeholder="State/Province"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={billTo.zip}
                    onChange={(e) => setBillTo({ ...billTo, zip: e.target.value })}
                    placeholder="ZIP/Postal code"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  />
                  <input
                    value={billTo.country}
                    onChange={(e) => setBillTo({ ...billTo, country: e.target.value })}
                    placeholder="Country"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div></div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Invoice No :</span>
                <input
                  value={invoiceDetails.invoiceNumber}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
                  className="w-32 text-right border border-gray-300 px-2 py-1 rounded-md"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Invoice Date :</span>
                <input
                  type="date"
                  value={invoiceDetails.invoiceDate}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceDate: e.target.value })}
                  className="w-32 text-right border border-gray-300 px-2 py-1 rounded-md"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Due Date :</span>
                <input
                  type="date"
                  value={invoiceDetails.dueDate}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })}
                  className="w-32 text-right border border-gray-300 px-2 py-1 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <div className="bg-gray-100 grid grid-cols-12 gap-2 p-3 rounded-t-md">
              <div className="col-span-5 font-semibold">Item Description</div>
              <div className="col-span-2 font-semibold text-center">Qty</div>
              <div className="col-span-2 font-semibold text-center">Rate</div>
              <div className="col-span-2 font-semibold text-center">Amount</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-2 border-b">
                <div className="col-span-5">
                  <input
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                    placeholder="Item description"
                    className="w-full border border-gray-300 px-2 py-1 rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                    min="1"
                    className="w-full text-center border border-gray-300 px-2 py-1 rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(item.id, "rate", Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full text-center border border-gray-300 px-2 py-1 rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <input 
                    value={item.amount.toFixed(2)} 
                    readOnly 
                    className="w-full text-center bg-gray-50 border border-gray-300 px-2 py-1 rounded-md" 
                  />
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  <button 
                    onClick={() => removeRow(item.id)} 
                    disabled={items.length === 1}
                    className="text-red-500 hover:bg-red-100 p-2 rounded-full disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button 
              onClick={addNewRow} 
              className="mt-4 w-full border border-dashed border-gray-300 py-2 rounded-md hover:bg-gray-50 flex items-center justify-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add new row
            </button>
          </div>

          {/* Payment Info and Totals */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-semibold mb-2">Payment Info :</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <label className="w-32">Account :</label>
                  <input
                    value={paymentInfo.account}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, account: e.target.value })}
                    className="flex-1 border border-gray-300 px-2 py-1 rounded-md"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-32">A/C Name :</label>
                  <input
                    value={paymentInfo.accountName}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, accountName: e.target.value })}
                    className="flex-1 border border-gray-300 px-2 py-1 rounded-md"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-32">Bank Details :</label>
                  <input
                    value={paymentInfo.bankDetails}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, bankDetails: e.target.value })}
                    className="flex-1 border border-gray-300 px-2 py-1 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Sub Total</span>
                <span>{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Tax</span>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-16 text-center border border-gray-300 px-2 py-1 rounded-md"
                  />
                  <span className="ml-1">%</span>
                </div>
                <span>{calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className="font-semibold">Total</span>
                <span className="font-bold">{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Terms & Conditions</h3>
            <textarea
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full h-24 border border-gray-300 px-3 py-2 rounded-md"
            />
          </div>

          {/* Custom Fields Section */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Custom Fields</h3>
            {customFields.length > 0 ? (
              <div className="space-y-4">
                {customFields.map((field) => (
                  <div key={field.id} className="border p-4 rounded-md relative">
                    <button
                      onClick={() => removeCustomField(field.id)}
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-2 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <label className="w-32">Title:</label>
                        <input
                          value={field.title}
                          onChange={(e) => updateCustomField(field.id, "title", e.target.value)}
                          placeholder="Field Title"
                          className="flex-1 border border-gray-300 px-2 py-1 rounded-md"
                        />
                      </div>
                      <div>
                        <label>Content:</label>
                        <textarea
                          value={field.content}
                          onChange={(e) => updateCustomField(field.id, "content", e.target.value)}
                          placeholder="Field Content"
                          className="w-full mt-1 border border-gray-300 px-2 py-1 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                No custom fields added yet. Click the button below to add one.
              </p>
            )}

            <button 
              onClick={addCustomField} 
              className="w-full mt-4 border border-gray-300 py-2 rounded-md hover:bg-gray-50 flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Custom Field
            </button>
          </div>

          {/* Preview of Custom Fields */}
          {customFields.length > 0 && (
            <div className="mb-6 p-4 border border-dashed rounded-md bg-gray-50">
              <h3 className="font-semibold mb-2">Custom Fields Preview (PDF)</h3>
              <div className="space-y-4">
                {customFields.map((field) => (
                  <div key={field.id} className="space-y-1">
                    {field.title && <h4 className="font-medium">{field.title}</h4>}
                    {field.content && <p className="text-sm whitespace-pre-wrap">{field.content}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download PDF Button */}
      <div className="flex justify-end">
        <button 
          onClick={generatePDF} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </button>
      </div>
    </div>
  )
}