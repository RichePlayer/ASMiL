// src/components/invoices/ReceiptGenerator.js
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * generateReceiptPDF(payment, invoice, studentName, logoPath)
 * Opens a new window containing a printable receipt (styled A4).
 * logoPath default -> "/src/assets/logo.jpg"
 */
export const generateReceiptPDF = (
  payment,
  invoice,
  studentName
) => {
  const createdAt = payment?.created_date ? new Date(payment.created_date) : new Date();
  const dateStr = format(createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr });

  const receiptHTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Reçu - ${payment?.id?.slice(0,8) || ""}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #fff; margin:0; }
    .container { max-width: 900px; margin: 0 auto; border: 6px solid #DC2626; padding: 0; background: white; }
    .header { background: #DC2626; color: white; padding: 16px 24px; display:flex; align-items:center; gap:16px; }
    .title { font-size: 20px; font-weight:800; letter-spacing:0.5px; }
    .small { font-size:12px; color:#f8fafc; opacity:0.95; margin-top:4px; }
    .meta { padding: 14px 22px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.06); }
    .content { padding: 22px; }
    .section { margin-bottom: 14px; }
    .label { color:#475569; font-weight:700; margin-bottom:6px; display:block; font-size:13px; }
    .box { background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:6px; font-size:14px; color:#0f172a; }
    .amount { font-size: 26px; font-weight:800; color:#064e3b; margin-top:8px; }
    .footer { padding: 20px; border-top:1px solid #e6e9ee; text-align:center; color:#64748b; font-size:12px; }
    .muted { color:#475569; font-size:13px; }
    .right { text-align:right; }
    .grid { display:flex; gap:14px; }
    .col { flex:1; }
    .signature { margin-top:28px; text-align:right; }
    .signature .line { border-top:1px solid #cbd5e1; width:200px; margin-left:auto; margin-top:8px; }
    .no-print { margin: 18px; text-align:center; }
    button { cursor:pointer; border-radius:8px; padding:10px 16px; border:none; font-size:14px; }
    .btn-print { background:#DC2626; color:white; margin-right:8px; }
    .btn-close { background:#64748b; color:white; }

    @media print {
      .no-print { display:none; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="title">ASMiL</div>
        <div class="small">Centre de Formation · Admission · Ménage · Innovation et Leadership</div>
      </div>
      <div style="margin-left:auto; color:white; text-align:right;">
        <div style="font-weight:800; font-size:16px;">REÇU DE PAIEMENT</div>
        <div style="opacity:0.95; font-size:12px;">${dateStr}</div>
      </div>
    </div>

    <div class="meta" style="background:#fff;">
      <div class="muted">Reçu N°: <strong>${(payment?.id || "").slice(0,8).toUpperCase()}</strong></div>
      <div class="muted">Facture: <strong>${invoice?.invoice_number || `INV-${(invoice?.id||"").slice(0,8)}`}</strong></div>
    </div>

    <div class="content">
      <div class="section grid">
        <div class="col">
          <span class="label">Reçu de</span>
          <div class="box">${(studentName || "").replace(/</g, "&lt;")}</div>
        </div>
        <div class="col right">
          <span class="label">Détails du paiement</span>
          <div class="box">
            <div class="muted">Méthode: <strong>${payment?.method || "—"}</strong></div>
            ${payment?.transaction_reference ? `<div class="muted">Référence: <strong>${payment.transaction_reference}</strong></div>` : ""}
            ${payment?.notes ? `<div class="muted">Notes: <strong>${payment.notes}</strong></div>` : ""}
            <div style="margin-top:8px;" class="amount">${Number(payment?.amount || 0).toLocaleString()} Ar</div>
          </div>
        </div>
      </div>

      <div class="section">
        <span class="label">Résumé</span>
        <div class="box">
          <div class="muted">Montant facturé: <strong>${Number(invoice?.amount || 0).toLocaleString()} Ar</strong></div>
          <div class="muted">Montant payé (ce reçu): <strong>${Number(payment?.amount || 0).toLocaleString()} Ar</strong></div>
        </div>
      </div>

      <div class="section">
        <span class="label">Date</span>
        <div class="box">${dateStr}</div>
      </div>

      <div class="signature">
        <div class="line"></div>
        <div class="muted">Signature autorisée</div>
      </div>
    </div>

    <div class="footer">ASMiL • Document généré automatiquement — ${format(new Date(), "d MMMM yyyy", { locale: fr })}</div>
  </div>

  <div class="no-print">
    <button class="btn-print" onclick="window.print()">📄 Imprimer / Sauvegarder en PDF</button>
    <button class="btn-close" onclick="window.close()">Fermer</button>
  </div>
</body>
</html>`;

  const w = window.open("", "_blank");
  // ensure window created
  if (!w) {
    alert("Impossible d'ouvrir une nouvelle fenêtre. Vérifie ton bloqueur de popups.");
    return;
  }
  w.document.write(receiptHTML);
  w.document.close();
};
