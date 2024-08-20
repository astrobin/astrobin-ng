import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { ImageViewerComponent } from "@shared/components/misc/image-viewer/image-viewer.component";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-image-page",
  templateUrl: "./image-page.component.html",
  styleUrls: ["./image-page.component.scss"]
})
export class ImagePageComponent extends BaseComponentDirective implements OnInit {
  @ViewChild("imageViewer", { static: true })
  imageViewer: ImageViewerComponent;

  protected image: ImageInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly route: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.route.data.pipe(
      takeUntil(this.destroyed$),
      distinctUntilChangedObj()
    ).subscribe(data => {
      this.image = data.image;

      if (this.image && this.imageViewer) {
        this.imageViewer.setImage(
          this.image, FINAL_REVISION_LABEL, false, [], false
        );
      }
    });
  }
}
