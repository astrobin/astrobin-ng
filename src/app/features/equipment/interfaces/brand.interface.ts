import { UserInterface } from "@shared/interfaces/user.interface";

export interface BrandInterface {
  id: number;
  deleted?: string;
  created: string;
  updated: string;
  name: string;
  website?: string;
  logo?: string;
  createdBy?: UserInterface["id"];
}
