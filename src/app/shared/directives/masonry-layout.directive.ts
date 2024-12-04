import { Directive, EventEmitter, HostListener, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { DeviceService } from "@shared/services/device.service";
import { DOCUMENT } from "@angular/common";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";

export type MasonryLayoutGridItem =
  (ImageSearchInterface | ImageInterface | FeedItemInterface) & {
  objectPosition?: string,
  displayHeight?: number,
  displayWidth?: number
};

@Directive({
  selector: "[astrobinMasonryLayout]"
})
export class MasonryLayoutDirective implements OnInit, OnChanges {
  @Input("astrobinMasonryLayout") items: MasonryLayoutGridItem[] = [];
  @Input() activeLayout: UserGalleryActiveLayout = UserGalleryActiveLayout.TINY;
  @Output() gridItemsChange = new EventEmitter<{ gridItems: MasonryLayoutGridItem[], averageHeight: number }>();

  averageHeight: number = 200;

  constructor(
    private deviceService: DeviceService,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  ngOnInit(): void {
    this._setAverageSizeForAlias();
    this._assignWidthsToGridItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.items) {
      this._assignWidthsToGridItems();
    }
  }

  @HostListener("window:resize")
  onResize(): void {
    this._setAverageSizeForAlias();
    this._assignWidthsToGridItems();
  }

  private _setAverageSizeForAlias(): void {
    if (this.activeLayout === UserGalleryActiveLayout.TINY) {
      this.averageHeight = 80;
    } else if (this.activeLayout === UserGalleryActiveLayout.SMALL) {
      if (this.deviceService.xsMax()) {
        this.averageHeight = 100;
      } else if (this.deviceService.smMax()) {
        this.averageHeight = 125;
      } else if (this.deviceService.mdMax()) {
        this.averageHeight = 150;
      } else {
        this.averageHeight = 200;
      }
    } else if (this.activeLayout === UserGalleryActiveLayout.LARGE) {
      this.averageHeight = 300;
    }
  }

  private _assignWidthsToGridItems(): void {
    if (!this.items || this.items.length === 0) {
      return;
    }

    const MIN_ASPECT_RATIO = 0.5;
    const MAX_ASPECT_RATIO = 2;
    const gridItems = [];

    this.items.forEach(image => {
      const w = this._getW(image);
      const h = this._getH(image);
      const imageAspectRatio = w && h ? w / h : 1.0;
      let width: number;
      let height: number;

      if (this.activeLayout === UserGalleryActiveLayout.TINY) {
        width = 130;
        height = 130;
      } else {
        const dimensions = this._getRandomDimensions(MIN_ASPECT_RATIO, MAX_ASPECT_RATIO, imageAspectRatio);
        width = dimensions.width;
        height = dimensions.height;
      }

      gridItems.push({
        ...image,
        displayWidth: width,
        displayHeight: height,
        objectPosition: this._getObjectPosition(image)
      });
    });

    this.gridItemsChange.emit({ gridItems, averageHeight: this.averageHeight });
  }

  private _getRandomDimensions(
    minAspectRatio: number,
    maxAspectRatio: number,
    targetAspectRatio: number
  ): { width: number; height: number } {
    const sizes = [
      160, 180, 200, 220, 240, 280,
      300, 320, 360, 380, 400, 420, 480,
      500, 520, 560, 600, 620, 660, 680,
      720, 760, 800, 860, 920
    ];

    let height: number;
    let bestWidth: number = sizes[0];
    let bestDiff: number = Number.MAX_VALUE;

    do {
      height = this.averageHeight;

      // Reset the best diff for this particular height
      bestDiff = Number.MAX_VALUE;

      // Find the best width that gets closest to the target aspect ratio
      for (const width of sizes) {
        const aspectRatio = width / height;
        const diff = Math.abs(aspectRatio - targetAspectRatio);

        // Check if this width and height combination is the best match
        if (diff < bestDiff && aspectRatio >= minAspectRatio && aspectRatio <= maxAspectRatio) {
          bestWidth = width;
          bestDiff = diff;
        }
      }

      // If we can't find a good aspect ratio match, retry
    } while ((bestWidth / height) < minAspectRatio || (bestWidth / height) > maxAspectRatio);

    return { width: bestWidth, height };
  }

  private _getObjectPosition(image: ImageSearchInterface | ImageInterface | FeedItemInterface): string {
    if (!image.hasOwnProperty("squareCropping")) {
      return "50% 50%"; // Fallback to center
    }

    if (!(image as (ImageSearchInterface | ImageInterface)).squareCropping) {
      return "50% 50%"; // Fallback to center
    }

    const coords = (image as (ImageSearchInterface | ImageInterface)).squareCropping.split(",").map(Number);

    // Validate that we have exactly 4 numeric coordinates
    if (coords.length !== 4 || coords.some(isNaN)) {
      return "50% 50%"; // Fallback to center if parsing failed
    }

    let [x1, y1, x2, y2] = coords;

    x1 = Math.max(0, x1);
    y1 = Math.max(0, y1);
    x2 = Math.min(this._getW(image), x2);
    y2 = Math.min(this._getH(image), y2);

    // Calculate the center of the cropping square
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    // Return the position in the format 'x% y%'
    const positionX = (centerX / this._getW(image)) * 100;
    const positionY = (centerY / this._getH(image)) * 100;

    return `${positionX}% ${positionY}%`;
  }

  private _getW(image: ImageSearchInterface | ImageInterface | FeedItemInterface) {
    if (image.hasOwnProperty("finalW")) {
      return (image as ImageSearchInterface).finalW;
    }

    if (image.hasOwnProperty("w")) {
      return (image as ImageInterface).w;
    }

    return 200;
  }

  private _getH(image: ImageSearchInterface | ImageInterface | FeedItemInterface) {
    if (image.hasOwnProperty("finalH")) {
      return (image as ImageSearchInterface).finalH;
    }

    if (image.hasOwnProperty("h")) {
      return (image as ImageInterface).h;
    }

    return 200;
  }
}
