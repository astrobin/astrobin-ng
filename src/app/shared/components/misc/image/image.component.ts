import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, SimpleChanges, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { LoadImage } from "@app/store/actions/image.actions";
import { LoadThumbnail } from "@app/store/actions/thumbnail.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { fromEvent, merge, Subscription } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
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
  image: ImageInterface;

  @Input()
  revision = FINAL_REVISION_LABEL;

  @Input()
  alias: ImageAlias;

  @Input()
  autoHeight = true;

  @Output()
  loaded = new EventEmitter();

  @Output()
  imageClick = new EventEmitter<MouseEvent>();

  @Output()
  imageMouseEnter = new EventEmitter<MouseEvent>();

  @Output()
  imageMouseLeave = new EventEmitter<MouseEvent>();

  @HostBinding("class.loading")
  loading = false;

  @ViewChild("videoPlayerElement", { static: false })
  videoPlayerElement: ElementRef;

  thumbnailUrl: SafeUrl;
  width: number;
  height: number;
  progress = 0;
  videoJsReady = false;
  videoJsPlayer: any;
  autoLoadSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
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

    if (!this.id && !this.image) {
      throw new Error("Attribute 'id' or 'image' is required");
    }

    if (!this.alias) {
      throw new Error("Attribute 'alias' is required");
    }

    this._setupAutoLoad();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.thumbnailUrl = null;
    this.id = this.image.pk
    this._loadThumbnail();
    this._disposeVideoJsPlayer();
    if (!!this.image.videoFile) {
      this._insertVideoJs();
    }

    this.load(0);
  }

  ngOnDestroy(): void {
    if (this.thumbnailUrl) {
      (this.windowRefService.nativeWindow as any).URL.revokeObjectURL(this.thumbnailUrl as string);
    }

    if (this.autoLoadSubscription) {
      this.autoLoadSubscription.unsubscribe();
      this.autoLoadSubscription = null;
    }

    this._disposeVideoJsPlayer();
  }

  load(delay = null) {
    if (!!this.thumbnailUrl) {
      this.loaded.emit();
      return
    }

    const noNeedToLoad = () =>  !this.utilsService.isNearBelowViewport(this.elementRef.nativeElement);

    if (noNeedToLoad()) {
      return;
    }

    // 0-200 ms
    this.utilsService
      .delay(delay !== null ? delay : Math.floor(Math.random() * 200))
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
            take(1)
          )
          .subscribe(image => {
            const revision = image.revisions.find(
              revision => (revision.isFinal && this.revision === "final") || revision.label === this.revision
            );

            this.image = image;
            this.id = image.pk;
            const w = !!revision ? revision.w : image.w;
            const h = !!revision ? revision.h : image.h;
            this._setWidthAndHeight(w, h);
            this._loadThumbnail();

            if (!!image.videoFile) {
              this._insertVideoJs();
            }
          });

        this.store$.dispatch(new LoadImage({ imageId: this.id }));
      });
  }

  onLoad(event) {
    if (this.autoLoadSubscription) {
      this.autoLoadSubscription.unsubscribe();
      this.autoLoadSubscription = null;
    }

    this.loaded.emit();
  }

  onClick(event: MouseEvent) {
    event.preventDefault();
    this.imageClick.emit(event);
  }

  private _loadThumbnail() {
    const allAvailableThumbnails: {
      revisionLabel: ImageRevisionInterface["label"];
      url: string;
    }[] = [
      ...this.image.thumbnails.filter(thumbnail => thumbnail.alias === this.alias).map(thumbnail => ({
        revisionLabel: FINAL_REVISION_LABEL,
        url: thumbnail.url
      })),
      ...this.image.revisions.map(revision => ({
        revisionLabel: revision.label,
        url: revision.thumbnails.find(thumbnail => thumbnail.alias === this.alias).url
      }))
    ];

    let url: string;

    if (this.image.imageFile && this.image.imageFile.toLowerCase().endsWith(".gif")) {
      url = this.image.imageFile;
    } else {
      url = allAvailableThumbnails.find(thumbnail => thumbnail.revisionLabel === this.revision)?.url;
    }

    if (url) {
      this.imageService
        .loadImageFile(url, (progress: number) => {
          this.progress = progress;
        })
        .subscribe(url => {
          this.thumbnailUrl = this.domSanitizer.bypassSecurityTrustUrl(url);
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
        this.loaded.emit()
        this.changeDetectorRef.detectChanges();

        this.utilsService.delay(200).subscribe(() => {
          if (!!this.videoPlayerElement) {
            this._createVideoJsPlayer();
          }
        });
      });
    });
  }

  private _createVideoJsPlayer() {
    this.videoJsPlayer = videojs(this.videoPlayerElement.nativeElement, {});
    this.videoJsPlayer.on("fullscreenchange", () => {
      const isFullscreen = this.videoJsPlayer.isFullscreen();
      const el = this.videoJsPlayer.el().firstChild;

      if (isFullscreen) {
        el.style.maxWidth = `${this.videoJsPlayer.videoWidth()}px`;
        el.style.maxHeight = `${this.videoJsPlayer.videoHeight()}px`;
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

  private _disposeVideoJsPlayer() {
    if (this.videoJsPlayer) {
      this.videoJsPlayer.dispose();
      this.videoJsPlayer = null;
    }
  }
}
