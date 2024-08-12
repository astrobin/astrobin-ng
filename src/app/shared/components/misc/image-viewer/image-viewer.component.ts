import { Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, PLATFORM_ID } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { DeviceService } from "@shared/services/device.service";
import { LoadImage } from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { filter, map, switchMap, take } from "rxjs/operators";
import { ImageService } from "@shared/services/image/image.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import { NestedCommentsAutoStartTopLevelStrategy } from "@shared/components/misc/nested-comments/nested-comments.component";
import { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { of } from "rxjs";
import { isPlatformServer } from "@angular/common";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";

@Component({
  selector: "astrobin-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"]
})
export class ImageViewerComponent extends BaseComponentDirective implements OnInit {
  readonly ImageAlias = ImageAlias;

  loading = false;
  alias: ImageAlias;
  hasOtherImages = false;
  currentIndex = null;
  imageContentType: ContentTypeInterface;
  userContentType: ContentTypeInterface;
  fullscreen = false;

  @Input()
  image: ImageInterface;

  @Input()
  revisionLabel = FINAL_REVISION_LABEL;

  @Input()
  navigationContext: (ImageInterface["hash"] | ImageInterface["pk"])[];

  @Output()
  closeViewer = new EventEmitter<void>();

  @Output()
  initialized = new EventEmitter<void>();

  // This is computed from `image` and `revisionLabel` and is used to display data for the current revision.
  revision: ImageInterface | ImageRevisionInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly deviceService: DeviceService,
    public readonly imageService: ImageService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly modalService: NgbModal,
    public readonly jsonApiService: JsonApiService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>
  ) {
    super(store$);
  }

  ngOnInit(): void {
    if (this.deviceService.lgMax()) {
      this.alias = ImageAlias.HD;
    } else if (this.deviceService.xlMin()) {
      this.alias = ImageAlias.QHD;
    }

    this.store$.pipe(
      select(selectContentType, { appLabel: "astrobin", model: "image" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.imageContentType = contentType;
    });

    this.store$.pipe(
      select(selectContentType, { appLabel: "auth", model: "user" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.userContentType = contentType;
    });

    this.store$.dispatch(new LoadContentType({
      appLabel: "astrobin",
      model: "image"
    }));

    this.store$.dispatch(new LoadContentType({
      appLabel: "auth",
      model: "user"
    }));

    this.initialized.emit();
  }

  setImage(
    image: ImageInterface,
    revisionLabel: ImageRevisionInterface["label"],
    navigationContext: (ImageInterface["pk"] | ImageInterface["hash"])[]
  ): void {
    this.image = image;
    this.revisionLabel = revisionLabel;
    this.navigationContext = [...navigationContext];
    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    this._updateNavigationContextInformation();
    this._recordHit();
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.fullscreen) {
      this.closeFullscreen();
      return;
    }

    this.close();
  }

  updateCurrentImageIndexInNavigationContext(): void {
    const byHash = this.navigationContext.indexOf(this.image.hash);
    const byPk = this.navigationContext.indexOf(this.image.pk);

    this.currentIndex = byHash !== -1 ? byHash : byPk;
  }

  loadNextImages(n: number): void {
    for (let i = 1; i <= n; i++) {
      const nextIndex = this.currentIndex + i;
      if (nextIndex < this.navigationContext.length) {
        this.store$.dispatch(new LoadImage({ imageId: this.navigationContext[nextIndex] }));
      }
    }
  }

  loadPreviousImages(n: number): void {
    for (let i = 1; i <= n; i++) {
      const previousIndex = this.currentIndex - i;
      if (previousIndex >= 0) {
        this.store$.dispatch(new LoadImage({ imageId: this.navigationContext[previousIndex] }));
      }
    }
  }

  @HostListener("document:keydown.arrowRight", ["$event"])
  onNextClicked(): void {
    if (this.currentIndex < this.navigationContext.length - 1) {
      this.store$.pipe(
        select(selectImage, this.navigationContext[this.currentIndex + 1]),
        filter(image => !!image),
        take(1)
      ).subscribe((image: ImageInterface) => {
        this.setImage(image, FINAL_REVISION_LABEL, this.navigationContext);
      });
    }
  }

  @HostListener("document:keydown.arrowLeft", ["$event"])
  onPreviousClicked(): void {
    if (this.currentIndex > 0) {
      this.store$.pipe(
        select(selectImage, this.navigationContext[this.currentIndex - 1]),
        filter(image => !!image),
        take(1)
      ).subscribe((image: ImageInterface) => {
        this.setImage(image, FINAL_REVISION_LABEL, this.navigationContext);
      });
    }
  }

  openCommentsModal(event: MouseEvent): void {
    event.preventDefault();

    const modalRef = this.modalService.open(NestedCommentsModalComponent, { size: "lg" });
    const instance: NestedCommentsModalComponent = modalRef.componentInstance;

    instance.contentType = this.imageContentType;
    instance.objectId = this.image.pk;
    instance.autoStartTopLevelStrategy = NestedCommentsAutoStartTopLevelStrategy.IF_NO_COMMENTS;
  }

  openFullscreen(event: MouseEvent): void {
    event.preventDefault();

    if (!this.revision.videoFile) {
      this.store$.dispatch(new ShowFullscreenImage(this.image.pk));
      this.fullscreen = true;
    }
  }

  closeFullscreen(): void {
    this.store$.dispatch(new HideFullscreenImage());
    this.fullscreen = false;
  }

  close(): void {
    this.closeFullscreen();
    this.closeViewer.emit();
  }

  private _updateNavigationContextInformation(): void {
    this.hasOtherImages = this.navigationContext.filter(id => id !== this.image.hash && id !== this.image.pk).length > 0;
    this.updateCurrentImageIndexInNavigationContext();
    this.loadNextImages(5);
    this.loadPreviousImages(5);
  }

  private _recordHit() {
    const contentTypePayload = {
      appLabel: "astrobin",
      model: "image"
    };

    if (isPlatformServer(this.platformId)) {
      return;
    }

    // No need to dispatch this because it's already done.
    this.currentUser$
      .pipe(
        switchMap(user =>
          this.store$.select(selectContentType, contentTypePayload).pipe(
            filter(contentType => !!contentType),
            take(1),
            map(contentType => [user, contentType])
          )
        ),
        switchMap(([user, contentType]) => {
          if (!user || user.id !== this.image.user) {
            return this.jsonApiService.recordHit(contentType.id, this.image.pk);
          }

          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }
}
