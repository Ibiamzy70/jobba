export interface components {
  schemas: {
    Education: {
      id: number;
      profile: number;
      institution: string;
      institution_logo_url?: string | null;
      degree: string;
      field?: string | null;
      start_date: string; 
      end_date?: string | null; 
      current: boolean;
      description?: string | null;
      created_at: string;
      updated_at: string;
    };

    EducationCreate: Omit<
      components["schemas"]["Education"],
      "id" | "created_at" | "updated_at" | "profile"
    > & {
      profile: number;
    };

    EducationUpdate: Partial<
      Omit<
        components["schemas"]["EducationCreate"],
        "profile"
      >
    >;

    PaginatedEducationList: {
      count: number;
      next: string | null;
      previous: string | null;
      results: components["schemas"]["Education"][];
    };


    
Experience: {
  id: number;
  profile: number;
  company: string;
  company_logo_url?: string | null;
  position: string;
  location?: string | null;
  start_date: string; 
  end_date?: string | null;
  current: boolean;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

ExperienceCreate: Omit<
  components["schemas"]["Experience"],
  "id" | "created_at" | "updated_at" | "profile"
> & {
  profile: number;
};

ExperienceUpdate: Partial<
  Omit<components["schemas"]["ExperienceCreate"], "profile">
>;

PaginatedExperienceList: {
  count: number;
  next: string | null;
  previous: string | null;
  results: components["schemas"]["Experience"][];
};


   
JobOffer: {
  id: number;
  job: number;
  job_title: string;
  company: string;
  company_logo_url?: string | null;
  position: string;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  message?: string | null;
  status: "pending" | "accepted" | "declined";
  is_new: boolean;
  sent_at: string;
};

PaginatedJobOfferList: {
  count: number;
  next: string | null;
  previous: string | null;
  results: components["schemas"]["JobOffer"][];
};


    Job: {
      id: number;
      title: string;
      description: string;
      company: string;
      location: string;
      salary_min?: number | null;
      salary_max?: number | null;
      job_type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | "full_time" | "part_time" | "contract" | "temporary" | "internship" | "gig"; // ← Add lowercase options
      experience_level: "INTERN" | "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "DIRECTOR" | "unskilled" | "semi_skilled" | "skilled" | "intern" | "junior" | "mid" | "senior" | "lead" | "director" | "professional"; // ← Keep old + add new
      employment_level?: "unskilled" | "semi_skilled" | "skilled" | "intern" | "junior" | "mid" | "senior" | "lead" | "director" | "professional"; // ← Add this alias
      is_published?: boolean;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      posted_by: number;
      owner: number; 
      applied_count?: number;
      views_count?: number;
      status?: "active" | "closed" | "draft";
      employment_type?: string;
      applications_count?: number;
  

    };

    JobCreate: Omit<
      components["schemas"]["Job"],
      "id" | "created_at" | "updated_at" | "applied_count" | "views_count"
    > & {
      title: string;
      description: string;
      company: string;
      location: string;
    };

    JobUpdate: Partial<
      Pick<
        components["schemas"]["Job"],
        | "title"
        | "description"
        | "company"
        | "location"
        | "salary_min"
        | "salary_max"
        | "job_type"
        | "experience_level"
        | "is_active"
      >
    >;

    

    PaginatedJobList: {
      count: number;
      next: string | null;
      previous: string | null;
      results: components["schemas"]["Job"][];
    };


// Updated Application schema matching your existing code structure

ApplicantRef: 
    | number
    | {
        id: number;
        first_name?: string;
        last_name?: string;
        avatar?: string | null;
        email?: string;
      };


Application: {
  id: number;
  job: number | {
    id: number;
    owner_id: number;
    title?: string;
    company_name?: string;
    [key: string]: any;
  };
  job_title?: string;
  applicant: components["schemas"]["ApplicantRef"]; 
  applicant_name?: string;
  applicant_email?: string;
  applicant_avatar?: string | null;
  resume: string;
  cover_letter?: string | null;
  status: "PENDING" | "REVIEWED" | "INTERVIEW" | "REJECTED" | "ACCEPTED";
  applied_at: string;
  updated_at: string;
  created_at: string;
  company_name?: string;
  company_logo?: string | null;
  ai_match_score?: number | null;
};

ApplicationCreate: {
  job: number;
  resume: File | string;
  cover_letter?: string | null;
};

ApplicationUpdate: {
  status?: "applied" | "under_review" | "shortlisted" | "interview" | "offer" | "rejected";
}

PaginatedApplicationList: {
  count: number;
  next: string | null;
  previous: string | null;
  results: components["schemas"]["Application"][];
};
    
JobSeekerProfile: {
  //id: number;
  //user: number;
  first_name: string;
  last_name: string;
  //email: string;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  linkedin: string | null;        
  github: string | null;          
  portfolio: string | null;
  created_at: string;
  updated_at: string;
};

JobSeekerProfileUpdate: Partial<
  Omit<components["schemas"]["JobSeekerProfile"], "id" | "user" | "created_at" | "updated_at">
>;

Employer: {
  id: number;
  user: number;
  company_name: string;
  logo?: string | null;
  description: string;
  website?: string | null;
  industry: string;
  employee_size: string;
  address: string;
  country: string;
  state: string;
  city?: string | null;
  phone_number: string;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
  updated_at: string;
};

EmployerUpdate: Partial<
  Omit<
    components["schemas"]["Employer"],
    | "id"
    | "user"
    | "verification_status"
    | "created_at"
    | "updated_at"
  >
>;

Skill: {
  id: number;
  profile: number;
  name: string;
  category: "technical" | "soft" | "language" | "tools" | "other";
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  created_at: string;
  updated_at: string;
};

SkillCreate: Omit<
  components["schemas"]["Skill"],
  "id" | "created_at" | "updated_at" | "profile"
> & {
  profile: number;
};

SkillUpdate: Partial<
  Omit<components["schemas"]["SkillCreate"], "profile">
>;

PaginatedSkillList: {
  count: number;
  next: string | null;
  previous: string | null;
  results: components["schemas"]["Skill"][];
};





PortfolioItem: {
  id: number;
  profile: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  project_url?: string | null;
  technologies: string[];
  created_at: string;
  updated_at: string;
};

PortfolioItemCreate: Omit<
  components["schemas"]["PortfolioItem"],
  "id" | "created_at" | "updated_at" | "profile"
> & {
  profile: number;
};

PortfolioItemUpdate: Partial<
  Omit<components["schemas"]["PortfolioItemCreate"], "profile">
>;

PaginatedPortfolioItemList: {
  count: number;
  next: string | null;
  previous: string | null;
  results: components["schemas"]["PortfolioItem"][];
};


    
Notification: {
  id: number;
  type: "job_offer" | "application_accepted" | "application_rejected" | "new_message" | "profile_view" | "profile_match" | "featured";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id?: number | null;
  related_url?: string | null;
};

PaginatedNotificationList: {
  count: number;
  next: string | null;
  previous: string | null;
  results: components["schemas"]["Notification"][];
};

    
Message: {
  id: number;
  sender: number;
  sender_name: string;
  sender_avatar_url?: string | null;
  subject?: string | null;
  preview: string;
  is_read: boolean;
  created_at: string;
};

PaginatedMessageList: {
  count: number;
  next: string | null;
  previous: string | null;
  results: components["schemas"]["Message"][];
};

    ErrorDetail: {
      detail?: string;
      message?: string;
      code?: string;
    } & {
      [field: string]: string[] | undefined;
    };

    ValidationError: {
      [field: string]: string[];
    };
  };

  responses?: {
    TokenObtainPair: {
      access: string;
      refresh: string;
    };
    TokenRefresh: {
      access: string;
    };
  };
}






declare global {
  namespace ApiSchema {
   
    type components = import("./api-schema").components;
  } 
}

export {};
