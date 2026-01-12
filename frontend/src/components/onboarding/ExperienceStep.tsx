import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { useToast } from '../../hooks/use-toast';
import { axiosInstance } from '../../lib/auth';
import { Briefcase, Plus, Trash2, Loader2, ChevronLeft } from 'lucide-react';
import { Card } from '../../components/ui/card';

interface Experience {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
}

interface ExperienceStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ExperienceStep = ({ onNext, onBack }: ExperienceStepProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    job_title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    currently_working: false,
    description: '',
  });

  const handleAddExperience = () => {
    if (!currentExperience.job_title || !currentExperience.company || !currentExperience.start_date) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in job title, company, and start date',
        variant: 'destructive',
      });
      return;
    }

    if (!currentExperience.currently_working && !currentExperience.end_date) {
      toast({
        title: 'End date required',
        description: 'Please provide an end date or mark as currently working',
        variant: 'destructive',
      });
      return;
    }

    setExperiences([...experiences, currentExperience]);
    setCurrentExperience({
      job_title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      currently_working: false,
      description: '',
    });
    setShowForm(false);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (experiences.length > 0) {
        await Promise.all(
          experiences.map(exp => axiosInstance.post('/applicant/experiences/', exp))
        );
        toast({ 
          title: 'Experience saved!',
          description: `${experiences.length} experience${experiences.length > 1 ? 's' : ''} added successfully.`
        });
      }
      onNext();
    } catch (error: any) {
      toast({
        title: 'Error saving experience',
        description: error.response?.data?.detail || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-[#0A66C2] rounded-lg">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
        </div>
        <p className="text-gray-600">Share your professional journey</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Experience List */}
        {experiences.map((exp, index) => (
          <Card key={index} className="p-4 border-l-4 border-l-[#0A66C2]">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{exp.job_title}</h3>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                  {exp.currently_working ? ' Present' : ` ${new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                  {exp.location && ` • ${exp.location}`}
                </p>
                {exp.description && (
                  <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveExperience(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}

        {/* Add Experience Form */}
        {showForm ? (
          <Card className="p-6 bg-gray-50 border-2 border-dashed border-gray-300">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Job Title *</Label>
                  <Input
                    placeholder="e.g., Software Engineer"
                    value={currentExperience.job_title}
                    onChange={(e) => setCurrentExperience({ ...currentExperience, job_title: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Company *</Label>
                  <Input
                    placeholder="e.g., Google"
                    value={currentExperience.company}
                    onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Location</Label>
                <Input
                  placeholder="e.g., Lagos, Nigeria"
                  value={currentExperience.location}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, location: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Start Date *</Label>
                  <Input
                    type="date"
                    value={currentExperience.start_date}
                    onChange={(e) => setCurrentExperience({ ...currentExperience, start_date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    End Date {!currentExperience.currently_working && '*'}
                  </Label>
                  <Input
                    type="date"
                    value={currentExperience.end_date}
                    onChange={(e) => setCurrentExperience({ ...currentExperience, end_date: e.target.value })}
                    disabled={currentExperience.currently_working}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="currently_working"
                  checked={currentExperience.currently_working}
                  onCheckedChange={(checked) => 
                    setCurrentExperience({ 
                      ...currentExperience, 
                      currently_working: checked as boolean,
                      end_date: checked ? '' : currentExperience.end_date
                    })
                  }
                />
                <label
                  htmlFor="currently_working"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I currently work here
                </label>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Description</Label>
                <Textarea
                  placeholder="Describe your responsibilities and achievements..."
                  value={currentExperience.description}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddExperience}
                  className="flex-1 bg-[#0A66C2] hover:bg-[#004182]"
                >
                  Add Experience
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            variant="outline"
            className="w-full border-2 border-dashed border-gray-300 hover:border-[#0A66C2] hover:bg-blue-50 h-20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Work Experience
          </Button>
        )}
      </div>

      {/* Empty State */}
      {experiences.length === 0 && !showForm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-6">
          <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">No experience added yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Click "Add Work Experience" to get started
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="px-6 border-gray-300 hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold h-11"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ExperienceStep;