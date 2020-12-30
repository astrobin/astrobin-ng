import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ImageService {
  calculateDisplayHeight(aliasSize: number[], imageSize: number[], elementSize: number[]): number {
    const aliasWidth = aliasSize[0];
    const aliasHeight = aliasSize[1];

    const imageWidth = imageSize[0];
    const imageHeight = imageSize[1];

    const elementWidth = elementSize[0];
    const elementHeight = elementSize[1] || aliasHeight;

    const imageRatio = imageWidth / imageHeight;
    const correctedHeight = Math.floor(aliasWidth / imageRatio);

    if (elementWidth >= aliasWidth) {
      if (elementHeight === 0) {
        return correctedHeight;
      }

      return aliasHeight > 0 ? aliasHeight : elementHeight;
    }

    return (correctedHeight * elementWidth) / aliasWidth;
  }
}
