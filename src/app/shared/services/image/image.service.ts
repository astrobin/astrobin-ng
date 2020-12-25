import { Injectable } from "@angular/core";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";

export interface ImageSize {
  width: number;
  height: number;
}

@Injectable({
  providedIn: "root"
})
export class ImageService {
  constructor(public readonly translate: TranslateService, public readonly store$: Store<State>) {}
}
