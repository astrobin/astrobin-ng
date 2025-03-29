import { UserInterface } from "@core/interfaces/user.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";

export interface CollectionInterface {
  id: number;
  dateCreated: string;
  dateUpdated: string;
  parent: number | null;
  user: UserInterface["id"];
  username: UserInterface["username"];
  userDisplayName: UserProfileInterface["realName"];
  displayCollectionsOnPublicGallery: boolean;
  name: string;
  description: string | null;
  images?: ImageInterface["pk"][];
  cover: ImageInterface["pk"] | null;
  coverThumbnail: string | null;
  coverThumbnailHd: string | null;
  orderByTag: string | null;
  imageCount?: number;
  imageCountIncludingWip?: number;
  nestedCollectionCount?: number;
  squareCropping?: string;
  w?: number;
  h?: number;
}
