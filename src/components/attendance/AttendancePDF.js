import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Génère un PDF professionnel pour la feuille de présence
 * Style ASMiL (header rouge)
 */
export function generateAttendancePDF({
  session,
  date,
  enrollments,
  students,
  attendances,
}) {
  const doc = new jsPDF("p", "mm", "a4");

  // ===========================================
  //  🔴 HEADER ROUGE ASMiL
  // ===========================================
  doc.setFillColor(200, 0, 0);
  doc.rect(0, 0, 210, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("ASMiL - Feuille de Présence", 10, 14);

  // ===========================================
  //  📝 INFOS SESSION
  // ===========================================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const moduleName = session?.module_title || "Module inconnu";
  const room = session?.room || "-";

  doc.text(`Session : ${moduleName}`, 10, 32);
  doc.text(`Salle : ${room}`, 10, 38);

  doc.text(`Date : ${date}`, 140, 32);
  doc.text(`Total étudiants : ${enrollments.length}`, 140, 38);

  // ===========================================
  //  📄 TABLEAU PRINCIPAL
  // ===========================================
  const rows = enrollments.map((enr, index) => {
    const attendance = attendances.find(
      (a) => a.enrollment_id === enr.id && a.date === date
    );

    const student = students.find((s) => s.id === enr.student_id);
    const name = student
      ? `${student.first_name} ${student.last_name}`
      : "Étudiant inconnu";

    let status = attendance?.status || "présent";
    let note = attendance?.notes || "";

    // ajouter justification si retard
    if (status === "retard" && attendance?.justification) {
      note = `Justification: ${attendance.justification}`;
    }

    return [index + 1, name, capitalize(status), note || "-"];
  });

  autoTable(doc, {
    startY: 50,
    head: [["#", "Étudiant", "Statut", "Notes"]],
    body: rows,
    headStyles: {
      fillColor: [200, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { cellWidth: 75 },
      2: { halign: "center", cellWidth: 30 },
      3: { cellWidth: 70 },
    },
  });

  // ===========================================
  //  📌 PIED DE PAGE
  // ===========================================
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`ASMiL — Page ${i} / ${pageCount}`, 10, 295);
  }

  // ===========================================
  //  💾 EXPORT
  // ===========================================
  doc.save(`presence_${date}.pdf`);
}

// Helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
