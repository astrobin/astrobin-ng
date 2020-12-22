import { Component, HostBinding, Input, OnInit } from "@angular/core";
import { LoadImage } from "@app/store/actions/image.actions";
import { AppState } from "@app/store/app.states";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { ThumbnailGroupApiService } from "@shared/services/api/classic/images/thumbnail-group/thumbnail-group-api.service";
import { ImageService } from "@shared/services/image/image.service";
import { Observable } from "rxjs";
import { filter, switchMap, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-image",
  templateUrl: "./image.component.html",
  styleUrls: ["./image.component.scss"]
})
export class ImageComponent extends BaseComponentDirective implements OnInit {
  image: ImageInterface;
  imageThumbnail: ImageThumbnailInterface;

  @Input()
  @HostBinding("attr.data-id")
  id: number;

  @Input()
  revision = "final";

  @Input()
  alias: ImageAlias;

  @HostBinding("class.loading")
  loading = false;

  constructor(
    public readonly store$: Store<AppState>,
    public readonly imageApiService: ImageApiService,
    public readonly thumbnailGroupApiService: ThumbnailGroupApiService,
    public readonly imageService: ImageService
  ) {
    super();
  }

  get backgroundSize(): string {
    switch (this.alias) {
      case ImageAlias.REGULAR_CROP_ANONYMIZED:
        return "initial";
      default:
        return "content";
    }
  }

  ngOnInit(): void {
    if (this.id === null) {
      throw new Error("Attribute 'id' is required");
    }

    if (this.alias === null) {
      throw new Error("Attribute 'alias' is required");
    }

    this.loading = true;

    this.store$
      .select(selectImage, this.id)
      .pipe(
        filter(image => !!image),
        take(1),
        tap(image => (this.image = image)),
        switchMap(image => this._getThumbnail$(image, this.revision, this.alias))
      )
      .subscribe(thumbnail => {
        if (this.isPlaceholder(thumbnail.url)) {
          this._startGetThumbnailLoop();
        } else {
          this.loading = false;
        }
      });

    this.store$.dispatch(new LoadImage(this.id));
  }

  isPlaceholder(url: string): boolean {
    return url.indexOf("placeholder") !== -1;
  }

  makeUrl(url: string): string {
    if (this.isPlaceholder(url)) {
      return this.imageService.getPlaceholder({ width: this.image.w, height: this.image.h });
    }

    return url;
  }

  private _getThumbnail$ = (
    image: ImageInterface,
    revision: string,
    alias: ImageAlias
  ): Observable<ImageThumbnailInterface> =>
    this.imageApiService.getThumbnail(image.hash || image.pk, revision, alias).pipe(
      take(1),
      tap(imageThumbnail => {
        this.imageThumbnail = imageThumbnail;
        return imageThumbnail;
      })
    );

  private _startGetThumbnailLoop(): void {
    this._getThumbnail$(this.image, this.revision, this.alias)
      .pipe(take(1))
      .subscribe(thumbnail => {
        if (this.isPlaceholder(thumbnail.url)) {
          setTimeout(() => {
            this._startGetThumbnailLoop();
          }, 500);
        } else {
          this.loading = false;
        }
      });
  }
}
