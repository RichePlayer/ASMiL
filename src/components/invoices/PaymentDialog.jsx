// src/components/invoices/PaymentDialog.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentAPI, invoiceAPI } from "@/api/localDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PaymentDialog({ invoice, open, onClose }) {
  const queryClient = useQueryClient();

  // Récupérer tous les paiements pour calculer "reste"
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!invoice) return;
    paymentAPI.list().then((list) => {
      setPayments(list.filter((p) => p.invoice_id === invoice.id));
    });
  }, [invoice]);

  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const remaining = Math.max((invoice?.amount || 0) - totalPaid, 0);

  const [formData, setFormData] = useState({
    method: "espèces",
    amount: remaining,
    transaction_reference: "",
    notes: "",
  });

  useEffect(() => {
    setFormData((f) => ({ ...f, amount: remaining }));
  }, [remaining]);

  const paymentMutation = useMutation({
    mutationFn: async (data) => {
      const created = await paymentAPI.create({
        invoice_id: invoice.id,
        method: data.method,
        amount: parseFloat(data.amount),
        transaction_reference: data.transaction_reference,
        notes: data.notes,
      });

      // recalcul totals
      const all = await paymentAPI.list();
      const related = all.filter((p) => p.invoice_id === invoice.id);
      const paid = related.reduce((sum, p) => sum + (p.amount || 0), 0);

      const newStatus = paid >= (invoice.amount || 0) ? "payée" : paid > 0 ? "partielle" : "impayée";

      await invoiceAPI.update(invoice.id, { status: newStatus });

      return created;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Paiement enregistré");
      onClose();
    },

    onError: () => toast.error("Erreur lors du paiement"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Montant invalide");
      return;
    }
    if (parseFloat(formData.amount) > (invoice?.amount || 0)) {
      // we allow partials, but prevent single payment exceeding invoice total for safety
      toast.error("Montant ne peut pas dépasser le montant total de la facture");
      return;
    }
    paymentMutation.mutate(formData);
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Enregistrer un Paiement</DialogTitle>
        </DialogHeader>

        {/* Info facture */}
        <div className="mb-4 p-4 bg-slate-50 rounded-lg border">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-600">Facture :</span>
            <span className="font-mono font-semibold">{invoice?.invoice_number || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-600">Montant facturé :</span>
            <span className="text-lg font-bold text-red-600">{(invoice?.amount || 0).toLocaleString()} Ar</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Déjà payé :</span>
            <span className="text-green-700 font-bold">{totalPaid.toLocaleString()} Ar</span>
          </div>

          <div className="flex justify-between items-center mt-2 border-t pt-2">
            <span className="text-sm text-slate-600">Reste à payer :</span>
            <span className="text-xl font-extrabold text-red-700">{remaining.toLocaleString()} Ar</span>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Méthode de Paiement *</Label>
            <Select value={formData.method} onValueChange={(v) => setFormData({ ...formData, method: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="espèces">Espèces</SelectItem>
                <SelectItem value="mobile money">Mobile Money</SelectItem>
                <SelectItem value="virement bancaire">Virement bancaire</SelectItem>
                <SelectItem value="chèque">Chèque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label>Montant Payé (Ar) *</Label>

              {/* BOUTON "PAYER LE RESTE" */}
              {remaining > 0 && (
                <Button
                  type="button"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setFormData((f) => ({ ...f, amount: remaining }))}
                >
                  Payer le reste ({remaining.toLocaleString()} Ar)
                </Button>
              )}
            </div>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <Label>Référence</Label>
            <Input
              value={formData.transaction_reference}
              onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
              placeholder="Ex: TXN-143884"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Notes additionnelles..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700" disabled={paymentMutation.isPending}>
              {paymentMutation.isPending ? "Traitement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
