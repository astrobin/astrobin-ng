import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
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
            [class.active]="item[0] === active"
            [routerLink]="['/u', user.username]"
            [queryParams]="{ 'folder-type': folderType, active: item[0] }"
            fragment="smart-folders"
            class="smart-folder badge badge-pill rounded-pill px-3 py-2"
          >
            {{ item[1] }}
          </a>
        </div>

        <p *ngIf="!loading && !active" class="mt-4 text-muted">
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

  @Output() readonly activeChange = new EventEmitter<string>();

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

    this.activatedRoute.queryParamMap.pipe(
      map(queryParamMap => queryParamMap.get("active")),
      filter(active => active !== this.active),
      takeUntil(this.destroyed$)
    ).subscribe(active => {
      if (active !== this.active) {
        this.active = active;
        this.activeChange.emit(active);
      }
    });

    this.active = this.activatedRoute.snapshot.queryParamMap.get("active");

    if (this.active) {
      this.activeChange.emit(this.active);
    }
  }

  ngOnChanges() {
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
        this.active = payload.response.active;

        if (this.active) {
          this.activeChange.emit(this.active);
        }

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
    } else {
      this.loading = false;
    }
  }

  protected humanizeFolderType(): string {
    switch (this.folderType) {
      case SmartFolderType.YEAR:
        return this.translateService.instant("Years");
      case SmartFolderType.GEAR:
        return this.translateService.instant("Equipment");
      case SmartFolderType.SUBJECT:
        return this.translateService.instant("Subject types");
      case SmartFolderType.CONSTELLATION:
        return this.translateService.instant("Constellations");
    }
  }
}
