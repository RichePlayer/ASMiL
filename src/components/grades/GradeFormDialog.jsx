// ===============================
//   src/components/grades/GradeFormDialog.jsx
// ===============================

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gradeAPI } from "@/api/localDB";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export default function GradeFormDialog({
  sessionId,
  enrollments,
  students,
  open,
  onClose,
}) {
  const [formData, setFormData] = useState({
    enrollment_id: "",
    evaluation_name: "",
    value: 0,
    max_value: 20,
    weight: 1,
    date: new Date().toISOString().split("T")[0],
    comments: "",
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => gradeAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("Note ajoutée avec succès");
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student
      ? `${student.first_name} ${student.last_name}`
      : "Étudiant";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Ajouter une Note
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STUDENT */}
          <div>
            <Label>Étudiant *</Label>
            <Select
              value={formData.enrollment_id}
              onValueChange={(value) =>
                setFormData({ ...formData, enrollment_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un étudiant" />
              </SelectTrigger>

              <SelectContent>
                {enrollments.map((enrollment) => (
                  <SelectItem key={enrollment.id} value={enrollment.id}>
                    {getStudentName(enrollment.student_id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* EVALUATION NAME */}
          <div>
            <Label>Nom de l'Évaluation *</Label>
            <Input
              value={formData.evaluation_name}
              onChange={(e) =>
                setFormData({ ...formData, evaluation_name: e.target.value })
              }
              required
              placeholder="Ex: Examen Final, TP1, Quiz..."
            />
          </div>

          {/* VALUES */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Note *</Label>
              <Input
                type="number"
                min="0"
                step="0.25"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <Label>Sur *</Label>
              <Input
                type="number"
                min="1"
                value={formData.max_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_value: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>

            <div>
              <Label>Coefficient</Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>

          {/* DATE */}
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          {/* COMMENTS */}
          <div>
            <Label>Commentaires</Label>
            <Textarea
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              rows={3}
              placeholder="Commentaires sur la performance..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>

            <Button
              type="submit"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
