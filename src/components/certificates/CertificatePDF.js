// src/components/certificates/CertificatePDF.js
import jsPDF from "jspdf";

export default function generateCertificatePDF(certificate, student) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "A4",
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Double border
  doc.setDrawColor(250, 0, 0);
  doc.setLineWidth(8);
  doc.rect(30, 30, width - 60, height - 60);

  doc.setDrawColor(255, 40, 40);
  doc.setLineWidth(2);
  doc.rect(50, 50, width - 100, height - 100);

  // Header ASMiL
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.setTextColor(201, 0, 0);
  doc.text("ASMiL ACADEMY", width / 2, 110, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(80, 30, 30);
  doc.text("Centre de Formation Professionnelle", width / 2, 135, {
    align: "center",
  });

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFont("times", "bold");
  doc.setFontSize(46);
  doc.text("CERTIFICAT DE RÉUSSITE", width / 2, 200, {
    align: "center",
  });

  // Student name
  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.text(`${student.first_name} ${student.last_name}`, width / 2, 270, {
    align: "center",
  });

  // Subtitle
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.text("a satisfait aux exigences de la formation :", width / 2, 305, {
    align: "center",
  });

  // Formation title
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.text(certificate.formation_title, width / 2, 345, {
    align: "center",
  });

  // Stats
  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.text(
    `Note finale : ${certificate.grade}/20    •    Présence : ${certificate.attendance_rate}%`,
    width / 2,
    380,
    { align: "center" }
  );

  doc.text(
    `Date d'émission : ${certificate.issue_date}`,
    width / 2,
    410,
    { align: "center" }
  );

  // Certification stamp
  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(3);
  doc.circle(width - 200, height - 150, 45);

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(200, 0, 0);
  doc.text("CERTIFIÉ", width - 200, height - 155, { align: "center" });
  doc.text("ASMiL", width - 200, height - 135, { align: "center" });

  // Signature
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Directeur de Formation", 120, height - 170);

  doc.setFont("times", "normal");
  doc.text("__________________________", 120, height - 160);

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.text("Signature officielle", 120, height - 140);

  // Footer
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    "ASMiL — Certificat de Réussite Officiel",
    width / 2,
    height - 40,
    { align: "center" }
  );

  // Save
  doc.save(`Certificat-${student.first_name}-${student.last_name}.pdf`);
}
