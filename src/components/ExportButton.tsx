
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { exportToPDF } from "@/utils/pdfUtils";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/Spinner";

interface ExportButtonProps {
  data: {
    state: string;
    city: string;
    zipCode: string;
    address: string;
    scorePercentage: number | null;
    timestamp: string;
    amenities: any[];
  };
}

const ExportButton = ({ data }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Create a temporary div to render the report
      const reportContainer = document.createElement("div");
      reportContainer.className = "qap-report";
      reportContainer.style.width = "800px";
      reportContainer.style.padding = "40px";
      reportContainer.style.fontFamily = "Arial, sans-serif";
      
      // Create report content
      reportContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin-bottom: 5px;">LIHTC QAP Score Report</h1>
          <p style="color: #666; font-size: 14px;">${data.timestamp}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 15px;">Location Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Address:</td>
              <td style="padding: 8px 0;">${data.address}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold;">City:</td>
              <td style="padding: 8px 0;">${data.city}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold;">State:</td>
              <td style="padding: 8px 0;">${data.state}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold;">ZIP Code:</td>
              <td style="padding: 8px 0;">${data.zipCode}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 15px;">QAP Score</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; text-align: center;">
            <p style="font-size: 16px; margin-bottom: 10px;">Your LIHTC QAP Score Percentage</p>
            <p style="font-size: 36px; font-weight: bold; color: #2563eb;">${data.scorePercentage?.toFixed(2)}%</p>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 15px;">Nearby Amenities</h2>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee;">
            <tr style="background-color: #f9fafb;">
              <th style="text-align: left; padding: 10px;">Type</th>
              <th style="text-align: left; padding: 10px;">Name</th>
              <th style="text-align: right; padding: 10px;">Distance (km)</th>
            </tr>
            ${data.amenities.map(amenity => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${amenity.type.replace('_', ' ')}</td>
                <td style="padding: 10px;">${amenity.name}</td>
                <td style="padding: 10px; text-align: right;">${amenity.distance}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        
        <div style="font-size: 12px; color: #666; text-align: center; margin-top: 40px;">
          <p>This report was generated for informational purposes only.</p>
          <p>© ${new Date().getFullYear()} LIHTC QAP Calculator</p>
        </div>
      `;
      
      // Append to body temporarily (not visible)
      reportContainer.style.position = "absolute";
      reportContainer.style.left = "-9999px";
      document.body.appendChild(reportContainer);
      
      // Export to PDF
      const success = await exportToPDF(`${data.state}_QAP_Report.pdf`, reportContainer);
      
      // Remove temporary element
      document.body.removeChild(reportContainer);
      
      if (success) {
        toast({
          title: "Export Successful",
          description: "Your QAP report has been exported as a PDF file."
        });
      } else {
        throw new Error("PDF export failed");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "PDF functionality is currently disabled.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting || !data.scorePercentage}
      className="w-full mt-2"
    >
      {isExporting ? <Spinner /> : "Export Report as PDF"}
    </Button>
  );
};

export default ExportButton;
