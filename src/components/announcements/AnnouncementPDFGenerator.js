import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Génère un PDF Professionnel en ouvrant une nouvelle fenêtre
 * (l'utilisateur clique ensuite sur "Imprimer / Sauvegarder PDF").
 */
export const generateAnnouncementPDF = (announcement) => {
  const pdfWindow = window.open("", "_blank");

  const typeColors = {
    information: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
    urgent: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
    événement: { bg: "#FCE7F3", border: "#EC4899", text: "#831843" },
    "session ouverte": { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
  };

  const typeEmojis = {
    information: "ℹ️",
    urgent: "🚨",
    événement: "📅",
    "session ouverte": "🎓",
  };

  const colors = typeColors[announcement.type] || typeColors.information;
  const emoji = typeEmojis[announcement.type] || "📢";

  const publishDate = announcement.publish_date
    ? format(new Date(announcement.publish_date), "d MMMM yyyy", { locale: fr })
    : format(new Date(announcement.created_date), "d MMMM yyyy", { locale: fr });

  const expiry = announcement.expiry_date
    ? format(new Date(announcement.expiry_date), "d MMMM yyyy", { locale: fr })
    : null;

  // ---- HTML PDF TEMPLATE ----
  const pdfHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Annonce - ${announcement.title}</title>

    <style>
      @page { size: A4; margin: 0; }

      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        background: white;
      }

      .announcement {
        max-width: 800px;
        margin: 0 auto;
        border: 8px solid #DC2626;
        background: white;
      }

      .header {
        background: #DC2626;
        color: white;
        padding: 40px;
        text-align: center;
      }

      .header h1 {
        font-size: 48px;
        font-weight: bold;
        margin: 0;
      }

      .header p {
        margin: 8px 0 0;
        font-size: 16px;
        opacity: 0.9;
      }

      .content {
        padding: 40px;
      }

      .type-badge {
        display: inline-block;
        background: ${colors.bg};
        border: 3px solid ${colors.border};
        color: ${colors.text};
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 30px;
      }

      .title {
        font-size: 36px;
        font-weight: bold;
        color: #1e293b;
        margin-bottom: 20px;
      }

      .meta {
        display: flex;
        gap: 30px;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e2e8f0;
        color: #64748b;
        font-size: 14px;
      }

      .content-text {
        font-size: 18px;
        line-height: 1.8;
        color: #1e293b;
        white-space: pre-wrap;
      }

      .target-audience {
        background: #f8fafc;
        border-left: 4px solid #DC2626;
        padding: 20px;
        margin-top: 30px;
        font-size: 16px;
      }

      .dates-section {
        margin-top: 40px;
        padding: 20px;
        background: #fef3c7;
        border: 2px solid #f59e0b;
        border-radius: 8px;
      }

      .footer {
        text-align: center;
        color: #64748b;
        margin-top: 60px;
        padding-top: 30px;
        border-top: 2px solid #e2e8f0;
        font-size: 14px;
      }

      @media print {
        .no-print { display: none; }
        body { padding: 0; }
      }
    </style>
  </head>

  <body>
    <div class="announcement">
      <div class="header">
        <h1>ASMiL</h1>
        <p>Admission • Ménage, Innovation et Leadership</p>
      </div>

      <div class="content">
        <div class="type-badge">${emoji} ${announcement.type.toUpperCase()}</div>

        <h2 class="title">${announcement.title}</h2>

        <div class="meta">
          <div><strong>📅 Publié :</strong> ${publishDate}</div>
          ${
            expiry
              ? `<div><strong>⏰ Expire :</strong> ${expiry}</div>`
              : ""
          }
        </div>

        <div class="content-text">${announcement.content}</div>

        <div class="target-audience">
          <strong>🎯 Public Cible :</strong>
          ${
            announcement.target_audience === "tous"
              ? "Tous"
              : announcement.target_audience === "étudiants"
              ? "Étudiants"
              : "Formateurs"
          }
        </div>

        ${
          expiry
            ? `
          <div class="dates-section">
            <h3>⚠️ Information Temporaire</h3>
            <p>Cette annonce expire le ${expiry}</p>
          </div>`
            : ""
        }

        <div class="footer">
          <p><strong>ASMiL - Centre de Formation</strong></p>
          <p>Généré le ${format(
            new Date(),
            "d MMMM yyyy à HH:mm",
            { locale: fr }
          )}</p>
        </div>
      </div>
    </div>

    <div class="no-print" style="text-align:center;margin-top:30px;">
      <button onclick="window.print()" 
        style="background:#DC2626;color:white;padding:12px 24px;border:none;border-radius:8px;font-size:16px;cursor:pointer;margin-right:10px;">
        📄 Imprimer / Sauvegarder PDF
      </button>

      <button onclick="window.close()" 
        style="background:#64748b;color:white;padding:12px 24px;border:none;border-radius:8px;font-size:16px;cursor:pointer;">
        Fermer
      </button>
    </div>
  </body>
  </html>
  `;

  pdfWindow.document.write(pdfHTML);
  pdfWindow.document.close();
};
