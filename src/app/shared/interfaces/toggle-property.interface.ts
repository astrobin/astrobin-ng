import { UserInterface } from "@shared/interfaces/user.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";

export interface TogglePropertyInterface {
  id: number;
  propertyType: "like" | "bookmark" | "follow";
  user: UserInterface["id"];
  contentType: ContentTypeInterface["id"];
  objectId: string;
  createdOn: Date;
}
