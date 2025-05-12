
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports a React component to PDF
 * @param {string} filename - Name of the PDF file
 * @param {HTMLElement} element - DOM element to export
 */
export const exportToPDF = async (filename: string, element: HTMLElement) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
    });
    
    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Add additional pages if content overflows
    let heightLeft = imgHeight;
    let position = 0;
    
    while (heightLeft > pageHeight) {
      position = heightLeft - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
