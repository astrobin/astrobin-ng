export interface ContestInterface {
  user: number;
  title: string;
  description: string;
  rules: string;
  prices?: string;
  startDate: Date;
  endDate: Date;
  minParticipants: number;
  maxParticipants: number;
  created: Date;
  updated: Date;
}
