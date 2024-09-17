import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { map, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-images",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ng-container *ngIf="loading">
        <astrobin-loading-indicator></astrobin-loading-indicator>
      </ng-container>

      {{ images | json }}
    </ng-container>
  `,
  styleUrls: ["./user-gallery-images.component.scss"]
})
export class UserGalleryImagesComponent extends BaseComponentDirective implements OnChanges {
  @Input() user: UserInterface;

  protected images: ImageInterface[] = [];
  protected loading = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
  ) {
    super(store$);

    actions$.pipe(
      ofType(AppActionTypes.FIND_IMAGES_SUCCESS),
      map((action: FindImagesSuccess) => action.payload),
      takeUntil(this.destroyed$)
    ).subscribe(payload => {
      if (payload.prev !== null) {
        this.images = [...this.images, ...payload.results];
      } else {
        this.images = payload.results;
      }
      this.loading = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user && changes.user.currentValue) {
      this._getImages();
    }
  }

  private _getImages(): void {
    this.store$.dispatch(new FindImages({
      userId: this.user.id,
      gallerySerializer: true
    }));
    this.loading = true;
  }
}
