import { jsPDF } from 'jspdf';

export const downloadSOAPAsPDF = (soapText: string, filename: string = 'Clinical_SOAP_Note.pdf') => {
  const doc = new jsPDF();
  
  // Set fonts and colors
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  
  // Title
  doc.text('Vineetra Clinical SOAP Note', 20, 20);
  
  // Divider line
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, 190, 25);
  
  // Timestamp
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleString();
  doc.text(`Generated on: ${dateStr}`, 20, 32);
  
  // Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  
  const lines = doc.splitTextToSize(soapText, 170);
  let y = 45;
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 0; i < lines.length; i++) {
    // Basic markdown bold parsing for **TEXT**
    const line = lines[i];
    if (line.startsWith('**') && line.endsWith('**')) {
      doc.setFont('helvetica', 'bold');
      const cleanLine = line.replace(/\*\*/g, '');
      doc.text(cleanLine, 20, y);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.text(line.replace(/\*\*/g, ''), 20, y);
    }
    
    y += 7;
    
    // Add new page if necessary
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  }
  
  doc.save(filename);
};
