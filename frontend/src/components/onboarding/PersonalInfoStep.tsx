import { useState, useEffect  } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { axiosInstance } from '../../lib/auth';
import { User, MapPin, Phone, DollarSign, Loader2 } from 'lucide-react';

interface PersonalInfoStepProps {
  onNext: () => void;
}

const PersonalInfoStep = ({ onNext }: PersonalInfoStepProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    first_name: '',      
    last_name: '',       
    bio: '',
    location: '',
    phone: '',           
    availability: 'immediate',
    expected_salary: '',
  });

   useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/applicant/profile/');
        if (response.data) {
          setFormData({
            first_name: response.data.first_name || '',
            last_name: response.data.last_name || '',
            phone: response.data.phone || '',
            location: response.data.location || '',
            bio: response.data.bio || '',
            availability: response.data.availability || 'immediate',
            expected_salary: response.data.expected_salary || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/applicant/profile/', formData);
      toast({ 
        title: 'Personal info saved!',
        description: 'Your information has been successfully saved.'
      });
      onNext();
    } catch (error: any) {
      toast({
        title: 'Error saving personal info',
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
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        </div>
        <p className="text-gray-600">Help employers get to know you better</p>
      </div>

      <div className="space-y-5">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700">
              First Name *
            </Label>
            <Input
              id="first_name"
              placeholder="e.g., John"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              className="mt-1.5 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
            />
          </div>
          <div>
            <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700">
              Last Name *
            </Label>
            <Input
              id="last_name"
              placeholder="e.g., Doe"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              className="mt-1.5 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
            Professional Bio *
          </Label>
          <Textarea
            id="bio"
            placeholder="Write a brief summary about your professional background, skills, and career goals..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={5}
            required
            className="mt-1.5 resize-none focus:border-[#0A66C2] focus:ring-[#0A66C2]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Highlight your key strengths and what makes you unique
          </p>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              Location *
            </div>
          </Label>
          <Input
            id="location"
            placeholder="e.g., Lagos, Nigeria"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            className="mt-1.5 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
          />
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              Phone Number *
            </div>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g., +234 800 000 0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="mt-1.5 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
          />
        </div>

        {/* Availability */}
        <div>
          <Label htmlFor="availability" className="text-sm font-semibold text-gray-700">
            Availability *
          </Label>
          <Select
            value={formData.availability}
            onValueChange={(value) => setFormData({ ...formData, availability: value })}
          >
            <SelectTrigger className="mt-1.5 focus:border-[#0A66C2] focus:ring-[#0A66C2]">
              <SelectValue placeholder="Select your availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="1_week">1 Week Notice</SelectItem>
              <SelectItem value="2_weeks">2 Weeks Notice</SelectItem>
              <SelectItem value="1_month">1 Month Notice</SelectItem>
              <SelectItem value="not_available">Not Currently Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expected Salary */}
        <div>
          <Label htmlFor="salary" className="text-sm font-semibold text-gray-700">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              Expected Salary (NGN/month)
            </div>
          </Label>
          <Input
            id="salary"
            type="number"
            placeholder="e.g., 500000"
            value={formData.expected_salary}
            onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
            className="mt-1.5 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
          />
          <p className="text-xs text-gray-500 mt-1">
            This helps employers match you with appropriate positions
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8 pt-6 border-t">
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

export default PersonalInfoStep;