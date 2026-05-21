export interface Team {
  id: number;
  abbreviation: string;
  city: string;
  conference: 'East' | 'West';
  division: string;
  fullName: string;
  name: string;
}
