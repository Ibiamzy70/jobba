import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../hooks/use-toast";
import {
  usePortfolio,
  useCreatePortfolioItem,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
} from "../../hooks/use-portfolio";
import type { components } from "../../types/api-schema";

type PortfolioItem = components["schemas"]["PortfolioItem"];

interface PortfolioCardProps {
  readOnly?: boolean;
  items?: any;
  profileId?: string | number;
}

interface FormState {
  title: string;
  description: string;
  project_url: string;
  technologies: string[];
}

const emptyForm: FormState = {
  title: "",
  description: "",
  project_url: "",
  technologies: [],
};

const URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

export default function PortfolioCard({ profileId, readOnly, items: passedItems }: PortfolioCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [techInput, setTechInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = usePortfolio({ 
    profile: profileId,
    enabled: !readOnly,
  });
  const createMutation = useCreatePortfolioItem();
  const updateMutation = useUpdatePortfolioItem();
  const deleteMutation = useDeletePortfolioItem();
  const { toast } = useToast();

   
  const items = readOnly ? (passedItems || []) : (data?.results || []);
  const showLoading = !readOnly && isLoading;
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

 

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    setFormData(emptyForm);
    setTechInput("");
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setFormData({
      title: item.title,
      description: item.description || "",
      project_url: item.project_url || "",
      technologies: item.technologies || [],
    });
    setTechInput("");
    setImageFile(null);
    setImagePreview(item.image_url || null);
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleImageChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Only images allowed", variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !formData.technologies.includes(trimmed)) {
      if (formData.technologies.length >= 10) {
        toast({ title: "Limit reached", description: "Max 10 technologies", variant: "destructive" });
        return;
      }
      setFormData({
        ...formData,
        technologies: [...formData.technologies, trimmed],
      });
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== tech),
    });
  };

  const handleSave = async () => {
  if (!formData.title.trim()) {
    toast({ title: "Title required", variant: "destructive" });
    return;
  }
  if (!imagePreview && !imageFile) {
    toast({ title: "Image required", variant: "destructive" });
    return;
  }
  if (formData.project_url && !URL_REGEX.test(formData.project_url)) {
    toast({ title: "Invalid URL", description: "Must start with http(s)://", variant: "destructive" });
    return;
  }

  const fd = new FormData();
  fd.append("title", formData.title);
  if (formData.description) fd.append("description", formData.description);
  if (formData.project_url) fd.append("project_url", formData.project_url);

  // Send technologies as JSON string instead of multiple append calls
  if (formData.technologies.length > 0) {
    fd.append("technologies", JSON.stringify(formData.technologies));
  } else {
    fd.append("technologies", JSON.stringify([]));
  }

  // Handle image upload
  if (imageFile) {
    fd.append("image", imageFile);
  } else if (editingId) {
    // If editing and no new image file
    const originalItem = items.find((i) => i.id === editingId);
    const hadImageOriginally = !!originalItem?.image_url;
    
    // If user removed the image (imagePreview is null but had image before)
    if (hadImageOriginally && imagePreview === null) {
      fd.append("image", ""); // Clear the image
    }
    // If imagePreview exists (keeping old image), don't send image field at all
  }

  try {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, payload: fd });
    } else {
      await createMutation.mutateAsync(fd);
    }
    toast({ title: editingId ? "Project updated" : "Project added" });
    setIsDialogOpen(false);
    resetForm();
  } catch (error: any) {
    console.error("Save error:", error);
    console.error("Error body:", error.body);
    console.error("Error response:", error.response);
    
    // Log FormData contents for debugging
    console.log("FormData contents:");
    for (let [key, value] of fd.entries()) {
      console.log(key, value);
    }
    
    toast({
      title: "Failed to save",
      description: error.body?.detail || JSON.stringify(error.body) || error.message || "Please try again",
      variant: "destructive",
    });
  }
};

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirmId);
      toast({ title: "Project deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-32 text-center">
          <Loader2 className="h-16 w-16 mx-auto animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-6 w-6 text-indigo-600" />
          <CardTitle>Portfolio</CardTitle>
          <Badge variant="secondary">{items.length}</Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenAdd} disabled={isMutating}>
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Project" : "Add Project"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Image Upload */}
              <div>
                <Label>Project Image *</Label>
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging ? "border-indigo-500 bg-indigo-50" : "border-muted-foreground/25"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag & drop or click to upload
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                      />
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Max 5MB, PNG/JPG/WEBP</p>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E-commerce Platform"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Built a full-stack e-commerce solution..."
                  rows={4}
                  maxLength={500}
                />
              </div>

              {/* Project URL */}
              <div>
                <Label htmlFor="url">Project URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.project_url}
                  onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              {/* Technologies */}
              <div>
                <Label>Technologies Used</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                    placeholder="React, Node.js..."
                    maxLength={30}
                  />
                  <Button type="button" onClick={handleAddTech} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1">
                      {tech}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveTech(tech)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isMutating}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isMutating}>
                {isMutating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingId ? "Update" : "Add"} Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
            <h3 className="text-xl font-semibold">No projects yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Showcase your best work to attract recruiters
            </p>
            <Button variant="ghost" size="sm" onClick={handleOpenAdd} className="mt-4">
              Add your first project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl overflow-hidden border border-transparent hover:border-indigo-300 hover:shadow-2xl transition-all"
              >
                {/* Delete confirmation overlay */}
                {deleteConfirmId === item.id && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-2xl">
                    <div className="bg-card p-6 rounded-xl shadow-2xl text-center">
                      <p className="text-lg font-medium mb-4">Delete this project?</p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="destructive" onClick={confirmDelete} disabled={isMutating}>
                          {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="aspect-video bg-muted relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                      <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full shadow-lg"
                      onClick={() => handleOpenEdit(item)}
                      disabled={isMutating}
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-10 w-10 rounded-full shadow-lg"
                      onClick={() => handleDeleteClick(item.id)}
                      disabled={isMutating}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 bg-card">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                    {item.project_url && (
                      <a
                        href={item.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-indigo-600 transition-colors"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm mb-4">
                      {item.description}
                    </p>
                  )}
                  {item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}