import { Injectable } from "@angular/core";
import { AppState } from "@app/store/app.states";
import { State, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

export interface ImageSize {
  width: number;
  height: number;
}

@Injectable({
  providedIn: "root"
})
export class ImageService {
  constructor(public readonly translate: TranslateService, public readonly store$: Store<AppState>) {}

  getPlaceholder(size: ImageSize): string {
    const background = "222";
    const foreground = "e0e0e0";
    const text = this.translate.instant("Loading...");

    return `https://via.placeholder.com/${size.width}x${size.height}/${background}/${foreground}?text=${text}`;
  }

  getSize$(size: ImageSize, alias: ImageAlias): Observable<ImageSize> {
    return this.store$.pipe(
      take(1),
      map(state => {
        const aliases = state.app.backendConfig.THUMBNAIL_ALIASES;
        const aliasSize = aliases[alias].size;
        const aliasWidth = aliasSize[0];
        const aliasHeight = aliasSize[1];

        if (aliasWidth > 0 && aliasHeight > 0) {
          return { width: aliasWidth, height: aliasHeight };
        }

        if (aliasWidth > 0 && aliasHeight === 0) {
          return {
            width: aliasWidth,
            height: Math.round(aliasWidth / (size.height / aliasWidth))
          };
        }

        if (aliasWidth > 0 && aliasHeight === 0) {
          return {
            width: Math.round(aliasHeight / (size.width / aliasHeight)),
            height: aliasHeight
          };
        }

        return { width: 0, height: 0 };
      })
    );
  }
}
