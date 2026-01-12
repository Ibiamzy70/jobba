import * as Dialog from '@radix-ui/react-dialog';
import { UploadCloud, X, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateApplication } from '@/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface Props {
  jobId: number | string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ApplyModal: React.FC<Props> = ({ jobId, open = false, onOpenChange, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cover, setCover] = useState('');
  const [resume, setResume] = useState<File | null>(null);

  const { user } = useAuth();
  const { mutateAsync, isPending } = useCreateApplication();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Resume must be under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Type check — bulletproof
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document (.doc, .docx)",
        variant: "destructive",
      });
      return;
    }

    setResume(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resume) {
      toast({
        title: "Resume required",
        description: "Please upload your resume to apply",
        variant: "destructive",
      });
      return;
    }

    const fd = new FormData();
    fd.append('job', String(jobId));
    fd.append('first_name', firstName || user?.first_name || '');
    fd.append('last_name', lastName || user?.last_name || '');
    fd.append('email', email || user?.email || '');
    fd.append('phone', phone || '');
    if (cover.trim()) fd.append('cover_letter', cover.trim());
    fd.append('resume', resume);

    try {
      await mutateAsync(fd);
      toast({
        title: "Application submitted!",
        description: "Your application was sent successfully. Good luck!",
        className: "border-green-200 bg-green-50 text-green-800",
      });
      onSuccess?.();
      onOpenChange?.(false);
    } catch (err: any) {
      toast({
        title: "Failed to apply",
        description: err?.body?.detail || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
          Apply Now <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:w-[95vw] sm:max-w-none"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex flex-col space-y-1.5 text-center sm:text-left bg-gradient-to-br from-indigo-50 to-white p-6 border-b border-slate-200 rounded-t-2xl">
            <Dialog.Title className="text-2xl font-bold text-slate-900">
              Apply for this position
            </Dialog.Title>
            <Dialog.Description className="text-sm text-slate-600">
              One last step — complete your application below.
            </Dialog.Description>
            <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 opacity-70 transition-all hover:opacity-100 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <form onSubmit={submit} className="px-5 py-6 sm:px-8 space-y-6">
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12"
              />
              <Input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12"
              />
            </div>

            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />

            <Input
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12"
            />

            <textarea
              placeholder="Cover letter (optional) – Tell us why you're excited about this role..."
              className="min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none resize-none transition-all"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
            />

            {/* Resume Upload — Mobile-optimized */}
            <label
              className={`flex flex-col items-center justify-center w-full h-40 sm:h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                resume
                  ? 'border-indigo-400 bg-indigo-50/40'
                  : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3 px-6 text-center">
                {resume ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold text-indigo-700">{resume.name}</p>
                      <p className="text-xs text-indigo-600 mt-1">
                        {(resume.size / 1024 / 1024).toFixed(2)} MB • Click to replace
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        <span className="font-bold text-indigo-600">Click to upload</span> your resume
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX • Max 5MB</p>
                    </div>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
            </label>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" className="order-2 sm:order-1">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={isPending || !resume}
                className="order-1 sm:order-2 min-w-40 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ApplyModal;