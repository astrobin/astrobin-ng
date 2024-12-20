import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SmartFolderType } from "@features/users/pages/gallery/user-gallery-smart-folders.component";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { FindImagesResponseInterface } from "@shared/services/api/classic/images/image/image-api.service";

@Component({
  selector: "astrobin-user-gallery-smart-folder",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <astrobin-loading-indicator *ngIf="loading"></astrobin-loading-indicator>

      <ng-container *ngIf="!loading">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <h4 class="mb-0 me-2">{{ humanizeFolderType() }}</h4>
          <a
            *ngFor="let item of menu"
            [class.active]="!!active && item[0].toString() === active.toString()"
            [routerLink]="['/u', user.username]"
            [queryParams]="{ 'folder-type': folderType, active: item[0] }"
            [fragment]="galleryFragment"
            class="smart-folder"
          >
            {{ item[1] }}
          </a>
        </div>

        <p *ngIf="!loading && (active === null || active === undefined)" class="mt-4 text- muted">
          {{ "Select a smart folder to see its content." | translate }}
        </p>
      </ng-container>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-smart-folder.component.scss"]
})
export class UserGallerySmartFolderComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() folderType: SmartFolderType;
  @Input() galleryFragment = "smart-folders";

  @Output() readonly activeChange = new EventEmitter<{
    active: string,
    menu: FindImagesResponseInterface["menu"]
  }>();

  protected menu: FindImagesResponseInterface["menu"];
  protected active: string | null = null;
  protected loading = true;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.activatedRoute.queryParamMap.pipe(
      map(queryParamMap => queryParamMap.get("active")),
      filter(active => active !== this.active),
      takeUntil(this.destroyed$)
    ).subscribe(active => {
      this.active = active;
      this.activeChange.emit({ active, menu: this.menu });
    });
  }

  ngOnChanges() {
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (this.folderType === SmartFolderType.NO_DATA && currentUser?.id !== this.user.id) {
        this.router.navigateByUrl("/permission-denied", { skipLocationChange: true });
        return;
      }

      this.active = this.activatedRoute.snapshot.queryParamMap.get("active");

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
        this.activeChange.emit({ active: this.active, menu: this.menu });
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
    });
  }

  protected humanizeFolderType(): string {
    switch (this.folderType) {
      case SmartFolderType.YEAR:
        return this.translateService.instant("Years");
      case SmartFolderType.GEAR:
        return this.translateService.instant("Optics and cameras");
      case SmartFolderType.SUBJECT:
        return this.translateService.instant("Subject types");
      case SmartFolderType.CONSTELLATION:
        return this.translateService.instant("Constellations");
      case SmartFolderType.NO_DATA:
        return this.translateService.instant("Lacking data");
    }
  }
}
