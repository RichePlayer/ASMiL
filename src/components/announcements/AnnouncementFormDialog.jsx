import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementAPI } from "@/api/localDB"; // ⭐ LOCAL DB ⭐

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

import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AnnouncementFormDialog({ announcement, open, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "information",
    target_audience: "tous",
    published: false,
    publish_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
  });

  const queryClient = useQueryClient();

  // LOAD DATA WHEN EDITING
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        content: announcement.content || "",
        type: announcement.type || "information",
        target_audience: announcement.target_audience || "tous",
        published: announcement.published || false,
        publish_date: announcement.publish_date || "",
        expiry_date: announcement.expiry_date || "",
      });
    }
  }, [announcement]);

  // SAVE MUTATION (CREATE / UPDATE)
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (announcement) {
        return announcementAPI.update(announcement.id, data);
      }
      return announcementAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success(announcement ? "Annonce modifiée" : "Annonce créée");
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {announcement ? "Modifier l'Annonce" : "Nouvelle Annonce"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TITLE */}
          <div>
            <Label>Titre *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="Titre de l'annonce"
            />
          </div>

          {/* CONTENT */}
          <div>
            <Label>Contenu *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              rows={6}
              placeholder="Écrivez ici le contenu de l'annonce..."
            />
          </div>

          {/* TYPE + TARGET */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="information">Information</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="événement">Événement</SelectItem>
                  <SelectItem value="session ouverte">Session Ouverte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Public Cible *</Label>
              <Select
                value={formData.target_audience}
                onValueChange={(value) =>
                  setFormData({ ...formData, target_audience: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="étudiants">Étudiants</SelectItem>
                  <SelectItem value="formateurs">Formateurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de Publication</Label>
              <Input
                type="date"
                value={formData.publish_date}
                onChange={(e) =>
                  setFormData({ ...formData, publish_date: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Date d'Expiration</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* PUBLISHED SWITCH */}
          <div className="flex items-center space-x-2 p-4 bg-slate-50 rounded-lg">
            <Switch
              checked={formData.published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, published: checked })
              }
            />
            <Label className="text-sm font-medium">Publier immédiatement</Label>
          </div>

          {/* FOOTER */}
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
