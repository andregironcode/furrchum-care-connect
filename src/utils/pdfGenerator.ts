
import jsPDF from 'jspdf';

interface PrescriptionPDFData {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  diagnosis?: string;
  prescribed_date: string;
  status: string;
  pet_name: string;
  vet_name: string;
}

export const generatePrescriptionPDF = (prescription: PrescriptionPDFData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Prescription', 105, 20, { align: 'center' });
  
  // Prescription details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = 40;
  const lineHeight = 8;
  
  // Pet and Vet info
  doc.setFont('helvetica', 'bold');
  doc.text('Pet:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.pet_name, 50, yPosition);
  
  yPosition += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Prescribed by:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.vet_name, 50, yPosition);
  
  yPosition += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(prescription.prescribed_date).toLocaleDateString(), 50, yPosition);
  
  yPosition += lineHeight * 2;
  
  // Medication details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Medication Details', 20, yPosition);
  yPosition += lineHeight * 1.5;
  
  doc.setFontSize(12);
  doc.text('Medication:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.medication_name, 50, yPosition);
  
  yPosition += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Dosage:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.dosage, 50, yPosition);
  
  yPosition += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Frequency:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.frequency, 50, yPosition);
  
  yPosition += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Duration:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.duration, 50, yPosition);
  
  yPosition += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.status, 50, yPosition);
  
  // Diagnosis
  if (prescription.diagnosis) {
    yPosition += lineHeight * 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', 20, yPosition);
    yPosition += lineHeight;
    doc.setFont('helvetica', 'normal');
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, 170);
    doc.text(diagnosisLines, 20, yPosition);
    yPosition += diagnosisLines.length * lineHeight;
  }
  
  // Instructions
  if (prescription.instructions) {
    yPosition += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Instructions:', 20, yPosition);
    yPosition += lineHeight;
    doc.setFont('helvetica', 'normal');
    const instructionLines = doc.splitTextToSize(prescription.instructions, 170);
    doc.text(instructionLines, 20, yPosition);
  }
  
  // Footer
  yPosition = 280;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('This prescription was generated electronically.', 105, yPosition, { align: 'center' });
  
  // Download the PDF
  doc.save(`prescription-${prescription.pet_name}-${prescription.medication_name}.pdf`);
};
