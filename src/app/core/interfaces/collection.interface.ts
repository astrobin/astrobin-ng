import { UserInterface } from "@core/interfaces/user.interface";
import { ImageInterface } from "@core/interfaces/image.interface";

export interface CollectionInterface {
  id: number;
  dateCreated: string;
  dateUpdated: string;
  parent: number | null;
  user: UserInterface["id"];
  name: string;
  description: string | null;
  images?: ImageInterface["pk"][];
  cover: ImageInterface["pk"] | null;
  coverThumbnail: string | null;
  orderByTag: string | null;
  imageCount?: number;
  imageCountIncludingWip?: number;
  nestedCollectionCount?: number;
}
