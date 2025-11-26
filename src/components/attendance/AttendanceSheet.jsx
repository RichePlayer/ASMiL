import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// use localDB attendanceAPI
import { attendanceAPI } from "@/api/localDB";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Search, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AttendanceSheet({ sessionId, date, enrollments, students, attendances }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const data = {};
    enrollments.forEach((enrollment) => {
      const existing = attendances.find(
        (a) => a.enrollment_id === enrollment.id && a.date === date
      );
      data[enrollment.id] = existing?.status || "présent";
    });
    setAttendanceData(data);
  }, [enrollments, attendances, date]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const promises = Object.entries(data).map(async ([enrollmentId, status]) => {
        const existing = attendances.find(
          (a) => a.enrollment_id === enrollmentId && a.date === date
        );
        if (existing) {
          return attendanceAPI.update(existing.id, { status });
        }
        return attendanceAPI.create({
          enrollment_id: enrollmentId,
          date,
          status,
        });
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      toast.success("Présences enregistrées");
    },
  });

  const handleSave = () => {
    // validation minimale
    saveMutation.mutate(attendanceData);
  };

  const setStatus = (enrollmentId, status) => {
    setAttendanceData({ ...attendanceData, [enrollmentId]: status });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "présent":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "retard":
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Étudiant inconnu";
  };

  const setAllStatus = (status) => {
    const newData = {};
    filteredEnrollments.forEach((enrollment) => {
      newData[enrollment.id] = status;
    });
    setAttendanceData({ ...attendanceData, ...newData });
    toast.success(`Tous les étudiants marqués comme ${status}`);
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const studentName = getStudentName(enrollment.student_id).toLowerCase();
    return studentName.includes(searchQuery.toLowerCase());
  });

  const stats = {
    present: Object.values(attendanceData).filter((s) => s === "présent").length,
    absent: Object.values(attendanceData).filter((s) => s === "absent").length,
    late: Object.values(attendanceData).filter((s) => s === "retard").length,
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions & Search */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un étudiant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAllStatus("présent")}
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Tout Présent
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAllStatus("absent")}
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Tout Absent
          </Button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-4 gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
        <div className="text-center">
          <p className="text-xs text-slate-600">Total</p>
          <p className="text-2xl font-bold text-slate-900">{filteredEnrollments.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-green-600">Présents</p>
          <p className="text-2xl font-bold text-green-700">{stats.present}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-red-600">Absents</p>
          <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-orange-600">Retards</p>
          <p className="text-2xl font-bold text-orange-700">{stats.late}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-bold w-16 text-center">#</TableHead>
            <TableHead className="font-bold">Étudiant</TableHead>
            <TableHead className="font-bold text-center">Statut Actuel</TableHead>
            <TableHead className="font-bold text-center">Actions Rapides</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEnrollments.map((enrollment, index) => {
            const status = attendanceData[enrollment.id] || "présent";
            const student = students.find((s) => s.id === enrollment.student_id);
            return (
              <TableRow key={enrollment.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="text-center font-mono text-slate-500">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      status === "présent" ? "bg-green-500" :
                      status === "absent" ? "bg-red-500" :
                      "bg-orange-500"
                    }`}></div>
                    {getStudentName(enrollment.student_id)}
                  </div>
                  {student?.registration_number && (
                    <p className="text-xs text-slate-500 mt-1">{student.registration_number}</p>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center items-center gap-2">
                    {getStatusIcon(status)}
                    <span className={`font-semibold text-sm ${
                      status === "présent" ? "text-green-700" :
                      status === "absent" ? "text-red-700" :
                      "text-orange-700"
                    }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button
                      size="sm"
                      variant={status === "présent" ? "default" : "ghost"}
                      onClick={() => setStatus(enrollment.id, "présent")}
                      className={`h-8 w-8 p-0 ${status === "présent" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}`}
                      title="Marquer présent"
                    >
                      <CheckCircle2 className={`h-4 w-4 ${status === "présent" ? "text-white" : "text-green-600"}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "absent" ? "default" : "ghost"}
                      onClick={() => setStatus(enrollment.id, "absent")}
                      className={`h-8 w-8 p-0 ${status === "absent" ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50"}`}
                      title="Marquer absent"
                    >
                      <XCircle className={`h-4 w-4 ${status === "absent" ? "text-white" : "text-red-600"}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "retard" ? "default" : "ghost"}
                      onClick={() => setStatus(enrollment.id, "retard")}
                      className={`h-8 w-8 p-0 ${status === "retard" ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-50"}`}
                      title="Marquer en retard"
                    >
                      <Clock className={`h-4 w-4 ${status === "retard" ? "text-white" : "text-orange-600"}`} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {enrollments.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Aucun étudiant inscrit à cette session</p>
        </div>
      )}

      {filteredEnrollments.length === 0 && enrollments.length > 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">Aucun résultat pour "{searchQuery}"</p>
        </div>
      )}

      {enrollments.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            {filteredEnrollments.length} étudiant(s) • 
            {stats.present} présent(s) • 
            {stats.absent} absent(s) • 
            {stats.late} retard(s)
          </div>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
            disabled={saveMutation.isPending}
            size="lg"
          >
            {saveMutation.isPending ? "Enregistrement..." : "💾 Enregistrer les Présences"}
          </Button>
        </div>
      )}
    </div>
  );
}
