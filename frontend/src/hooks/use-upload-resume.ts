import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../lib/auth";
import { useToast } from "./use-toast";

export const useUploadResume = () => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("cv", file);

      return await apiFetch("/applicant/profile/", {
        method: "PATCH",
        body: formData,
      });
    },

    onSuccess: (data) => {
      if (user) {
        updateUser({
          ...user,
          applicant_profile: {
            ...user.applicant_profile,
            ...data,
            cv: data.cv,
          },
        });
      }

      queryClient.invalidateQueries({ queryKey: ["job-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["applicant-profile"] });

      toast({
        title: "Resume uploaded successfully! 🎉",
        description: "Your AI recommendations are now personalized.",
      });
    },

    onError: (error: any) => {
      const message =
        error?.message ||
        error?.detail ||
        "Failed to upload resume. Please try again.";

      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });

      console.error("Resume upload error:", error);
    },
  });
};