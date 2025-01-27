import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { SmartFolderType } from "@features/users/pages/gallery/user-gallery-smart-folders.component";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { FindImagesResponseInterface } from "@shared/services/api/classic/images/image/image-api.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { NgbOffcanvasRef } from "@ng-bootstrap/ng-bootstrap/offcanvas/offcanvas-ref";
import { ImageGalleryLayout } from "@shared/enums/image-gallery-layout.enum";

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

    <ng-template #activeSmartFolderGalleryOffcanvas let-offcanvas>
      <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">{{ activeLabel }}</h5>
          <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
        </div>

        <div class="offcanvas-body">
          <astrobin-equipment-item-summary
            *ngIf="activeEquipmentItem"
            [item]="activeEquipmentItem"
            [showDataDoesNotUpdateInRealTime]="false"
            [showEditButtons]="false"
            [showImage]="false"
            [showMostOftenUsedWith]="true"
            class="d-block mt-3 mb-5"
          ></astrobin-equipment-item-summary>

          <astrobin-user-gallery-images
            *ngIf="activeType && active !== null && active !== undefined"
            [activeLayout]="UserGalleryActiveLayout.MEDIUM"
            [user]="user"
            [userProfile]="userProfile"
            [options]="{
                includeStagingArea:
                  currentUserWrapper.user?.id === user.id &&
                  userProfile.displayWipImagesOnPublicGallery,
                subsection: activeType,
                active: active
              }"
          ></astrobin-user-gallery-images>
        </div>
      </ng-container>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-smart-folder.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGallerySmartFolderComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @ViewChild("activeSmartFolderGalleryOffcanvas") activeSmartFolderGalleryOffcanvas: TemplateRef<any>;

  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() folderType: SmartFolderType;
  @Input() galleryFragment = "smart-folders";

  @Output() readonly activeChange = new EventEmitter<{
    active: string,
    menu: FindImagesResponseInterface["menu"]
  }>();

  protected loading = true;
  protected menu: FindImagesResponseInterface["menu"];
  protected active: string | null = null;
  protected activeType: SmartFolderType | null = null;
  protected activeLabel: string | null = null;
  protected activeEquipmentItem: EquipmentItem | null = null;

  protected readonly UserGalleryActiveLayout = ImageGalleryLayout;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.activatedRoute.queryParamMap.pipe(
      map(queryParamMap => queryParamMap.get("active")),
      filter(active => active !== null && active !== this.active),
      takeUntil(this.destroyed$)
    ).subscribe(active => {
      this.active = active;
      this.onActiveSmartFolderChange({ active, menu: this.menu });
      this.changeDetectorRef.markForCheck();
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this._setSmartFolderFromRoute();
      this.changeDetectorRef.markForCheck();
    });

    this._setSmartFolderFromRoute();
  }

  ngOnChanges() {
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (this._shouldDenyAccess(currentUser)) {
        this.router.navigateByUrl("/permission-denied", { skipLocationChange: true });
        return;
      }

      this._initializeFromRoute();
      this._loadImages();
      this.changeDetectorRef.markForCheck();
    });
  }

  private _shouldDenyAccess(currentUser: UserInterface): boolean {
    return this.folderType === SmartFolderType.NO_DATA && currentUser?.id !== this.user.id;
  }

  private _initializeFromRoute() {
    this.activeType = this.activatedRoute.snapshot.queryParamMap.get("folder-type") as SmartFolderType;
    this.active = this.activatedRoute.snapshot.queryParamMap.get("active");
  }

  private _loadImages() {
    this.loading = true;

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
      this.onActiveSmartFolderChange({ active: this.active, menu: this.menu });
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    });

    this.store$.dispatch(new FindImages({
      options: {
        userId: this.user.id,
        page: 1,
        subsection: this.folderType,
        gallerySerializer: true,
        active: this.active
      }
    }));
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

  protected onActiveSmartFolderChange(event: {
    active: string,
    menu: FindImagesResponseInterface["menu"]
  }) {
    this.active = event.active;
    this.activeChange.emit(event);

    if (!!this.active) {
      const menuEntry = event.menu.find(item => item[0] === event.active);
      this.activeLabel = menuEntry ? menuEntry[1] : null;
      this._openSmartFolderGalleryOffcanvas();
    }
  }

  private _setSmartFolderFromRoute() {
    this.activeType = this.activatedRoute.snapshot.queryParamMap.get("folder-type") as SmartFolderType;
    this.active = this.activatedRoute.snapshot.queryParamMap.get("active");

    if (this._isGearFolder()) {
      this._handleGearEquipment();
    } else {
      this.activeEquipmentItem = null;
    }
  }

  private _isGearFolder(): boolean {
    return (
      this.activeType === SmartFolderType.GEAR &&
      this.active?.length > 0 &&
      this.active[0] === "N"
    );
  }

  private _handleGearEquipment() {
    const equipmentType = this._getEquipmentType();

    if (equipmentType) {
      const itemId = parseInt(this.active.substring(2), 10);
      this._loadEquipmentItem(itemId, equipmentType);
    } else {
      this.activeEquipmentItem = null;
    }
  }

  private _getEquipmentType(): EquipmentItemType | null {
    const equipmentTypeShorthand = this.active[1];

    if (equipmentTypeShorthand === "T") {
      return EquipmentItemType.TELESCOPE;
    } else if (equipmentTypeShorthand === "C") {
      return EquipmentItemType.CAMERA;
    }

    return null;
  }

  private _loadEquipmentItem(itemId: number, equipmentType: EquipmentItemType) {
    const payload = { id: itemId, type: equipmentType };

    this.store$.pipe(
      select(selectEquipmentItem, payload),
      filter(item => !!item),
      take(1)
    ).subscribe(item => {
      this.activeEquipmentItem = item;
      this.changeDetectorRef.markForCheck();
    });

    this.store$.dispatch(new LoadEquipmentItem(payload));
  }

  private _openSmartFolderGalleryOffcanvas() {
    this.utilsService.delay(1).pipe(
      take(1)
    ).subscribe(() => {
      const offcanvasRef = this._createOffcanvas();
      this._setupDismissHandler(offcanvasRef);
    });
  }

  private _createOffcanvas() {
    return this.offcanvasService.open(this.activeSmartFolderGalleryOffcanvas, {
      panelClass: "active-smart-folder-gallery-offcanvas",
      position: this.deviceService.offcanvasPosition()
    });
  }

  private _setupDismissHandler(offcanvasRef: NgbOffcanvasRef) {
    const dismissSubscription = offcanvasRef.dismissed.pipe(
      take(1)
    ).subscribe(() => {
      this._handleDismiss();
    });

    this.destroyed$.pipe(take(1)).subscribe(() => {
      dismissSubscription.unsubscribe();
    });
  }

  private _handleDismiss() {
    this.router.navigate([], {
      queryParams: { active: null },
      queryParamsHandling: "merge",
      fragment: this.galleryFragment
    }).then(() => {
      this.onActiveSmartFolderChange({ active: null, menu: this.menu });
      this.changeDetectorRef.markForCheck();
    });
  }
}
