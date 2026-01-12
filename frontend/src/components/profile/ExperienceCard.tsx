import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Plus, Pencil, Trash2, Briefcase, Building2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../hooks/use-toast";
import {
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
} from "../../hooks/use-experiences";
import type { components } from "../../types/api-schema";

type Experience = components["schemas"]["Experience"];
type ExperienceCreate = components["schemas"]["ExperienceCreate"];
type ExperienceUpdate = components["schemas"]["ExperienceUpdate"];

interface ExperienceCardProps {
  profileId?: string | number;
  readOnly?: boolean; 
  data?: any[];
}

const emptyExperience: Omit<ExperienceCreate, "profile"> = {
  company: "",
  position: "",
  location: "",
  start_date: "",
  end_date: null,
  current: false,
  description: "",
  company_logo_url: "",
};

export default function ExperienceCard({ profileId, readOnly, data }: ExperienceCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<ExperienceCreate, "profile">>(emptyExperience);

  // Only fetch if NOT readOnly
  const { data: fetchedData, isFetching } = useExperiences({ 
    profile: profileId,
    enabled: !readOnly, // Prevent API call when readOnly
  });
  
  const createMutation = useCreateExperience();
  const updateMutation = useUpdateExperience();
  const deleteMutation = useDeleteExperience();
  const { toast } = useToast();

  // Use passed data if readOnly, otherwise use fetched data
  const experiences = readOnly ? (data || []) : (fetchedData?.results || []);
  const showLoading = !readOnly && isFetching;
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleOpenAdd = () => {
    setFormData(emptyExperience);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (exp: Experience) => {
    setFormData({
      company: exp.company,
      position: exp.position,
      location: exp.location || "",
      start_date: exp.start_date,
      end_date: exp.end_date ?? null,
      current: exp.current,
      description: exp.description || "",
      company_logo_url: exp.company_logo_url || "",
    });
    setEditingId(exp.id);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!profileId) return;

    const payload = {
      ...formData,
      end_date: formData.current ? null : formData.end_date || null,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload });
        toast({ title: "Experience updated", description: "Your changes were saved." });
      } else {
        await createMutation.mutateAsync({ ...payload, profile: Number(profileId) });
        toast({ title: "Experience added", description: "Your work history is now updated." });
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast({
        title: "Failed to save",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this experience? This cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Experience removed" });
    } catch (err) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const formatDateRange = (start: string, end: string | null, current: boolean) => {
    const startYear = new Date(start).getFullYear();
    if (current) return `${startYear} – Present`;
    if (end) return `${startYear} – ${new Date(end).getFullYear()}`;
    return startYear.toString();
  };

  const isFormValid = formData.company && formData.position && formData.start_date;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-indigo-600" />
          <CardTitle>Work Experience</CardTitle>
          <Badge variant="secondary">{experiences.length}</Badge>
        </div>
        {!readOnly && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" /> Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "Add"} Experience</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company *</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position *</label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g. Senior Engineer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date *</label>
                    <Input
                      type="month"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="month"
                      value={formData.end_date || ""}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                      disabled={formData.current}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.current}
                    onCheckedChange={(c) => setFormData({ ...formData, current: c as boolean, end_date: null })}
                  />
                  <label className="text-sm">I currently work here</label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Key responsibilities, achievements..."
                    className="min-h-24 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Logo URL (optional)</label>
                  <Input
                    value={formData.company_logo_url}
                    onChange={(e) => setFormData({ ...formData, company_logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!isFormValid || isMutating}>
                  {isMutating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Experience"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent>
        {showLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No work experience added yet</p>
            {!readOnly && (
              <Button variant="ghost" size="sm" onClick={handleOpenAdd} className="mt-4">
                Add your first role
              </Button>
            )}
          </div>
        ) : (
          <motion.div className="space-y-8">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
                className="relative group"
              >
                {i > 0 && <div className="absolute -top-4 left-6 w-px h-4 bg-border" />}
                <div className="flex gap-5">
                  <Avatar className="h-14 w-14 shrink-0 border-2 border-background">
                    <AvatarImage src={exp.company_logo_url || undefined} />
                    <AvatarFallback className="text-lg font-bold">
                      {exp.company.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-lg">{exp.position}</h4>
                        <p className="text-muted-foreground">
                          {exp.company}
                          {exp.location && ` · ${exp.location}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDateRange(exp.start_date, exp.end_date, exp.current)}
                        </p>
                      </div>
                      {!readOnly && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(exp)}
                            disabled={isMutating}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(exp.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                    {exp.description && (
                      <p className="mt-3 text-muted-foreground leading-relaxed">{exp.description}</p>
                    )}
                    {exp.current && (
                      <Badge className="mt-3" variant="secondary">
                        Current Position
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}