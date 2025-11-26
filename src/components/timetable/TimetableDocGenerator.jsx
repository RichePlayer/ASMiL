import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const generateTimetableDoc = (data) => {
  const { sessions, modules, formations, teachers, enrollments, daysOfWeek, getModuleName, getFormationName, getTeacherName, getEnrollmentCount, getScheduleForDay } = data;

  const docWindow = window.open("", "_blank");

  const docHTML = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <title>Emploi du Temps - ASMiL</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 2cm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000; background: white; }
    .document { max-width: 100%; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 4px solid #DC2626; padding-bottom: 20px; }
    .header h1 { font-size: 32pt; color: #DC2626; font-weight: bold; margin-bottom: 10px; }
    .header .subtitle { font-size: 11pt; color: #666; font-style: italic; }
    .header .date { font-size: 10pt; color: #666; margin-top: 10px; }
    .section-title { font-size: 16pt; font-weight: bold; color: #DC2626; margin: 30px 0 15px 0; padding-bottom: 5px; border-bottom: 2px solid #DC2626; }
    .day-section { margin-bottom: 30px; page-break-inside: avoid; }
    .day-header { background: #DC2626; color: white; padding: 10px 15px; font-size: 14pt; font-weight: bold; margin-bottom: 10px; }
    .schedule-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .schedule-table th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-weight: bold; font-size: 10pt; }
    .schedule-table td { border: 1px solid #cbd5e1; padding: 10px; font-size: 10pt; vertical-align: top; }
    .course-name { font-weight: bold; color: #1e293b; margin-bottom: 5px; }
    .formation-name { color: #64748b; font-size: 9pt; font-style: italic; }
    .time-slot { font-weight: bold; color: #DC2626; white-space: nowrap; }
    .teacher-info { color: #475569; }
    .room-info { color: #475569; font-weight: 600; }
    .students-count { color: #16a34a; font-weight: bold; }
    .summary { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin-top: 30px; page-break-inside: avoid; }
    .summary h3 { color: #92400e; margin-bottom: 10px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 10px; }
    .summary-item { text-align: center; }
    .summary-value { font-size: 24pt; font-weight: bold; color: #DC2626; }
    .summary-label { font-size: 9pt; color: #666; margin-top: 5px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 9pt; }
    .no-courses { text-align: center; padding: 30px; color: #94a3b8; font-style: italic; }
    @media print {
      .no-print { display: none; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="header">
      <h1>EMPLOI DU TEMPS</h1>
      <p class="subtitle">ASMiL - Centre de Formation</p>
      <p class="subtitle">Admission • Ménage, Innovation et Leadership</p>
      <p class="date">Généré le ${format(new Date(), "d MMMM yyyy à HH:mm", { locale: fr })}</p>
    </div>

    <div class="summary">
      <h3>📊 Résumé Hebdomadaire</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-value">${sessions.filter(s => s.status === "en cours").length}</div>
          <div class="summary-label">Sessions Actives</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formations.length}</div>
          <div class="summary-label">Formations</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${teachers.length}</div>
          <div class="summary-label">Enseignants</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${enrollments.filter(e => e.status === "actif").length}</div>
          <div class="summary-label">Étudiants Actifs</div>
        </div>
      </div>
    </div>

    ${daysOfWeek.map(day => {
      const daySchedule = getScheduleForDay(day);
      return `
        <div class="day-section">
          <div class="day-header">📅 ${day} - ${daySchedule.length} cours</div>

          ${daySchedule.length === 0 ? `
            <div class="no-courses">Aucun cours planifié pour ce jour</div>
          ` : `
            <table class="schedule-table">
              <thead>
                <tr>
                  <th style="width: 15%;">Horaire</th>
                  <th style="width: 30%;">Formation / Module</th>
                  <th style="width: 20%;">Enseignant</th>
                  <th style="width: 15%;">Salle</th>
                  <th style="width: 20%;">Étudiants</th>
                </tr>
              </thead>
              <tbody>
                ${daySchedule.map(item => `
                  <tr>
                    <td class="time-slot">
                      🕐 ${item.start_time}<br>
                      → ${item.end_time}
                    </td>
                    <td>
                      <div class="course-name">${getModuleName(item.module_id)}</div>
                      <div class="formation-name">${getFormationName(item.module_id)}</div>
                    </td>
                    <td class="teacher-info">
                      👤 ${getTeacherName(item.teacher_id) || 'Non assigné'}
                    </td>
                    <td class="room-info">
                      📍 ${item.room || 'N/A'}
                    </td>
                    <td class="students-count">
                      👥 ${getEnrollmentCount(item.id)} inscrits<br>
                      <span style="color: #64748b; font-size: 9pt;">sur ${item.capacity || 'N/A'} places</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      `;
    }).join('')}

    <div class="footer">
      <p><strong>ASMiL - Centre de Formation</strong></p>
      <p>Document généré automatiquement • ${format(new Date(), "d MMMM yyyy", { locale: fr })}</p>
    </div>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 30px; padding: 20px;">
    <button onclick="window.print()" style="background: #DC2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-right: 10px; font-weight: bold;">
      📄 Imprimer / Sauvegarder en DOC
    </button>
    <button onclick="window.close()" style="background: #64748b; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;">
      Fermer
    </button>
    <p style="margin-top: 15px; color: #64748b; font-size: 12px;">
      💡 Pour sauvegarder en .doc : Fichier → Enregistrer sous → Format: Document Word (.doc)
    </p>
  </div>
</body>
</html>
  `;

  docWindow.document.write(docHTML);
  docWindow.document.close();
};
export default generateTimetableDoc;
