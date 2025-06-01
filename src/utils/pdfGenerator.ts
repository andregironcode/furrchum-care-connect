import jsPDF from 'jspdf';

interface PrescriptionPDFData {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  diagnosis?: string | null;
  prescribed_date: string;
  status: string;
  pet: {
    name: string;
    type: string;
    breed?: string;
    age?: number;
    weight?: number;
  };
  vet: {
    first_name: string;
    last_name: string;
    clinic_location?: string;
  };
  owner?: {
    full_name?: string;
  };
}

export const generatePrescriptionPDF = (prescription: PrescriptionPDFData) => {
  const doc = new jsPDF();
  
  // Set margins and basic positioning
  const leftMargin = 20;
  const rightMargin = 190;
  let yPosition = 20;
  const lineHeight = 7;
  
  // Helper function to add text with automatic line wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, fontStyle: string = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Doctor name and address
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Dr. ${prescription.vet.first_name} ${prescription.vet.last_name}`, leftMargin, yPosition);
  
  yPosition += lineHeight;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  if (prescription.vet.clinic_location) {
    yPosition = addWrappedText(`Address: ${prescription.vet.clinic_location}`, leftMargin, yPosition, rightMargin - leftMargin);
  }
  
  yPosition += lineHeight * 2;

  // Date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const formattedDate = new Date(prescription.prescribed_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.text(`Date: ${formattedDate}`, leftMargin, yPosition);
  
  yPosition += lineHeight * 2;

  // Pet details line
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let petDetailsText = `Pet Name: ${prescription.pet.name} | Species: ${prescription.pet.type}`;
  
  if (prescription.pet.breed) {
    petDetailsText += ` | Breed: ${prescription.pet.breed}`;
  }
  
  if (prescription.pet.age) {
    petDetailsText += ` | Age: ${prescription.pet.age} yrs`;
  }
  
  if (prescription.pet.weight) {
    petDetailsText += ` | Weight: ${prescription.pet.weight}kg`;
  }
  
  yPosition = addWrappedText(petDetailsText, leftMargin, yPosition, rightMargin - leftMargin);
  
  yPosition += lineHeight * 2;

  // Diagnosis section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Diagnosis:', leftMargin, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  if (prescription.diagnosis && prescription.diagnosis.trim()) {
    yPosition = addWrappedText(prescription.diagnosis, leftMargin, yPosition, rightMargin - leftMargin);
  }
  
  yPosition += lineHeight * 2;

  // Prescription section
  doc.setFont('helvetica', 'bold');
  doc.text('Prescription:', leftMargin, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  
  // Format prescription details
  let prescriptionText = prescription.medication_name;
  
  if (prescription.dosage) {
    prescriptionText += ` - ${prescription.dosage}`;
  }
  
  if (prescription.frequency) {
    prescriptionText += `, ${prescription.frequency}`;
  }
  
  if (prescription.duration) {
    prescriptionText += ` for ${prescription.duration}`;
  }
  
  yPosition = addWrappedText(prescriptionText, leftMargin, yPosition, rightMargin - leftMargin);
  
  yPosition += lineHeight * 2;

  // Instructions section
  doc.setFont('helvetica', 'bold');
  doc.text('Instructions:', leftMargin, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  if (prescription.instructions && prescription.instructions.trim()) {
    yPosition = addWrappedText(prescription.instructions, leftMargin, yPosition, rightMargin - leftMargin);
  }
  
  // Add space before disclaimer
  yPosition += lineHeight * 4;
  
  // Disclaimer
  const disclaimerText = `Disclaimer: This prescription is issued by a registered veterinarian after a remote video consultation. It is specific to the pet mentioned and must not be reused or modified. The vet assumes responsibility for clinical judgment. Furrchum facilitates the consultation platform but is not liable for medicine administration, reactions, or post-treatment outcomes. In case of any worsening symptoms, seek immediate in-person veterinary care.`;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  
  // Position disclaimer at the bottom of the page
  const disclaimerY = Math.max(yPosition, 240);
  addWrappedText(disclaimerText, leftMargin, disclaimerY, rightMargin - leftMargin, 10, 'italic');

  // Generate filename with date
  const dateStr = new Date(prescription.prescribed_date).toISOString().split('T')[0];
  const filename = `prescription-${prescription.pet.name}-${dateStr}.pdf`;
  
  // Download the PDF
  doc.save(filename);
};
