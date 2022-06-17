import { UserInterface } from "@shared/interfaces/user.interface";

export interface BrandInterface {
  id: number;
  deleted?: string;
  created: string;
  updated: string;
  lastAddedOrRemovedFromImage: string;
  name: string;
  website?: string;
  logo?: string | File[];
  createdBy?: UserInterface["id"];
  imageCount: number;
  userCount: number;
}
