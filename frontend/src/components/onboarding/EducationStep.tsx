import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { axiosInstance } from '@/lib/auth';
import { GraduationCap, Plus, Trash2, Loader2, ChevronLeft, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';

interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description?: string;
}

interface EducationStepProps {
  onNext: () => void;
  onBack: () => void;
}

const EducationStep = ({ onNext, onBack }: EducationStepProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [educations, setEducations] = useState<Education[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education>({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  const degreeOptions = [
    'High School',
    'Associate Degree',
    "Bachelor's Degree",
    "Master's Degree",
    'Doctorate (PhD)',
    'Professional Certification',
    'Bootcamp',
    'Other',
  ];

  const handleAddEducation = () => {
    if (!currentEducation.institution || !currentEducation.degree || !currentEducation.field_of_study || !currentEducation.start_date || !currentEducation.end_date) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setEducations([...educations, currentEducation]);
    setCurrentEducation({
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      description: '',
    });
    setShowForm(false);
  };

  const handleRemoveEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (educations.length > 0) {
        await Promise.all(
          educations.map(edu => axiosInstance.post('/applicant/educations/', edu))
        );
        toast({ 
          title: 'Education saved!',
          description: `${educations.length} education entr${educations.length > 1 ? 'ies' : 'y'} added successfully.`
        });
      }

      await axiosInstance.patch('/applicant/personalinfo/', {
      onboarding_completed: true
    });
    
      toast({
        title: '🎉 Profile Complete!',
        description: 'Your profile has been successfully set up.',
      });
      
      onNext();
    } catch (error: any) {
      toast({
        title: 'Error saving education',
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
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Education</h2>
        </div>
        <p className="text-gray-600">Add your academic background and achievements</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Education List */}
        {educations.map((edu, index) => (
          <Card key={index} className="p-4 border-l-4 border-l-[#0A66C2]">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-sm text-[#0A66C2] font-medium mt-1">{edu.field_of_study}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                  {new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                {edu.description && (
                  <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveEducation(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}

        {/* Add Education Form */}
        {showForm ? (
          <Card className="p-6 bg-gray-50 border-2 border-dashed border-gray-300">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Institution *</Label>
                <Input
                  placeholder="e.g., University of Lagos"
                  value={currentEducation.institution}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, institution: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Degree *</Label>
                  <Select
                    value={currentEducation.degree}
                    onValueChange={(value) => setCurrentEducation({ ...currentEducation, degree: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {degreeOptions.map((degree) => (
                        <SelectItem key={degree} value={degree}>
                          {degree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Field of Study *</Label>
                  <Input
                    placeholder="e.g., Computer Science"
                    value={currentEducation.field_of_study}
                    onChange={(e) => setCurrentEducation({ ...currentEducation, field_of_study: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Start Date *</Label>
                  <Input
                    type="date"
                    value={currentEducation.start_date}
                    onChange={(e) => setCurrentEducation({ ...currentEducation, start_date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">End Date *</Label>
                  <Input
                    type="date"
                    value={currentEducation.end_date}
                    onChange={(e) => setCurrentEducation({ ...currentEducation, end_date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Description (Optional)</Label>
                <Textarea
                  placeholder="Notable achievements, honors, GPA, relevant coursework..."
                  value={currentEducation.description}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, description: e.target.value })}
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
                  onClick={handleAddEducation}
                  className="flex-1 bg-[#0A66C2] hover:bg-[#004182]"
                >
                  Add Education
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
            Add Education
          </Button>
        )}
      </div>

      {/* Empty State */}
      {educations.length === 0 && !showForm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-6">
          <GraduationCap className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">No education added yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Click "Add Education" to get started
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
              Completing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Setup
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EducationStep;