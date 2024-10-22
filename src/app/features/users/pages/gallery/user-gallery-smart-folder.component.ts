import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from "@angular/router";
import { SmartFolderType } from "@features/users/pages/gallery/user-gallery-smart-folders.component";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, map, take } from "rxjs/operators";
import { FindImagesResponseInterface } from "@shared/services/api/classic/images/image/image-api.service";
import { ImageInterface } from "@shared/interfaces/image.interface";

@Component({
  selector: "astrobin-user-gallery-smart-folder",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <astrobin-loading-indicator *ngIf="loading"></astrobin-loading-indicator>

      <div *ngIf="!active" class="d-flex flex-wrap gap-4 justify-content-center">
        <a
          *ngFor="let item of menu"
          [routerLink]="['/u', user.username]"
          [queryParams]="{ 'folder-type': folderType, active: item[0] }"
          fragment="smart-folders"
          class="smart-folder"
        >
          <div class="smart-folder-background"></div>
          <div class="smart-folder-stars"></div>
          <div class="smart-folder">
            <div class="icon">
              <fa-icon icon="star"></fa-icon>
            </div>
            <div class="name">{{ item[1] }}</div>
          </div>
        </a>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-smart-folder.component.scss"]
})
export class UserGallerySmartFolderComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() folderType: SmartFolderType;

  protected menu: FindImagesResponseInterface["menu"];
  protected active: string | null = null;
  protected loading = true;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnChanges() {
    this.active = this.activatedRoute.snapshot.queryParams.folderType;
    if (!this.active) {
      this.actions$.pipe(
        ofType(AppActionTypes.FIND_IMAGES_SUCCESS),
        map((action: FindImagesSuccess) => action.payload),
        filter(payload =>
          payload.options.userId === this.user.id &&
          payload.options.subsection === this.folderType
        ),
        take(1)
      ).subscribe(payload => {
        this.menu = payload.response.menu;
        this.loading = false;
      });

      this.store$.dispatch(new FindImages({
        options: {
          userId: this.user.id,
          page: 1,
          subsection: this.folderType,
          gallerySerializer: true
        }
      }));

      this.loading = true;
    }
  }
}
