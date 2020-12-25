import { Component, Input, OnInit } from "@angular/core";
import { AppState } from "@app/store/app.states";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-fullscreen-image-viewer",
  templateUrl: "./fullscreen-image-viewer.component.html",
  styleUrls: ["./fullscreen-image-viewer.component.scss"]
})
export class FullscreenImageViewerComponent extends BaseComponentDirective implements OnInit {
  @Input()
  image: ImageInterface;

  thumbnails$: Observable<ImageThumbnailInterface>;

  constructor(public readonly store$: Store<AppState>) {
    super();
  }

  ngOnInit(): void {
    if (this.image === undefined) {
      throw new Error("Attribute 'image' is required");
    }
  }
}
