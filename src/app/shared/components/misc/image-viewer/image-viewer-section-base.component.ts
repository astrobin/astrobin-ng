import { Component, Input } from "@angular/core";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-image-viewer-section-base",
  template: ""
})
export abstract class ImageViewerSectionBaseComponent extends BaseComponentDirective {
  @Input()
  image: ImageInterface;

  @Input()
  revisionLabel: ImageRevisionInterface["label"] = FINAL_REVISION_LABEL;

  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  search(model: SearchModelInterface): void {
    const params = this.searchService.modelToParams(model);
    this.imageViewerService.closeActiveImageViewer(false);
    this.router.navigateByUrl(`/search?p=${params}`).then(() => {
      this.windowRefService.scroll({ top: 0 });
    });
  }
}
