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
}
