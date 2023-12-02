import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  Renderer2,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { LoadImage, LoadImageRevisions } from "@app/store/actions/image.actions";
import { LoadThumbnail } from "@app/store/actions/thumbnail.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { ImageService } from "@shared/services/image/image.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { fromEvent, merge, Observable, of, Subscription } from "rxjs";
import { selectImageRevisionsForImage } from "@app/store/selectors/app/image-revision.selectors";
import { Actions, ofType } from "@ngrx/effects";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { isPlatformBrowser } from "@angular/common";
import { AppActionTypes } from "@app/store/actions/app.actions";

declare const videojs: any;

@Component({
  selector: "astrobin-image",
  templateUrl: "./image.component.html",
  styleUrls: ["./image.component.scss"]
})
export class ImageComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input()
  @HostBinding("attr.data-id")
  id: number;

  @Input()
  revision = "final";

  @Input()
  alias: ImageAlias;

  @Input()
  autoHeight = true;

  @Input()
  autoLoadRevisions = true;

  @Output()
  loaded = new EventEmitter();

  @HostBinding("class.loading")
  loading = false;

  @ViewChild("videoPlayer", { static: false })
  videoPlayer: ElementRef;

  image: ImageInterface;
  thumbnailUrl: SafeUrl;
  width: number;
  height: number;
  progress = 0;
  videoJsReady = false;
  autoLoadSubscription: Subscription;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly imageApiService: ImageApiService,
    public readonly imageService: ImageService,
    public readonly elementRef: ElementRef,
    public readonly utilsService: UtilsService,
    public readonly windowRefService: WindowRefService,
    public readonly domSanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    public readonly renderer: Renderer2,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  get videoSetup(): string {
    const setup = {
      fluid: false,
      liveui: true,
      loop: this.image?.loopVideo || false
    };
    return JSON.stringify(setup);
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.id === null) {
      throw new Error("Attribute 'id' is required");
    }

    if (this.alias === null) {
      throw new Error("Attribute 'alias' is required");
    }

    this._setupAutoLoad();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.load();
  }

  ngOnDestroy(): void {
    if (this.thumbnailUrl) {
      (this.windowRefService.nativeWindow as any).URL.revokeObjectURL(this.thumbnailUrl as string);
    }

    if (this.autoLoadSubscription) {
      this.autoLoadSubscription.unsubscribe();
    }
  }

  load() {
    const noNeedToLoad = () => !!this.thumbnailUrl ||
      !this.utilsService.isNearBelowViewport(this.elementRef.nativeElement);

    if (noNeedToLoad()) {
      return;
    }

    // 0-200 ms
    this.utilsService
      .delay(Math.floor(Math.random() * 200))
      .pipe(take(1))
      .subscribe(() => {
        if (noNeedToLoad()) {
          return;
        }

        this.loading = true;

        this.store$
          .select(selectImage, this.id)
          .pipe(
            filter(image => !!image),
            take(1),
            switchMap(image =>
              this.store$.select(selectImageRevisionsForImage, this.id).pipe(
                take(1),
                map(() => image)
              )
            ),
            switchMap(image => this._loadRevision(image).pipe(map(revision => ({ image, revision }))))
          )
          .subscribe(({ image, revision }) => {
            this.image = image;
            const w = !!revision ? revision.w : image.w;
            const h = !!revision ? revision.h : image.h;
            this._setWidthAndHeight(w, h);
            this._loadThumbnail();

            if (!!image.videoFile) {
              this._insertVideoJs();
            }
          });

        this.store$.dispatch(new LoadImage({ imageId: this.id }));

        if (this.autoLoadRevisions) {
          this.store$.dispatch(new LoadImageRevisions({ imageId: this.id }));
        }
      });
  }

  onLoad(event) {
    if (this.autoLoadSubscription) {
      this.autoLoadSubscription.unsubscribe();
    }

    this.loaded.emit();
  }

  private _loadRevision(image: ImageInterface): Observable<ImageRevisionInterface> {
    if (this.revision === "0") {
      return of(null);
    }

    return this.store$.select(selectImageRevisionsForImage, image.pk).pipe(
      take(1),
      map(imageRevisions => {
        const matchingRevisions = imageRevisions.filter(
          imageRevision => (imageRevision.isFinal && this.revision === "final") || imageRevision.label === this.revision
        );

        if (matchingRevisions.length > 0) {
          return imageRevisions[0];
        }

        return null;
      })
    );
  }

  private _loadThumbnail() {
    const preRenderedThumbnails: ImageThumbnailInterface[] = this.image.thumbnails
      ? this.image.thumbnails.filter(thumbnail => thumbnail.alias === this.alias)
      : [];

    if (preRenderedThumbnails.length > 0) {
      this.imageService
        .loadImageFile(preRenderedThumbnails[0].url, (progress: number) => {
          this.progress = progress;
        })
        .subscribe(url => {
          this.thumbnailUrl = preRenderedThumbnails[0].url;
          this.loading = false;
        });
      return;
    }

    this.store$
      .select(selectThumbnail, {
        id: this.id,
        revision: this.revision,
        alias: this.alias
      })
      .pipe(
        filter(thumbnail => !!thumbnail),
        take(1),
        switchMap(thumbnail =>
          this.imageService.loadImageFile(thumbnail.url, (progress: number) => {
            this.progress = progress;
          })
        ),
        map(url => this.domSanitizer.bypassSecurityTrustUrl(url))
      )
      .subscribe(url => {
        this.thumbnailUrl = url;
        this.loading = false;
      });

    this.store$.dispatch(
      new LoadThumbnail({ data: { id: this.id, revision: this.revision, alias: this.alias }, bustCache: false })
    );
  }

  private _setWidthAndHeight(imageWidth: number, imageHeight: number) {
    const containerWidth = this.elementRef.nativeElement.offsetWidth;

    if (imageWidth > containerWidth) {
      if (this.autoHeight) {
        this.width = containerWidth;
        this.height = (imageHeight / imageWidth) * containerWidth;
      } else {
        this.width = containerWidth;
        this.height = undefined;
      }
    } else {
      this.width = imageWidth;
      this.height = imageHeight;
    }
  }

  private _setupAutoLoad() {
    if (isPlatformBrowser(this.platformId)) {
      const scroll$ = fromEvent(this.windowRefService.nativeWindow, "scroll");
      const resize$ = fromEvent(this.windowRefService.nativeWindow, "resize");
      const forceCheck$ = this.actions$.pipe(ofType(AppActionTypes.FORCE_CHECK_IMAGE_AUTO_LOAD));

      this.autoLoadSubscription = merge(scroll$, resize$, forceCheck$)
        .pipe(takeUntil(this.destroyed$), debounceTime(200), distinctUntilChanged())
        .subscribe(() => this.load());
    }
  }

  private _insertVideoJs() {
    this.utilsService.insertStylesheet("https://vjs.zencdn.net/8.3.0/video-js.min.css", this.renderer, () => {
      this.utilsService.insertScript("https://vjs.zencdn.net/8.3.0/video.min.js", this.renderer, () => {
        this.videoJsReady = true;
        this.changeDetectorRef.detectChanges();

        if (!!this.videoPlayer) {
          const player = videojs(this.videoPlayer.nativeElement, {});
          player.on("fullscreenchange", function() {
            const isFullscreen = player.isFullscreen();
            const el = player.el().firstChild;

            if (isFullscreen) {
              el.style.maxWidth = `${player.videoWidth()}px`;
              el.style.maxHeight = `${player.videoHeight()}px`;
              el.style.top = `50%`;
              el.style.left = `50%`;
              el.style.transform = `translate(-50%, -50%)`;
              el.style.margin = "auto";
            } else {
              el.style.maxWidth = "";
              el.style.maxHeight = "";
              el.style.top = "";
              el.style.left = "";
              el.style.transform = "";
              el.style.margin = "";
            }
          });
        }
      });
    });
  }
}
