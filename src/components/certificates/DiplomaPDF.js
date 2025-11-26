// src/components/certificates/DiplomaPDF.js
import jsPDF from "jspdf";

export default function generateDiplomaPDF(certificate, student) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "A4",
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background beige
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Gold borders
  doc.setDrawColor(250, 0, 0);
  doc.setLineWidth(8);
  doc.rect(30, 30, width - 60, height - 60);

  doc.setDrawColor(255, 40, 40);
  doc.setLineWidth(2);
  doc.rect(50, 50, width - 100, height - 100);

  // Academy name
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.setTextColor(201, 0, 0);
  doc.text("ASMiL ACADEMY", width / 2, 120, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(80, 30, 30);
  doc.text("Institut Supérieur Professionnel", width / 2, 150, { align: "center" });

  doc.setDrawColor(180, 0, 0);
  doc.setLineWidth(1.5);
  doc.line(200, 165, width - 200, 165);

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(50);
  doc.setTextColor(0, 0, 0);
  doc.text("DIPLÔME OFFICIEL", width / 2, 230, { align: "center" });

  // Subtitle
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.text("Certificat d'Aptitude et de Réussite", width / 2, 260, { align: "center" });

  // Student Name
  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.text(`${student.first_name} ${student.last_name}`, width / 2, 330, {
    align: "center",
  });

  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.text("a officiellement complété la formation :", width / 2, 370, { align: "center" });

  // Formation Title
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.text(certificate.formation_title, width / 2, 415, { align: "center" });

  // Grade + presence
  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.text(
    `Note : ${certificate.grade}/20     |     Présence : ${certificate.attendance_rate}%`,
    width / 2,
    460,
    { align: "center" }
  );

  // Dates
  doc.text(
    `Émis le : ${certificate.issue_date}     •     Fin de formation : ${certificate.completion_date}`,
    width / 2,
    490,
    { align: "center" }
  );

  // SIGNATURE ZONE
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("Directeur Général ASMiL", 120, height - 180);

  doc.setFont("times", "normal");
  doc.text("__________________________", 120, height - 170);

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.text("Signature officielle", 120, height - 150);

  // SEAL (Official Stamp)
  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(3);
  doc.circle(width - 200, height - 150, 45);

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(200, 0, 0);
  doc.text("ASMiL", width - 200, height - 155, { align: "center" });
  doc.text("ACADEMY", width - 200, height - 135, { align: "center" });

  // Footer (legal notice)
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(
    "ASMiL Academy — Diplôme officiel. Toute reproduction non autorisée est interdite.",
    width / 2,
    height - 40,
    { align: "center" }
  );

  doc.save(`Diplome-${student.first_name}-${student.last_name}.pdf`);
}
