// src/components/certificates/CertificateGenerator.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  certificateAPI,
  enrollmentAPI,
  studentAPI,
} from "@/api/localDB";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";

export default function CertificateGenerator({ open, onClose }) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    enrollment_id: "",
    formation_title: "",
    grade: "",
    attendance_rate: "",
    completion_date: new Date().toISOString().split("T")[0],
  });

  // Load enrollments + students (localDB)
  const allEnrollments = enrollmentAPI._dump();
  const allStudents = studentAPI._dump();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const enrollment = allEnrollments.find((e) => e.id === data.enrollment_id);
      if (!enrollment) throw new Error("Inscription introuvable");

      const certificateNumber = `CERT-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      const verificationCode = Math.random()
        .toString(36)
        .substring(2, 12)
        .toUpperCase();

      return certificateAPI.create({
        student_id: enrollment.student_id,
        enrollment_id: enrollment.id,
        formation_title: data.formation_title,
        certificate_number: certificateNumber,
        verification_code: verificationCode,
        issue_date: new Date().toISOString().split("T")[0],
        completion_date: data.completion_date,
        grade: parseFloat(data.grade),
        attendance_rate: parseFloat(data.attendance_rate),
        status: "actif",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificat créé avec succès !");
      onClose();
    },
    onError: () => toast.error("Erreur lors de la création du certificat"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.enrollment_id) return toast.error("Choisissez une inscription");
    if (!formData.formation_title) return toast.error("Titre requis");
    createMutation.mutate(formData);
  };

  // Auto-fill formation name when user selects enrollment
  const handleEnrollmentSelect = (enrollmentId) => {
    const chosen = allEnrollments.find((e) => e.id === enrollmentId);
    setFormData({
      ...formData,
      enrollment_id: enrollmentId,
      formation_title: chosen?.formation_title || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Créer un Certificat
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Enrollment selection */}
          <div>
            <Label>Inscription *</Label>
            <Select
              value={formData.enrollment_id}
              onValueChange={(value) => handleEnrollmentSelect(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une inscription" />
              </SelectTrigger>
              <SelectContent>
                {allEnrollments.map((e) => {
                  const student = allStudents.find((s) => s.id === e.student_id);
                  return (
                    <SelectItem key={e.id} value={e.id}>
                      {student?.first_name} {student?.last_name} — {e.id}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Formation title */}
          <div>
            <Label>Titre de la Formation *</Label>
            <Input
              value={formData.formation_title}
              onChange={(e) =>
                setFormData({ ...formData, formation_title: e.target.value })
              }
              required
            />
          </div>

          {/* Grade */}
          <div>
            <Label>Note (/20) *</Label>
            <Input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              required
            />
          </div>

          {/* Attendance rate */}
          <div>
            <Label>Taux de Présence (%) *</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.attendance_rate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attendance_rate: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Completion date */}
          <div>
            <Label>Date de Fin *</Label>
            <Input
              type="date"
              value={formData.completion_date}
              onChange={(e) =>
                setFormData({ ...formData, completion_date: e.target.value })
              }
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>

            <Button
              type="submit"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Création..." : "Créer le Certificat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
