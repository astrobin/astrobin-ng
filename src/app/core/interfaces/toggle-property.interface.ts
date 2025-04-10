import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { UserInterface } from "@core/interfaces/user.interface";

export interface TogglePropertyInterface {
  id: number;
  propertyType: "like" | "bookmark" | "follow";
  user: UserInterface["id"];
  contentType: ContentTypeInterface["id"];
  objectId: number;
  createdOn: Date;
}
