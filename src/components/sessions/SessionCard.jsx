import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SessionCard({ session, moduleName, formationName, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      "à venir": "bg-blue-100 text-blue-800 border-blue-200",
      "en cours": "bg-green-100 text-green-800 border-green-200",
      terminée: "bg-slate-100 text-slate-800 border-slate-200",
      annulée: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-br from-red-50 to-red-100 pb-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className={`${getStatusColor(session.status)} border`}>
            {session.status}
          </Badge>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" onClick={onEdit} className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} className="h-8 w-8 text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{moduleName}</CardTitle>
        {formationName && <p className="text-sm text-slate-600 mt-1">{formationName}</p>}
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 text-red-600" />
          <span>
            {session.start_date && format(new Date(session.start_date), "d MMM yyyy", { locale: fr })} -{" "}
            {session.end_date && format(new Date(session.end_date), "d MMM yyyy", { locale: fr })}
          </span>
        </div>
        {session.room && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-red-600" />
            <span>{session.room}</span>
          </div>
        )}
        {session.capacity && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4 text-red-600" />
            <span>Capacité: {session.capacity} places</span>
          </div>
        )}
        {session.schedule && session.schedule.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="font-medium">Horaires:</span>
            </div>
            <div className="space-y-1 ml-6">
              {session.schedule.slice(0, 3).map((sched, idx) => (
                <p key={idx} className="text-xs text-slate-600">
                  {sched.day}: {sched.start_time} - {sched.end_time}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
