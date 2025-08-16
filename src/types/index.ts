export interface Contact {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  organization: string;
  domain: string;
  linkedIn?: string;
  twitter?: string;
}

export interface AttioCompany {
  webUrl: string;
  created_at: string; // ISO timestamp
  description: string;
  categories: string[];
  domain: string;
  linkedIn?: string;
  location?: string;
  name: string;
  twitter?: string;
}
