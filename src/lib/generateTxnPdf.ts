import jsPDF from "jspdf";
import "jspdf-autotable";

interface Transaction {
  amount: string;
  date: string;
  from: string;
  gasFee: string;
  id: string;
  time: string;
  to: string;
  tokenType: string;
  type: string;
}

export const generatePDF = (transactions: Transaction[] | undefined, userName: string, userAddress: string | null) => {
  // Initialize PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const margin = 20;
  let yPos = margin;

  // Brand colors
  const primaryBlue = hex2Rgb("#1199fa");
  const gradientBlue = hex2Rgb("#3b82f6"); // blue-500
  const customBlue = hex2Rgb("#09162e");
  const white = hex2Rgb("#ffffff");

  // Add brand logo with proper styling
  const logoWidth = 45;
  const logoHeight = 16;
  const logoX = doc.internal.pageSize.width - margin - logoWidth;
  const logoY = 10;

  // Create gradient-like background for the logo area
  doc.setFillColor(...customBlue);
  doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 3, 3, "F");

  // Add brand text with proper spacing and colors
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  // Draw "d" in brand blue
  doc.setTextColor(...primaryBlue);
  doc.text("d", logoX + 5, logoY + 11);

  // Draw "BKash" in white
  doc.setTextColor(...white);
  doc.text("BKash", logoX + 9, logoY + 11);

  // Main content area
  yPos += 15;
  doc.setFontSize(24);
  doc.setTextColor(...primaryBlue);
  doc.text("Transaction Statement", margin, yPos);

  // User Details Section
  yPos += 20;
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "bold");
  doc.text(userName, margin, yPos);

  // Wallet address
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(`Wallet: ${userAddress}`, margin, yPos);

  // Generation date
  yPos += 8;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);

  // Separator line
  yPos += 10;
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, doc.internal.pageSize.width - margin, yPos);

  // Table Configuration
  const tableColumn = [
    "Date",
    "Time",
    "Type",
    "From",
    "To",
    "Amount",
    "Token Type",
    "Gas Fee",
    "Txn ID",
  ];

  const tableRows = transactions?.map((txn) => [
    txn.date,
    txn.time,
    txn.type,
    truncateAddress(txn.from),
    truncateAddress(txn.to),
    txn.amount,
    txn.tokenType,
    txn.gasFee,
    truncateAddress(txn.id),
  ]);

  // Enhanced table styling
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: yPos + 5,
    margin: { top: 10, right: margin, bottom: 10, left: margin },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
      halign: "center",
      lineColor: [240, 240, 240],
      textColor: [60, 60, 60],
    },
    headStyles: {
      fillColor: gradientBlue,
      textColor: white,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 20 }, // Time
      2: { cellWidth: 25 }, // Type
      3: { cellWidth: 35 }, // From
      4: { cellWidth: 35 }, // To
      5: { cellWidth: 25, fontStyle: "bold", textColor: primaryBlue }, // Amount
      6: { cellWidth: 25 }, // Token Type
      7: { cellWidth: 20 }, // Gas Fee
      8: { cellWidth: 35 }, // ID
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // Footer with branding
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.height - 10;

    // Brand text in footer
    doc.setFontSize(9);
    doc.setTextColor(...primaryBlue);
    doc.setFont("helvetica", "bold");
    doc.text("d", margin, footerY);
    doc.setTextColor(90, 90, 90);
    doc.text("BKash", margin + 2, footerY);

    // Page numbers
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - margin,
      footerY,
      { align: "right" }
    );
  }

  // Save PDF with clean filename
  doc.save(
    `dBKash_Statement_${userName.replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`
  );
};

// Helper function to truncate long addresses
const truncateAddress = (address: string): string => {
  if (!address) return "";
  if (address.length <= 15) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Helper function to convert hex color to RGB array
const hex2Rgb = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};
