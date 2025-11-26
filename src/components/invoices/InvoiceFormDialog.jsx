// src/components/invoices/InvoiceFormDialog.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceAPI } from "@/api/localDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function InvoiceFormDialog({ invoice, enrollments, students, open, onClose }) {
  const [formData, setFormData] = useState({
    enrollment_id: "",
    invoice_number: "",
    amount: 0,
    status: "impayée",
    due_date: "",
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (invoice) {
      setFormData({
        enrollment_id: invoice.enrollment_id || "",
        invoice_number: invoice.invoice_number || "",
        amount: invoice.amount || 0,
        status: invoice.status || "impayée",
        due_date: invoice.due_date || "",
      });
    } else {
      setFormData({
        enrollment_id: "",
        invoice_number: `INV-${Date.now()}`,
        amount: 0,
        status: "impayée",
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
    }
  }, [invoice]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (invoice) return invoiceAPI.update(invoice.id, data);
      return invoiceAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(invoice ? "Facture modifiée" : "Facture créée");
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement");
    },
  });

  const getStudentName = (enrollmentId) => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return "Étudiant";
    const student = students.find((s) => s.id === enrollment.student_id);
    return student ? `${student.first_name} ${student.last_name}` : "Étudiant";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ensure numeric
    const payload = { ...formData, amount: parseFloat(formData.amount || 0) };
    saveMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{invoice ? "Modifier la Facture" : "Nouvelle Facture"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Inscription *</Label>
            <Select value={formData.enrollment_id} onValueChange={(value) => setFormData({ ...formData, enrollment_id: value })}>
              <SelectTrigger><SelectValue placeholder="Sélectionner une inscription" /></SelectTrigger>
              <SelectContent>
                {enrollments.map((en) => (
                  <SelectItem key={en.id} value={en.id}>
                    {getStudentName(en.id)} - Session #{en.session_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Numéro de Facture</Label>
            <Input value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} placeholder="INV-2025-001" />
          </div>

          <div>
            <Label>Montant (Ar) *</Label>
            <Input type="number" min="0" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} required />
          </div>

          <div>
            <Label>Date d'Échéance *</Label>
            <Input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} required />
          </div>

          <div>
            <Label>Statut</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="impayée">Impayée</SelectItem>
                <SelectItem value="partielle">Partielle</SelectItem>
                <SelectItem value="payée">Payée</SelectItem>
                <SelectItem value="annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-red-600 to-red-700" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
