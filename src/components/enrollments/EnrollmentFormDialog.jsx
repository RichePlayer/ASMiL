import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import localDB from "@/api/localDB";

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

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function EnrollmentFormDialog({
  enrollment,
  students,
  sessions,
  modules,
  open,
  onClose,
}) {
  const [formData, setFormData] = useState({
    student_id: "",
    session_id: "",
    status: "actif",
    paid_amount: 0,
    total_amount: 0,
    notes: "",
  });

  const queryClient = useQueryClient();

  // ============================================
  // FETCH FORMATIONS (via localDB)
  // ============================================
  const { data: formations = [] } = useQuery({
    queryKey: ["formations"],
    queryFn: () => localDB.formationAPI.list(),
  });

  // ============================================
  // INITIAL DATA
  // ============================================
  useEffect(() => {
    if (enrollment) {
      setFormData({
        student_id: enrollment.student_id || "",
        session_id: enrollment.session_id || "",
        status: enrollment.status || "actif",
        paid_amount: enrollment.paid_amount || 0,
        total_amount: enrollment.total_amount || 0,
        notes: enrollment.notes || "",
      });
    }
  }, [enrollment]);

  // ============================================
  // CREATE / UPDATE Enrollment
  // ============================================
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (enrollment) {
        return localDB.enrollmentAPI.update(enrollment.id, data);
      }
      return localDB.enrollmentAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success(
        enrollment ? "Inscription modifiée" : "Inscription créée"
      );
      onClose();
    },
  });

  // ============================================
  // HELPERS
  // ============================================

  const getSessionInfo = (id) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return "Session";

    const module = modules.find((m) => m.id === session.module_id);
    return module ? `${module.title} - Salle ${session.room}` : "Session";
  };

  const getFormationPrice = (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return 0;

    const module = modules.find((m) => m.id === session.module_id);
    if (!module) return 0;

    const formation = formations.find((f) => f.id === module.formation_id);

    return formation?.price || 0;
  };

  const handleSessionChange = (sessionId) => {
    const price = getFormationPrice(sessionId);

    setFormData({
      ...formData,
      session_id: sessionId,
      total_amount: price,
    });
  };

  const percentagePaid = () => {
    if (!formData.total_amount) return 0;
    return ((formData.paid_amount / formData.total_amount) * 100).toFixed(1);
  };

  const remainingAmount = formData.total_amount - formData.paid_amount;

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {enrollment ? "Modifier l'Inscription" : "Nouvelle Inscription"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student + Session */}
          <div className="grid grid-cols-2 gap-4">
            {/* Student */}
            <div>
              <Label>Étudiant *</Label>
              <Select
                value={formData.student_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, student_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un étudiant" />
                </SelectTrigger>

                <SelectContent>
                  {students.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.first_name} {st.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session */}
            <div>
              <Label>Session *</Label>
              <Select
                value={formData.session_id}
                onValueChange={handleSessionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une session" />
                </SelectTrigger>

                <SelectContent>
                  {sessions.map((session) => {
                    const price = getFormationPrice(session.id);
                    return (
                      <SelectItem key={session.id} value={session.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{getSessionInfo(session.id)}</span>
                          {price > 0 && (
                            <span className="ml-4 text-red-600 font-bold">
                              {price.toLocaleString()} Ar
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {formData.session_id &&
                getFormationPrice(formData.session_id) > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Prix :{" "}
                    {getFormationPrice(
                      formData.session_id
                    ).toLocaleString()}{" "}
                    Ar
                  </p>
                )}
            </div>
          </div>

          {/* PRICING SECTION */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600" />
              <Label className="text-base font-bold text-blue-900">
                Tarification
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Total */}
              <div>
                <Label>Montant Total (Ar) *</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    value={formData.total_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pr-12 font-bold text-lg"
                    required
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    Ar
                  </span>
                </div>
              </div>

              {/* Paid */}
              <div>
                <Label>Montant Payé (Ar)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max={formData.total_amount}
                    value={formData.paid_amount}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      if (v <= formData.total_amount) {
                        setFormData({ ...formData, paid_amount: v });
                      }
                    }}
                    className="pr-12 font-bold text-lg text-green-700"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    Ar
                  </span>
                </div>
              </div>
            </div>

            {/* QUICK PAY BUTTONS */}
            {formData.total_amount > 0 &&
              formData.paid_amount < formData.total_amount && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <Label className="text-xs text-slate-600 mb-2 block">
                    Paiement rapide :
                  </Label>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          paid_amount: formData.total_amount / 2,
                        })
                      }
                      className="text-xs"
                    >
                      50%
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          paid_amount: formData.total_amount * 0.75,
                        })
                      }
                      className="text-xs"
                    >
                      75%
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          paid_amount: formData.total_amount,
                        })
                      }
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      Tout payer
                    </Button>
                  </div>
                </div>
              )}
          </Card>

          {/* STATUS */}
          <div>
            <Label>Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en attente">En Attente</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="terminé">Terminé</SelectItem>
                <SelectItem value="annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* NOTES */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              placeholder="Notes administratives..."
            />
          </div>

          {/* SUMMARY */}
          {formData.total_amount > 0 && (
            <Card className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-slate-600" />
                <Label className="text-base font-bold text-slate-900">
                  Résumé Financier
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formData.total_amount.toLocaleString()} Ar
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">
                    Montant payé
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {formData.paid_amount.toLocaleString()} Ar
                  </p>
                </div>
              </div>

              {/* Remaining */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  remainingAmount === 0
                    ? "bg-green-100 border-green-300"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700">
                    Reste :
                  </span>
                  <span
                    className={`text-3xl font-black ${
                      remainingAmount === 0
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {remainingAmount.toLocaleString()} Ar
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      percentagePaid() === "100.0"
                        ? "bg-green-600"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${percentagePaid()}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-600">Progression</span>
                  <Badge
                    className={
                      percentagePaid() === "100.0"
                        ? "bg-green-600"
                        : percentagePaid() >= 50
                        ? "bg-blue-600"
                        : "bg-orange-600"
                    }
                  >
                    {percentagePaid()}% payé
                  </Badge>
                </div>

                {remainingAmount === 0 && (
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>✓ Paiement complet</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
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
