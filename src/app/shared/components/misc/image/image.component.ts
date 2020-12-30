import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { LoadImage } from "@app/store/actions/image.actions";
import { LoadThumbnail } from "@app/store/actions/thumbnail.actions";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { ThumbnailGroupApiService } from "@shared/services/api/classic/images/thumbnail-group/thumbnail-group-api.service";
import { ImageService } from "@shared/services/image/image.service";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { Observable } from "rxjs";
import { filter, map, switchMap, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-image",
  templateUrl: "./image.component.html",
  styleUrls: ["./image.component.scss"]
})
export class ImageComponent extends BaseComponentDirective implements OnInit, OnChanges, AfterViewChecked {
  image$: Observable<ImageInterface>;
  thumbnail$: Observable<ImageThumbnailInterface>;
  height: number;

  @Input()
  @HostBinding("attr.data-id")
  id: number;

  @Input()
  revision = "final";

  @Input()
  alias: ImageAlias;

  @HostBinding("class.loading")
  loading = false;

  @ViewChild("loadingIndicator", { read: ElementRef })
  private _loadingIndicator: ElementRef;

  constructor(
    public readonly store$: Store<State>,
    public readonly imageApiService: ImageApiService,
    public readonly thumbnailGroupApiService: ThumbnailGroupApiService,
    public readonly imageService: ImageService,
    public readonly elementRef: ElementRef,
    public readonly changeDetector: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.id === null) {
      throw new Error("Attribute 'id' is required");
    }

    if (this.alias === null) {
      throw new Error("Attribute 'alias' is required");
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      this._load();
    }, 1);
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  private _load(): void {
    this.loading = true;
    this._loadImage();
  }

  private _loadImage() {
    this.store$.dispatch(new LoadImage(this.id));

    this.image$ = this.store$.select(selectImage, this.id).pipe(
      filter(image => !!image),
      tap(image => {
        this._loadThumbnail();
        this._fixHeight(image);
      })
    );
  }

  private _loadThumbnail() {
    this.store$.dispatch(new LoadThumbnail({ id: this.id, revision: this.revision, alias: this.alias }));

    this.thumbnail$ = this.store$
      .select(selectThumbnail, {
        id: this.id,
        revision: this.revision,
        alias: this.alias
      })
      .pipe(
        filter(thumbnail => !!thumbnail),
        tap(() => (this.loading = false))
      );
  }

  private _fixHeight(image: ImageInterface) {
    this.store$
      .select(selectApp)
      .pipe(
        take(1),
        map(state => state.backendConfig)
      )
      .subscribe(backendConfig => {
        if (this.height !== undefined || this._loadingIndicator === undefined) {
          return;
        }

        const aliasSize = backendConfig.THUMBNAIL_ALIASES[this.alias].size;
        const elementWidth = this.elementRef.nativeElement.offsetWidth;
        const elementHeight = this.elementRef.nativeElement.offsetHeight;
        const loadingIndicatorHeight = this._loadingIndicator.nativeElement.querySelector(".loading").offsetHeight;

        if (elementHeight - loadingIndicatorHeight > 0) {
          this.height = elementHeight;
        } else {
          this.height = this.imageService.calculateDisplayHeight(
            aliasSize,
            [image.w, image.h],
            [elementWidth, elementHeight - loadingIndicatorHeight]
          );
        }
      });
  }
}
