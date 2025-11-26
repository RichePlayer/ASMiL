import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Vue "Par module" :
 * - select module
 * - tableau résumé (étudiant / moyenne / mention)
 * - pour chaque ligne : détail collapsible (liste des évaluations)
 *
 * Ne modifie pas ton design — utilise les composants existants.
 */

function computeAverageAndMention(gradesForEnrollment) {
  if (!gradesForEnrollment || gradesForEnrollment.length === 0) return { average: null, mention: "Aucune note" };

  let totalWeighted = 0;
  let totalWeight = 0;
  gradesForEnrollment.forEach((g) => {
    const value = (g.value || 0) / (g.max_value || 1) * 20;
    const weight = g.weight || 1;
    totalWeighted += value * weight;
    totalWeight += weight;
  });
  const avg = totalWeight === 0 ? 0 : totalWeighted / totalWeight;
  // mentions (classic french)
  let mention = "Insuffisant";
  if (avg >= 16) mention = "Très Bien";
  else if (avg >= 14) mention = "Bien";
  else if (avg >= 12) mention = "Assez Bien";
  else if (avg >= 10) mention = "Passable";
  else mention = "Insuffisant";
  return { average: parseFloat(avg.toFixed(2)), mention };
}

export default function NotesByModule({ className = "" }) {
  const [selectedModule, setSelectedModule] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState({}); // { enrollmentId: boolean }

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => base44.entities.Session.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => base44.entities.Enrollment.list("-created_date", 1000),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: grades = [] } = useQuery({
    queryKey: ["grades"],
    queryFn: () => base44.entities.Grade.list("-date", 1000),
  });

  // filter modules which actually exist
  const moduleOptions = modules;

  // all enrollments that belong to sessions using this module (sessions.map -> module_id)
  const moduleEnrollments = useMemo(() => {
    if (!selectedModule) return [];
    const relatedSessionIds = sessions.filter((s) => s.module_id === selectedModule).map((s) => s.id);
    return enrollments.filter((e) => relatedSessionIds.includes(e.session_id));
  }, [selectedModule, sessions, enrollments]);

  const dataRows = useMemo(() => {
    return moduleEnrollments
      .map((en) => {
        const student = students.find((s) => s.id === en.student_id) || {};
        const studentName = `${student.first_name || ""} ${student.last_name || ""}`.trim();
        const studentGrades = grades.filter((g) => g.enrollment_id === en.id);
        const { average, mention } = computeAverageAndMention(studentGrades);
        return {
          enrollment: en,
          student,
          studentName,
          grades: studentGrades,
          average,
          mention,
        };
      })
      .filter((r) => r.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [moduleEnrollments, students, grades, searchQuery]);

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Notes — par module</h2>
          <p className="text-slate-600 mt-1">Consulte les moyennes et détails des évaluations par module</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Aucun —</SelectItem>
                {moduleOptions.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Rechercher un étudiant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="hidden sm:inline-flex" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" />Imprimer
          </Button>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg">Récapitulatif — {moduleOptions.find((m) => m.id === selectedModule)?.title || "Aucun module"}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {selectedModule === "" ? (
            <div className="text-center py-12 text-slate-500">Sélectionnez un module pour afficher les notes</div>
          ) : dataRows.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Aucun étudiant / note pour ce module</div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold px-3 py-2 bg-slate-50 rounded">
                <div className="col-span-6">Étudiant</div>
                <div className="col-span-2 text-center">Évaluations</div>
                <div className="col-span-2 text-center">Moyenne</div>
                <div className="col-span-2 text-center">Mention</div>
              </div>

              {dataRows.map((r) => {
                const avgLabel = r.average === null ? "-" : `${r.average}/20`;
                return (
                  <div key={r.enrollment.id} className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 items-center gap-2 p-3">
                      <div className="col-span-6">
                        <div className="font-medium">{r.studentName || "Étudiant inconnu"}</div>
                        <div className="text-xs text-slate-500">{r.student?.registration_number || ""}</div>
                      </div>

                      <div className="col-span-2 text-center text-sm">{r.grades.length}</div>

                      <div className="col-span-2 text-center">
                        <div className="text-lg font-bold">{avgLabel}</div>
                        {r.grades.length > 0 && (
                          <div className="text-xs text-slate-500">{`dernière: ${r.grades[0]?.date ? format(new Date(r.grades[0].date), "d MMM yyyy", { locale: fr }) : "-"}`}</div>
                        )}
                      </div>

                      <div className="col-span-2 text-center">
                        <Badge variant="outline" className={`px-3 py-1 ${r.average === null ? "bg-slate-100 text-slate-800" : r.average >= 16 ? "bg-green-100 text-green-800" : r.average >= 14 ? "bg-blue-100 text-blue-800" : r.average >= 10 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                          {r.average === null ? "Aucune note" : r.mention}
                        </Badge>
                      </div>

                      <div className="col-span-12 mt-2 flex justify-end sm:justify-end">
                        <Button variant="ghost" size="sm" onClick={() => toggle(r.enrollment.id)} title="Détails">
                          <span className="mr-2 text-sm">{expanded[r.enrollment.id] ? "Masquer" : "Détails"}</span>
                          <ChevronDown className={`h-4 w-4 transform transition-transform ${expanded[r.enrollment.id] ? "rotate-180" : ""}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Collapsible detail */}
                    {expanded[r.enrollment.id] && (
                      <div className="p-3 border-t bg-slate-50">
                        {r.grades.length === 0 ? (
                          <div className="text-sm text-slate-500">Aucune évaluation pour cet étudiant</div>
                        ) : (
                          <div className="space-y-2">
                            {r.grades.map((g) => (
                              <div key={g.id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                                <div>
                                  <div className="font-medium">{g.evaluation_name || "Evaluation"}</div>
                                  <div className="text-xs text-slate-500">
                                    {g.date ? format(new Date(g.date), "d MMM yyyy", { locale: fr }) : ""}
                                    {g.comments ? ` • ${g.comments}` : ""}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-red-600">{g.value}/{g.max_value}</div>
                                  <div className="text-xs text-slate-500">Coef. {g.weight || 1}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
