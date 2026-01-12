import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, X, Sparkles, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSkills,
  useCreateSkill,
  useDeleteSkill,
  skillsQueryKeys,
} from "../../hooks/use-skills";
import type { components } from "../../types/api-schema";

type Skill = components["schemas"]["Skill"];

interface SkillsCardProps {
  readOnly?: boolean;
  data?: Skill[];
  profileId?: string | number;
}

type Category = "technical" | "soft" | "language" | "tools" | "other";
type Proficiency = "beginner" | "intermediate" | "advanced" | "expert";

// Define allowed Badge variants (matches your UI library)
type BadgeVariant = "outline" | "secondary" | "default" | "destructive";

const categories = [
  { value: "technical" as const, label: "Technical" },
  { value: "soft" as const, label: "Soft Skills" },
  { value: "language" as const, label: "Languages" },
  { value: "tools" as const, label: "Tools & Software" },
  { value: "other" as const, label: "Other" },
];

const proficiencyLevels = [
  { value: "beginner" as const, label: "Beginner", variant: "outline" as BadgeVariant },
  { value: "intermediate" as const, label: "Intermediate", variant: "secondary" as BadgeVariant },
  { value: "advanced" as const, label: "Advanced", variant: "default" as BadgeVariant },
  { value: "expert" as const, label: "Expert", variant: "default" as BadgeVariant },
];

export default function SkillsCard({ profileId, readOnly, data }: SkillsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "technical" as Category,
    proficiency: "intermediate" as Proficiency,
  });
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const queryClient = useQueryClient();
  
  // Only fetch if NOT readOnly
  const { data: fetchedData, isFetching } = useSkills({ 
    profile: profileId,
    enabled: !readOnly, // Prevent API call when readOnly
  });
  
  const createMutation = useCreateSkill();
  const deleteMutation = useDeleteSkill();
  const { toast } = useToast();

  // Use passed data if readOnly, otherwise use fetched data
  const skills = readOnly ? (data || []) : (fetchedData?.results || []);
  const showLoading = !readOnly && isFetching;
  const isCreating = createMutation.isPending;

  const groupedSkills = skills.reduce((acc, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const handleAdd = async () => {
    if (!formData.name.trim()) return;

    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        category: formData.category,
        proficiency: formData.proficiency,
        profile: Number(profileId),
      });
      toast({ title: "Skill added successfully" });
      setFormData({ name: "", category: "technical", proficiency: "intermediate" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to add skill:", error);
      toast({
        title: "Failed to add skill",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Skill removed" });
      queryClient.invalidateQueries({
        queryKey: skillsQueryKeys.list({ profile: profileId }),
      });
    } catch (error) {
      console.error("Failed to delete skill:", error);
      toast({
        title: "Failed to remove skill",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getProficiencyVariant = (proficiency: Proficiency): BadgeVariant => {
    return proficiencyLevels.find(l => l.value === proficiency)?.variant || "outline";
  };

  const getCategoryLabel = (value: string) =>
    categories.find(c => c.value === value)?.label || value;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          <CardTitle>Skills</CardTitle>
          <Badge variant="secondary">{skills.length}</Badge>
        </div>
        {!readOnly && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Skill</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <Input
                  placeholder="Skill name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as Category })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Proficiency</label>
                    <Select
                      value={formData.proficiency}
                      onValueChange={(v) => setFormData({ ...formData, proficiency: v as Proficiency })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {proficiencyLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={!formData.name.trim() || isCreating}>
                  {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Add Skill
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent>
        {showLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
            <h3 className="text-xl font-semibold">No skills yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Add skills to help recruiters find you
            </p>
            {!readOnly && (
              <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)} className="mt-4">
                Add your first skill
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  {getCategoryLabel(category)}
                </h4>
                <div className="flex flex-wrap gap-3">
                  <AnimatePresence mode="popLayout">
                    {categorySkills.map((skill) => (
                      <motion.div
                        key={skill.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <Badge
                          variant={getProficiencyVariant(skill.proficiency)}
                          className={`gap-2 py-1.5 text-sm font-medium ${!readOnly ? 'group pr-2' : ''}`}
                        >
                          {skill.name}
                          {!readOnly && (
                            <button
                              onClick={() => handleDelete(skill.id)}
                              disabled={deletingIds.has(skill.id)}
                              className="rounded-full p-1 opacity-60 hover:opacity-100 hover:bg-destructive/20 transition-all"
                              aria-label={`Remove ${skill.name}`}
                            >
                              {deletingIds.has(skill.id) ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}