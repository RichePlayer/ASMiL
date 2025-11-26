// src/components/certificates/CertificatePreview.jsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, FileText, ScrollText } from "lucide-react";

import generateCertificatePDF from "./CertificatePDF";
import generateDiplomaPDF from "./DiplomaPDF";

export default function CertificatePreview({
  certificate,
  student,
  open,
  onClose,
}) {
  if (!certificate || !student) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-red-600" />
            Aperçu du Certificat
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-slate-600">{certificate.formation_title}</p>

            <div className="mt-3 text-sm text-slate-500">
              <p>Numéro : {certificate.certificate_number}</p>
              <p>Émis le : {certificate.issue_date}</p>
              <p>Note : {certificate.grade}/20</p>
              <p>Présence : {certificate.attendance_rate}%</p>
              <p>Status : {certificate.status}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
            <p className="text-sm text-center text-slate-600 italic">
              Ceci est un aperçu. Cliquez sur un des boutons ci-dessous pour
              télécharger les documents officiels en PDF.
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>

          <div className="flex gap-2">
            {/* CERTIFICAT PDF */}
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => generateCertificatePDF(certificate, student)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Certificat PDF
            </Button>

            {/* DIPLÔME PDF */}
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => generateDiplomaPDF(certificate, student)}
            >
              <ScrollText className="h-4 w-4 mr-2" />
              Diplôme PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
