import { UserInterface } from "@shared/interfaces/user.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";

export interface CollectionInterface {
  id: number;
  dateCreated: string;
  dateUpdated: string;
  parent: number | null;
  user: UserInterface["id"];
  name: string;
  description: string | null;
  images: ImageInterface["pk"][];
  cover: ImageInterface["pk"] | null;
  orderByTag: string | null;
}
