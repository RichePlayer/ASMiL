import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";

export default function AttendanceStats({ attendances, enrollments }) {
  const totalPresent = attendances.filter((a) => a.status === "présent").length;
  const totalAbsent = attendances.filter((a) => a.status === "absent").length;
  const totalLate = attendances.filter((a) => a.status === "retard").length;
  
  const total = totalPresent + totalAbsent + totalLate;
  const presenceRate = total > 0 ? ((totalPresent / total) * 100).toFixed(1) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Présents</p>
              <h3 className="text-3xl font-bold text-green-900 mt-2">{totalPresent}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-600 shadow-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Absents</p>
              <h3 className="text-3xl font-bold text-red-900 mt-2">{totalAbsent}</h3>
            </div>
            <div className="p-3 rounded-xl bg-red-600 shadow-lg">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Retards</p>
              <h3 className="text-3xl font-bold text-orange-900 mt-2">{totalLate}</h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-600 shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Taux de Présence</p>
              <h3 className="text-3xl font-bold text-blue-900 mt-2">{presenceRate}%</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
