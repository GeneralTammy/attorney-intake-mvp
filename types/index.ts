export interface UserProfile {
  id: string;
  full_name: string;
  firm_name: string;
  created_at: string;
}

export interface Intake {
  id: string;
  user_id: string;
  case_type: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string | null;
  client_phone: string | null;
  case_data: Record<string, any>;
  status: "draft" | "ready_for_review" | "consultation_booked";
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  intake_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface ReadinessReport {
  id: string;
  intake_id: string;
  missing_fields: Array<{
    field: string;
    reason: string;
  }>;
  completed_fields: Array<{
    field: string;
    value: any;
  }>;
  overall_score: number;
  generated_at: string;
}

export interface CaseTypeConfig {
  label: string;
  required: string[];
  optional: string[];
}

export type CaseType = "personal_injury" | "family" | "criminal_defense";
