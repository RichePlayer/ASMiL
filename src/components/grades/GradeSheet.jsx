// ===============================
//   src/components/grades/GradeSheet.jsx
// ===============================

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function GradeSheet({ enrollments, students, grades }) {
  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student
      ? `${student.first_name} ${student.last_name}`
      : "Étudiant inconnu";
  };

  const getStudentGrades = (enrollmentId) =>
    grades.filter((g) => g.enrollment_id === enrollmentId);

  const calculateAverage = (studentGrades) => {
    if (studentGrades.length === 0) return "-";

    const total = studentGrades.reduce((sum, g) => {
      const weighted = (g.value / g.max_value) * 20 * (g.weight || 1);
      return sum + weighted;
    }, 0);

    const totalWeight = studentGrades.reduce(
      (sum, g) => sum + (g.weight || 1),
      0
    );

    return (total / totalWeight).toFixed(2);
  };

  const getGradeColor = (average) => {
    if (average === "-") return "bg-slate-100 text-slate-800";

    const avg = parseFloat(average);

    if (avg >= 16) return "bg-green-100 text-green-800 border-green-200";
    if (avg >= 14) return "bg-blue-100 text-blue-800 border-blue-200";
    if (avg >= 10) return "bg-yellow-100 text-yellow-800 border-yellow-200";

    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-bold">Étudiant</TableHead>
            <TableHead className="font-bold text-center">
              Nombre d'Évaluations
            </TableHead>
            <TableHead className="font-bold text-center">Moyenne</TableHead>
            <TableHead className="font-bold text-center">Appréciation</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {enrollments.map((enrollment) => {
            const studentGrades = getStudentGrades(enrollment.id);
            const average = calculateAverage(studentGrades);

            return (
              <TableRow key={enrollment.id}>
                <TableCell className="font-medium">
                  {getStudentName(enrollment.student_id)}
                </TableCell>

                <TableCell className="text-center">
                  {studentGrades.length}
                </TableCell>

                <TableCell className="text-center">
                  <span className="text-lg font-bold">
                    {average}
                    {average !== "-" && "/20"}
                  </span>
                </TableCell>

                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={`${getGradeColor(average)} border`}
                  >
                    {average === "-"
                      ? "Aucune note"
                      : parseFloat(average) >= 16
                      ? "Excellent"
                      : parseFloat(average) >= 14
                      ? "Très Bien"
                      : parseFloat(average) >= 12
                      ? "Bien"
                      : parseFloat(average) >= 10
                      ? "Passable"
                      : "Insuffisant"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {enrollments.length === 0 && (
        <p className="text-center text-slate-500 py-8">Aucun étudiant inscrit</p>
      )}
    </div>
  );
}
