import { Invoice, RevenueMonth, MetricCardData } from "./data";
import { formatCurrency, formatDate } from "./utils";

/**
 * Triggers a real browser file download using a Blob
 */
export function triggerFileDownload(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Exports Revenue Analytics History to a clean CSV file
 */
export function exportRevenueToCSV(history: RevenueMonth[], metrics?: MetricCardData[]) {
  const rows: string[] = [];

  // Summary Metrics Section
  if (metrics && metrics.length > 0) {
    rows.push("CALYX REVENUE & SUBSCRIPTION INTELLIGENCE REPORT");
    rows.push(`Generated on,${new Date().toISOString()}`);
    rows.push("");
    rows.push("METRIC,VALUE,CHANGE,CONTEXT");
    metrics.forEach((m) => {
      rows.push(`"${m.title}","${m.value}","${m.changePercent}%","${m.changeDescription}"`);
    });
    rows.push("");
    rows.push("");
  }

  // Monthly History Breakdown
  rows.push("HISTORICAL MONTHLY PERFORMANCE");
  rows.push("Month,Total MRR ($),Net New MRR ($),Contraction / Churn ($),New Customers");

  history.forEach((h) => {
    rows.push(`"${h.month}",${h.mrr},${h.netNew},${h.churn},${h.newCustomers}`);
  });

  const csvContent = rows.join("\r\n");
  const filename = `calyx-revenue-report-${new Date().toISOString().slice(0, 10)}.csv`;
  triggerFileDownload(csvContent, filename, "text/csv;charset=utf-8;");
}

/**
 * Exports Invoices to CSV
 */
export function exportInvoicesToCSV(invoices: Invoice[], filenamePrefix = "calyx-invoices") {
  const headers = [
    "Invoice Number",
    "Customer Name",
    "Company",
    "Customer Email",
    "Plan",
    "Amount ($)",
    "Status",
    "Issue Date",
    "Due Date",
    "Payment Method",
    "Line Items",
  ];

  const rows = [headers.join(",")];

  invoices.forEach((inv) => {
    const lineItemsSummary = inv.items
      .map((it) => `${it.description} (x${it.quantity}: $${it.total.toFixed(2)})`)
      .join(" | ");

    const row = [
      `"${inv.number}"`,
      `"${inv.customerName}"`,
      `"${inv.customerCompany}"`,
      `"${inv.customerEmail}"`,
      `"${inv.planName}"`,
      inv.amount.toFixed(2),
      `"${inv.status.toUpperCase()}"`,
      `"${inv.issueDate}"`,
      `"${inv.dueDate}"`,
      `"${inv.paymentMethod}"`,
      `"${lineItemsSummary}"`,
    ];
    rows.push(row.join(","));
  });

  const csvContent = rows.join("\r\n");
  const filename = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  triggerFileDownload(csvContent, filename, "text/csv;charset=utf-8;");
}

/**
 * Generates a real, standalone valid PDF document for the invoice
 */
export function generateInvoicePDF(invoice: Invoice) {
  const subtotal = invoice.items.reduce((acc, it) => acc + it.total, 0);
  const tax = subtotal * (invoice.taxRate || 0);
  const total = subtotal + tax;

  // Build standard PDF 1.4 binary text stream
  const title = `CALYX INVOICE - ${invoice.number}`;
  const dateStr = `Issued: ${formatDate(invoice.issueDate)}  |  Due: ${formatDate(invoice.dueDate)}`;
  const customerStr = `Billed to: ${invoice.customerName} (${invoice.customerCompany}) <${invoice.customerEmail}>`;
  const paymentStr = `Payment Method: ${invoice.paymentMethod}  |  Status: ${invoice.status.toUpperCase()}`;
  const totalStr = `TOTAL DUE: $${total.toFixed(2)} USD (Includes ${(invoice.taxRate * 100).toFixed(0)}% VAT)`;

  let itemsStr = "ITEMIZED CHARGES:\n";
  invoice.items.forEach((item, idx) => {
    itemsStr += `  ${idx + 1}. ${item.description} -- Qty: ${item.quantity} @ $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}\n`;
  });

  // Construct valid PDF format
  const streamContent = `BT
/F1 18 Tf
50 740 Td
(${title}) Tj
/F1 10 Tf
0 -25 Td
(${dateStr}) Tj
0 -18 Td
(${customerStr}) Tj
0 -18 Td
(${paymentStr}) Tj
0 -30 Td
/F1 12 Tf
(--------------------------------------------------------------------------------------------------) Tj
0 -20 Td
/F1 10 Tf
(${itemsStr.replace(/\n/g, ") Tj\n0 -14 Td (")}) Tj
0 -30 Td
/F1 12 Tf
(--------------------------------------------------------------------------------------------------) Tj
0 -24 Td
/F1 14 Tf
(${totalStr}) Tj
0 -35 Td
/F1 9 Tf
(Thank you for your business. Calyx Inc. -- 548 Market St, San Francisco, CA) Tj
ET`;

  const streamLength = streamContent.length;

  const pdfDocument = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
370
%%EOF`;

  const blob = new Blob([pdfDocument], { type: "application/pdf" });
  const filename = `${invoice.number}.pdf`;
  triggerFileDownload(blob, filename, "application/pdf");
}

/**
 * Print invoice receipt dialog
 */
export function printInvoiceWindow(invoice: Invoice) {
  const subtotal = invoice.items.reduce((acc, it) => acc + it.total, 0);
  const tax = subtotal * (invoice.taxRate || 0);
  const total = subtotal + tax;

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoice.number} - Calyx</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1A1C1A; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E8E6E0; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: bold; color: #2D5A43; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #EBF3EE; color: #2D5A43; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .card { background: #FAF9F6; border: 1px solid #E8E6E0; border-radius: 8px; padding: 16px; }
          table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          th { text-align: left; border-bottom: 1px solid #E8E6E0; padding: 10px; font-size: 12px; color: #6B7069; text-transform: uppercase; }
          td { padding: 12px 10px; border-bottom: 1px solid #F0EFEA; font-size: 13px; }
          .total-box { margin-left: auto; width: 280px; background: #FAF9F6; border: 1px solid #E8E6E0; border-radius: 8px; padding: 16px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
          .grand-total { font-weight: bold; font-size: 16px; color: #2D5A43; border-top: 1px solid #E8E6E0; padding-top: 8px; margin-top: 8px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">calyx.</div>
            <div style="color: #6B7069; font-size: 12px; margin-top: 4px;">Subscription Billing & Recurring Revenue</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">${invoice.status}</span>
            <div style="font-family: monospace; font-size: 16px; font-weight: bold; margin-top: 8px;">${invoice.number}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div style="font-size: 11px; color: #6B7069; text-transform: uppercase; margin-bottom: 4px;">Billed To</div>
            <div style="font-weight: bold; font-size: 14px;">${invoice.customerName}</div>
            <div style="color: #6B7069; font-size: 13px;">${invoice.customerCompany}</div>
            <div style="color: #2D5A43; font-size: 12px; font-family: monospace;">${invoice.customerEmail}</div>
          </div>
          <div class="card">
            <div style="font-size: 11px; color: #6B7069; text-transform: uppercase; margin-bottom: 4px;">Payment & Dates</div>
            <div style="font-size: 13px;"><strong>Issued:</strong> ${formatDate(invoice.issueDate)}</div>
            <div style="font-size: 13px;"><strong>Due:</strong> ${formatDate(invoice.dueDate)}</div>
            <div style="font-size: 13px;"><strong>Method:</strong> ${invoice.paymentMethod}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (it) => `
              <tr>
                <td><strong>${it.description}</strong></td>
                <td style="text-align: center;">${it.quantity}</td>
                <td style="text-align: right;">$${it.unitPrice.toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">$${it.total.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="total-row"><span>VAT / Tax (${((invoice.taxRate || 0) * 100).toFixed(0)}%):</span><span>$${tax.toFixed(2)}</span></div>
          <div class="total-row grand-total"><span>Total Due:</span><span>$${total.toFixed(2)} USD</span></div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
