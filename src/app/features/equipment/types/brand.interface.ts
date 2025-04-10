import type { UserInterface } from "@core/interfaces/user.interface";

export interface BrandInterface {
  id: number;
  deleted?: string;
  created: string;
  updated: string;
  lastAddedOrRemovedFromImage: string;
  name: string;
  website?: string;
  logo?: string | { file: File; url: string }[];
  createdBy?: UserInterface["id"];
  imageCount: number;
  userCount: number;
}
