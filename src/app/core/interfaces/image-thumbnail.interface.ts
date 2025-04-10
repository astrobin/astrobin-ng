import { ImageAlias } from "@core/enums/image-alias.enum";

export interface ImageThumbnailInterface {
  id: number;
  revision: string;
  alias: ImageAlias;
  url: string;
}
