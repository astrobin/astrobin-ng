import type { ImageInterface } from "@core/interfaces/image.interface";

export interface IotdArchiveInterface {
  id: number;
  image: ImageInterface;
  date: string;
  created: string;
}
