import { ImageInterface } from "../interfaces/image.interface";

export class ImageGenerator {
  static image(): ImageInterface {
    return {
      user: 1,
      pk: 1,
      hash: "abc123",
      title: "Generated image",
      imageFile: "/media/images/generated.jpg",
      isWip: false,
      skipNotifications: false,
      w: 1000,
      h: 1000,
      imagingTelescopes: [],
      imagingCameras: [],
      published: new Date().toISOString()
    };
  }
}
