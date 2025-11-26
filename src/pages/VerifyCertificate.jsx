// src/pages/VerifyCertificate.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  certificateAPI,
  studentAPI
} from "@/api/localDB";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function VerifyCertificate() {
  const [verificationCode, setVerificationCode] = useState("");
  const [result, setResult] = useState(null);

  const { data: certificates = [] } = useQuery({
    queryKey: ["certificates"],
    queryFn: () => certificateAPI.list(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentAPI.list(),
  });

  const handleVerify = () => {
    const cert = certificates.find(
      (c) => c.verification_code === verificationCode.toUpperCase()
    );

    if (cert) {
      const student = students.find((s) => s.id === cert.student_id);
      setResult({ found: true, certificate: cert, student });
    } else {
      setResult({ found: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 mb-4 shadow-lg">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">
            Vérification de Certificat
          </h1>
          <p className="text-slate-600 mt-2">
            Vérifiez l'authenticité d'un certificat ASMiL
          </p>
        </div>

        {/* Verification Input */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-red-50 to-red-100">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-red-600" />
              Entrez le Code de Vérification
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              <Input
                placeholder="Ex: ABC123XYZ456"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.toUpperCase())
                }
                className="text-center text-lg font-mono uppercase"
                maxLength={12}
              />
              <p className="text-xs text-slate-500 text-center">
                Le code de vérification se trouve sur le certificat
              </p>

              <Button
                onClick={handleVerify}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                disabled={verificationCode.length < 6}
              >
                <Search className="h-4 w-4 mr-2" />
                Vérifier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RESULT BLOCK */}
        {result && (
          <Card
            className={`border-0 shadow-2xl ${
              result.found ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <CardContent className="p-6">
              {/* FOUND */}
              {result.found ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-600 shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-900">
                        Certificat Valide
                      </h3>
                      <p className="text-sm text-green-700">
                        Ce certificat est authentique
                      </p>
                    </div>
                  </div>

                  {/* Details Card */}
                  <div className="p-4 bg-white rounded-lg shadow space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-slate-600">Étudiant</span>
                      <span className="font-semibold">
                        {result.student?.first_name} {result.student?.last_name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-slate-600">Formation</span>
                      <span className="font-semibold">
                        {result.certificate.formation_title}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-slate-600">Numéro</span>
                      <span className="font-mono">
                        {result.certificate.certificate_number}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-slate-600">Émis le</span>
                      <span className="font-semibold">
                        {format(
                          new Date(result.certificate.issue_date),
                          "d MMMM yyyy",
                          { locale: fr }
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-slate-600">Note</span>
                      <span className="font-semibold text-green-700">
                        {result.certificate.grade}/20
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Présence</span>
                      <span className="font-semibold text-blue-700">
                        {result.certificate.attendance_rate}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* NOT FOUND */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-red-600 shadow-lg">
                      <XCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-900">
                        Certificat Introuvable
                      </h3>
                      <p className="text-sm text-red-700">
                        Aucun certificat ne correspond à ce code
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Veuillez vérifier :</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Le code est correctement saisi</li>
                        <li>Le certificat n'a pas été révoqué</li>
                        <li>Le code provient d’un document ASMiL valide</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* FOOTER */}
        <Card className="border-0 shadow-lg bg-slate-50">
          <CardContent className="p-6 text-center text-sm text-slate-600">
            <p>
              Pour toute assistance concernant la vérification de certificat :  
              <br />
              contactez le centre ASMiL.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
