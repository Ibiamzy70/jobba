import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GraduationCap, School, Loader2 } from "lucide-react";
import { useEducations, useCreateEducation, useUpdateEducation, useDeleteEducation } from "../../hooks/use-educations";
import type { components } from "../../types/api-schema";

type Education = components["schemas"]["Education"];
type EducationCreate = components["schemas"]["EducationCreate"];
type EducationUpdate = components["schemas"]["EducationUpdate"];

interface EducationCardProps {
  readOnly?: boolean;
  data?: any[];
  profileId?: string | number;
}

const emptyEducation: Omit<EducationCreate, "profile"> = {
  institution: "",
  degree: "",
  field: "",
  start_date: "",
  end_date: "",
  current: false,
  description: "",
  institution_logo_url: "",
};

export default function EducationCard({ profileId, readOnly, data }: EducationCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyEducation);

  
  const { data: fetchedData, isLoading: isFetching } = useEducations({
    profile: profileId,
    ordering: "-start_date",
    enabled: !readOnly, // Prevent API call when readOnly
  });

 
  const createMutation = useCreateEducation();
  const updateMutation = useUpdateEducation();
  const deleteMutation = useDeleteEducation();

  
  const educations = readOnly ? (data || []) : (fetchedData?.results || []);
  const showLoading = !readOnly && isFetching;
  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleOpenAdd = () => {
    setFormData(emptyEducation);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (edu: Education) => {
    setFormData({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field || "",
      start_date: edu.start_date,
      end_date: edu.end_date || "",
      current: edu.current || false,
      description: edu.description || "",
      institution_logo_url: edu.institution_logo_url || "",
    });
    setEditingId(edu.id);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!profileId) return;

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: formData,
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          profile: Number(profileId),
        });
      }
      setIsDialogOpen(false);
      setFormData(emptyEducation);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save education:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this education?")) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete education:", error);
    }
  };

  const formatDateRange = (
    startDate: string,
    endDate: string | null | undefined,
    current: boolean | null | undefined
  ) => {
    const start = new Date(startDate).toLocaleDateString("en-US", {
      year: "numeric",
    });
    if (current) return `${start} - Present`;
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString("en-US", {
        year: "numeric",
      });
      return `${start} - ${end}`;
    }
    return start;
  };

  const isFormValid = formData.institution && formData.degree && formData.start_date;

  return (
    <Card className="border-card-border" data-testid="card-education">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Education</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {educations.length}
          </Badge>
        </div>
        {!readOnly && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAdd}
                data-testid="button-add-education"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              {/*  dialog content ... */}
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Education" : "Add Education"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Institution <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.institution}
                    onChange={(e) =>
                      setFormData({ ...formData, institution: e.target.value })
                    }
                    placeholder="University or school name"
                    data-testid="input-edu-institution"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Degree <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={formData.degree}
                      onChange={(e) =>
                        setFormData({ ...formData, degree: e.target.value })
                      }
                      placeholder="e.g., Bachelor's"
                      data-testid="input-edu-degree"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Field of Study</label>
                    <Input
                      value={formData.field}
                      onChange={(e) =>
                        setFormData({ ...formData, field: e.target.value })
                      }
                      placeholder="e.g., Computer Science"
                      data-testid="input-edu-field"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Start Date <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="month"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      data-testid="input-edu-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="month"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      disabled={formData.current}
                      data-testid="input-edu-end-date"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edu-current"
                    checked={formData.current}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        current: checked as boolean,
                        end_date: "",
                      })
                    }
                    data-testid="checkbox-edu-current"
                  />
                  <label htmlFor="edu-current" className="text-sm">
                    I'm currently studying here
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Activities, achievements, or additional details..."
                    className="min-h-20 resize-none"
                    data-testid="textarea-edu-description"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Institution Logo URL (Optional)</label>
                  <Input
                    value={formData.institution_logo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, institution_logo_url: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                    data-testid="input-edu-logo-url"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="outline" data-testid="button-edu-cancel">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !isFormValid}
                  data-testid="button-edu-save"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {showLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : educations.length === 0 ? (
          <div className="text-center py-8">
            <School className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No education added yet</p>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenAdd}
                className="mt-2 text-primary"
                data-testid="button-add-first-education"
              >
                Add your education
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {educations.map((edu, index) => (
              <div
                key={edu.id}
                className="relative group"
                data-testid={`education-item-${edu.id}`}
              >
                {index > 0 && <div className="absolute -top-3 left-6 w-px h-3 bg-border" />}
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12 shrink-0 border border-card-border">
                    <AvatarImage
                      src={edu.institution_logo_url || undefined}
                      alt={edu.institution}
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                      {edu.institution.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4
                          className="font-medium text-foreground"
                          data-testid={`text-edu-degree-${edu.id}`}
                        >
                          {edu.degree}
                          {edu.field && `, ${edu.field}`}
                        </h4>
                        <p
                          className="text-sm text-muted-foreground"
                          data-testid={`text-edu-institution-${edu.id}`}
                        >
                          {edu.institution}
                        </p>
                        <p
                          className="text-xs text-muted-foreground mt-1"
                          data-testid={`text-edu-dates-${edu.id}`}
                        >
                          {formatDateRange(edu.start_date, edu.end_date, edu.current)}
                        </p>
                      </div>
                      {!readOnly && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(edu)}
                            disabled={isLoading}
                            data-testid={`button-edit-edu-${edu.id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(edu.id)}
                            disabled={isLoading}
                            data-testid={`button-delete-edu-${edu.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {edu.description && (
                      <p
                        className="text-sm text-muted-foreground mt-2 leading-relaxed"
                        data-testid={`text-edu-description-${edu.id}`}
                      >
                        {edu.description}
                      </p>
                    )}
                    {edu.current && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Currently Studying
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}