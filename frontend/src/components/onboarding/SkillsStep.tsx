import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { axiosInstance } from '../../lib/auth';
import { Award, X, Plus, Loader2, ChevronLeft } from 'lucide-react';

interface SkillsStepProps {
  onNext: () => void;
  onBack: () => void;
}

const SkillsStep = ({ onNext, onBack }: SkillsStepProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  const handleAddSkill = () => {
    const trimmedSkill = currentSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (skills.length === 0) {
      toast({
        title: 'Add at least one skill',
        description: 'Please add at least one skill to continue',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Submit all skills
      await Promise.all(
        skills.map(skill => 
          axiosInstance.post('/applicant/skills/', { skill_name: skill })
        )
      );
      
      toast({ 
        title: 'Skills saved!',
        description: `${skills.length} skill${skills.length > 1 ? 's' : ''} added successfully.`
      });
      onNext();
    } catch (error: any) {
      toast({
        title: 'Error saving skills',
        description: error.response?.data?.detail || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
    'SQL', 'Project Management', 'Communication', 'Problem Solving',
    'Team Leadership', 'Data Analysis', 'UI/UX Design'
  ];

  const availableSuggestions = suggestedSkills.filter(s => !skills.includes(s));

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-[#0A66C2] rounded-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your Skills</h2>
        </div>
        <p className="text-gray-600">Add skills that showcase your expertise</p>
      </div>

      <div className="space-y-6">
        {/* Skill Input */}
        <div>
          <Label htmlFor="skill" className="text-sm font-semibold text-gray-700">
            Add Skill
          </Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              id="skill"
              placeholder="e.g., JavaScript, Project Management"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              className="focus:border-[#0A66C2] focus:ring-[#0A66C2]"
            />
            <Button
              type="button"
              onClick={handleAddSkill}
              disabled={!currentSkill.trim()}
              className="bg-[#0A66C2] hover:bg-[#004182] shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press Enter or click Add to include the skill
          </p>
        </div>

        {/* Added Skills */}
        {skills.length > 0 && (
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Your Skills ({skills.length})
            </Label>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1.5 bg-[#0A66C2] text-white hover:bg-[#004182] text-sm font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 hover:opacity-70"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Skills */}
        {availableSuggestions.length > 0 && (
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Suggested Skills
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="px-3 py-1.5 cursor-pointer hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
                  onClick={() => {
                    setSkills([...skills, skill]);
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {skill}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click on any suggestion to add it to your skills
            </p>
          </div>
        )}

        {/* Empty State */}
        {skills.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Award className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No skills added yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Add your first skill using the input above or choose from suggestions
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8 pt-6 border-t">
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
          disabled={loading || skills.length === 0}
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

export default SkillsStep;