import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Pencil,
  MapPin,
  Phone,
  Linkedin,
  Github,
  Globe,
  Check,
  X,
  Camera,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useProfile, useUpdateProfile } from "../../hooks/use-personalinfo";
import { useQueryClient } from "@tanstack/react-query"; 
import { profileQueryKeys } from "../../api/personalinfo";
import { optimizeImage } from "../../services/mediaService";

interface PersonalInfoCardProps {
  readOnly?: boolean;
  data?: any;
}

export default function PersonalInfoCard({ readOnly = false, data }: PersonalInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
   const { data: fetchedProfile, isLoading, isError } = useProfile();
  
  const updateMutation = useUpdateProfile();
  const { toast } = useToast();
  const qc = useQueryClient(); 

  
  const profile = readOnly ? data : fetchedProfile;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    location: "",
    bio: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  // Sync form with profile 
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        portfolio: profile.portfolio || "",
      });
    }
  }, [profile]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAvatarChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum 5MB allowed",
        variant: "destructive",
      });
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleAvatarChange(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (
      !isValidUrl(formData.linkedin) ||
      !isValidUrl(formData.github) ||
      !isValidUrl(formData.portfolio)
    ) {
      toast({
        title: "Invalid URL",
        description: "Please enter valid links (e.g., https://linkedin.com/in/yourname)",
        variant: "destructive",
      });
      return;
    }

    try {
      let newAvatarUrl: string | null = null;

      if (avatarFile) {
        try {
          newAvatarUrl = await optimizeImage(avatarFile);
          toast({
            title: "Avatar uploaded!",
            description: "Your profile picture has been updated.",
          });
        } catch (e) {
          toast({
            title: "Avatar upload failed",
            description: "Image processing unavailable. Please try again later.",
            variant: "destructive",
          });
          return;
        }
      }

      if (!avatarFile && avatarPreview === null && profile?.avatar_url) {
        newAvatarUrl = "";
        toast({
          title: "Avatar removed",
          description: "Your profile picture has been removed.",
        });
      }

      if (newAvatarUrl !== null && newAvatarUrl !== profile?.avatar_url) {
        await updateMutation.mutateAsync({ avatar: newAvatarUrl || null } as any);
        qc.invalidateQueries({ queryKey: profileQueryKeys.detail() });
      }

      const textFields: (keyof typeof formData)[] = [
        "first_name",
        "last_name",
        "phone",
        "location",
        "bio",
        "linkedin",
        "github",
        "portfolio",
      ];

      const changedFields: Record<string, any> = {};
      textFields.forEach((key) => {
        const current = (profile?.[key] as string) || "";
        const updated = formData[key] || "";
        if (updated !== current) {
          changedFields[key] = updated;
        }
      });

      if (Object.keys(changedFields).length > 0) {
        await updateMutation.mutateAsync(changedFields);
        toast({
          title: "Profile updated!",
          description: "Your changes have been saved successfully.",
        });
      }

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading only if not readOnly and still loading
  if (!readOnly && isLoading) {
    return (
      <Card>
        <CardContent className="py-32 text-center">
          <Loader2 className="h-16 w-16 mx-auto animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  // Show error only if not readOnly and there's an error
  if (!readOnly && (isError || !profile)) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <p className="text-lg text-muted-foreground">Unable to load profile.</p>
        </CardContent>
      </Card>
    );
  }

  // If readOnly and no data provided
  if (readOnly && !profile) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No profile data available.</p>
        </CardContent>
      </Card>
    );
  }

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Your Name";
  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();
  const currentAvatar = avatarPreview || profile.avatar_url;
  const isSaving = updateMutation.isPending;

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-12">
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          {/* Avatar */}
          <div
            className={`relative group w-40 h-40 rounded-full overflow-hidden ring-8 ring-white shadow-2xl ${
              isDragging ? "ring-indigo-400" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!readOnly) setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={readOnly ? undefined : handleDrop}
          >
            <Avatar className="h-full w-full">
              <AvatarImage src={currentAvatar} alt={fullName} />
              <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {initials || "UN"}
              </AvatarFallback>
            </Avatar>

            {isEditing && !readOnly && (
              <>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload className="h-12 w-12 text-white" />
                </div>
                <label className="absolute bottom-3 right-3 cursor-pointer">
                  <Button size="icon" className="h-12 w-12 rounded-full bg-white shadow-xl hover:bg-gray-100">
                    <Camera className="h-6 w-6" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleAvatarChange(e.target.files[0])}
                  />
                </label>
                {currentAvatar && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-3 right-3 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 space-y-6">
            <div>
              {isEditing && !readOnly ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="First name"
                    className="text-3xl font-bold"
                  />
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Last name"
                    className="text-3xl font-bold"
                  />
                </div>
              ) : (
                <h1 className="text-4xl font-bold text-foreground">{fullName}</h1>
              )}
            </div>

            <div className="flex flex-wrap gap-6 text-muted-foreground">
              {isEditing && !readOnly ? (
                <>
                  <div className="flex items-center gap-3 min-w-64">
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location"
                    />
                  </div>
                  <div className="flex items-center gap-3 min-w-64">
                    <Phone className="h-5 w-5 flex-shrink-0" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone"
                    />
                  </div>
                </>
              ) : (
                <>
                  {profile.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {profile.location}
                    </span>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      {profile.phone}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Edit / Save / Cancel - Only show if NOT readOnly */}
          {!readOnly && (
            <div className="flex gap-3 self-start sm:self-center">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                  >
                    {isSaving ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Check className="h-6 w-6" />
                    )}
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="icon" onClick={handleEdit}>
                  <Pencil className="h-6 w-6" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-12 pt-8">
        {/* About Me */}
        <div>
          <h3 className="text-xl font-semibold mb-4">About Me</h3>
          {isEditing && !readOnly ? (
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell employers about yourself..."
              className="min-h-48 text-lg leading-relaxed resize-none"
            />
          ) : (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {profile.bio || "No bio added yet."}
            </p>
          )}
        </div>

        {/* Connect Links */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Connect</h3>
          {isEditing && !readOnly ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Linkedin className="h-6 w-6 text-muted-foreground" />
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="flex items-center gap-4">
                <Github className="h-6 w-6 text-muted-foreground" />
                <Input
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="flex items-center gap-4">
                <Globe className="h-6 w-6 text-muted-foreground" />
                <Input
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {profile.linkedin && (
                <Button variant="outline" size="lg" asChild>
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5 mr-3" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {profile.github && (
                <Button variant="outline" size="lg" asChild>
                  <a href={profile.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5 mr-3" />
                    GitHub
                  </a>
                </Button>
              )}
              {profile.portfolio && (
                <Button variant="outline" size="lg" asChild>
                  <a href={profile.portfolio} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-5 w-5 mr-3" />
                    Portfolio
                  </a>
                </Button>
              )}
              {!profile.linkedin && !profile.github && !profile.portfolio && (
                <Badge variant="secondary" className="text-lg py-3 px-6">
                  No links added
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}