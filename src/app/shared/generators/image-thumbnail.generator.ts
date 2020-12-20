import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";

export class ImageThumbnailGenerator {
  static thumbnail(source: Partial<ImageThumbnailInterface> = {}): ImageThumbnailInterface {
    return {
      url: "/media/images/generated.jpg",
      alias: "regular",
      id: 1,
      revision: "original",
      ...source
    };
  }
}
