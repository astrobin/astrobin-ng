import { Component, Input, OnInit } from "@angular/core";
import { State } from "@app/store/reducers/app.reducers";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageApiService } from "@shared/services/api/classic/images-app/image/image-api.service";
import { ThumbnailGroupApiService } from "@shared/services/api/classic/images-app/thumbnail-group/thumbnail-group-api.service";
import { ImageService, ImageSize } from "@shared/services/image/image.service";
import { Observable } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-image",
  templateUrl: "./image.component.html",
  styleUrls: ["./image.component.scss"]
})
export class ImageComponent extends BaseComponentDirective implements OnInit {
  image: ImageInterface;
  imageThumbnail: ImageThumbnailInterface;

  @Input()
  id: number;

  @Input()
  revision = "final";

  @Input()
  alias: ImageAlias;

  private _getImage$ = (id: number): Observable<ImageInterface> =>
    this.imageApiService.getImage(id).pipe(
      take(1),
      tap(image => {
        this.image = image;
        return image;
      })
    );

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

  constructor(
    public readonly store$: Store<State>,
    public readonly imageApiService: ImageApiService,
    public readonly thumbnailGroupApiService: ThumbnailGroupApiService,
    public readonly imageService: ImageService
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

    this._getImage$(this.id)
      .pipe(switchMap(image => this._getThumbnail$(image, this.revision, this.alias)))
      .subscribe(thumbnail => {
        if (this.isPlaceholder(thumbnail.url)) {
          this._startGetThumbnailLoop();
        }
      });
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

  private _startGetThumbnailLoop(): void {
    this._getThumbnail$(this.image, this.revision, this.alias)
      .pipe(take(1))
      .subscribe(thumbnail => {
        if (this.isPlaceholder(thumbnail.url)) {
          setTimeout(() => {
            this._startGetThumbnailLoop();
          }, 500);
        }
      });
  }
}
