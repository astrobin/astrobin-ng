import { OnDestroy, OnInit, Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { UserInterface } from "@core/interfaces/user.interface";
import { GearApiService } from "@core/services/api/classic/astrobin/gear/gear-api.service";
import { GearMigrationStrategyApiService } from "@core/services/api/classic/astrobin/grar-migration-strategy/gear-migration-strategy-api.service";
import { MigrationFlag } from "@core/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { AccessoryApiService } from "@core/services/api/classic/gear/accessory/accessory-api.service";
import { CameraApiService } from "@core/services/api/classic/gear/camera/camera-api.service";
import { FilterApiService } from "@core/services/api/classic/gear/filter/filter-api.service";
import { MountApiService } from "@core/services/api/classic/gear/mount/mount-api.service";
import { SoftwareApiService } from "@core/services/api/classic/gear/software/software-api.service";
import { TelescopeApiService } from "@core/services/api/classic/gear/telescope/telescope-api.service";
import { GearService } from "@core/services/gear/gear.service";
import { LoadingService } from "@core/services/loading.service";
import { TitleService } from "@core/services/title/title.service";
import { UserService } from "@core/services/user.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { RejectMigrationModalComponent } from "@features/equipment/components/migration/reject-migration-modal/reject-migration-modal.component";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { ApproveEquipmentItem, EquipmentActionTypes, LoadBrand } from "@features/equipment/store/equipment.actions";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ofType, Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { of, Observable } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";

@Component({
  selector: "astrobin-migration-review-item",
  templateUrl: "./migration-review-item.component.html",
  styleUrls: ["./migration-review-item.component.scss"]
})
export class MigrationReviewItemComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  MigrationFlag = MigrationFlag;
  title = "Migration review";
  migrationStrategy: any;
  legacyItem: any;
  equipmentItem: EquipmentItemBaseInterface;
  user$: Observable<UserInterface>;
  releaseLockOnDestroy = true;

  constructor(
    public readonly store$: Store,
    public readonly actions$: Actions,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly legacyGearApiService: GearApiService,
    public readonly gearMigrationStrategyApiService: GearMigrationStrategyApiService,
    public readonly gearService: GearService,
    public readonly userService: UserService,
    public readonly loadingService: LoadingService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly router: Router,
    public readonly modalService: NgbModal,
    public readonly legacyCameraApiService: CameraApiService,
    public readonly legacyTelescopeApiService: TelescopeApiService,
    public readonly legacyMountApiService: MountApiService,
    public readonly legacyFilterApiService: FilterApiService,
    public readonly legacyAccessoryApiService: AccessoryApiService,
    public readonly legacySoftwareApiService: SoftwareApiService
  ) {
    super(store$);
  }

  get showButtonsOnSummary(): boolean {
    return (
      [MigrationFlag.MULTIPLE_ITEMS, MigrationFlag.WRONG_TYPE, MigrationFlag.NOT_ENOUGH_INFO].indexOf(
        this.migrationStrategy.migrationFlag
      ) > -1
    );
  }

  ngOnInit(): void {
    super.ngOnInit();

    const migrationStrategyId = this.activatedRoute.snapshot?.paramMap.get("migrationStrategyId");

    this.gearMigrationStrategyApiService
      .get(+migrationStrategyId)
      .pipe(
        switchMap(migrationStrategy => {
          this.migrationStrategy = migrationStrategy;
          return this.legacyGearApiService.getType(migrationStrategy.gear).pipe(
            map(type => ({
              migrationStrategy,
              type
            }))
          );
        }),
        switchMap(({ migrationStrategy, type }) => {
          let api: any = this.legacyGearApiService;

          switch (type) {
            case "camera":
              api = this.legacyCameraApiService;
              break;
            case "telescope":
              api = this.legacyTelescopeApiService;
              break;
            case "mount":
              api = this.legacyMountApiService;
              break;
            case "filter":
              api = this.legacyFilterApiService;
              break;
            case "accessory":
              api = this.legacyAccessoryApiService;
              break;
            case "software":
              api = this.legacySoftwareApiService;
              break;
          }

          return api.get(migrationStrategy.gear);
        }),
        switchMap((item: any) => {
          this.legacyItem = item;
          return this.gearMigrationStrategyApiService
            .lockForMigrationReview(this.migrationStrategy.pk)
            .pipe(map(() => item));
        })
      )
      .subscribe(() => {
        if (this.migrationStrategy.migrationFlag === MigrationFlag.MIGRATE) {
          this.equipmentApiService
            .getByContentTypeAndObjectId(
              this.migrationStrategy.migrationContentType,
              this.migrationStrategy.migrationObjectId
            )
            .pipe(take(1))
            .subscribe(equipmentItem => {
              this.equipmentItem = equipmentItem;

              if (!!equipmentItem.brand) {
                this.store$.dispatch(new LoadBrand({ id: equipmentItem.brand }));
              }
            });
        }

        this.user$ = this.userService.getUser$(this.migrationStrategy.migrationFlagModerator);
        this.store$.dispatch(new LoadUser({ id: this.migrationStrategy.migrationFlagModerator }));

        this.title = `Migration review: "${this.gearService.getDisplayName(
          this.legacyItem.make,
          this.legacyItem.name
        )}"`;

        this.titleService.setTitle(this.title);

        this.store$.dispatch(
          new SetBreadcrumb({
            breadcrumb: [
              {
                label: this.translateService.instant("Equipment")
              },
              {
                label: this.title
              }
            ]
          })
        );
      });
  }

  ngOnDestroy() {
    if (this.releaseLockOnDestroy) {
      this.gearMigrationStrategyApiService
        .releaseLockForMigrationReview(this.migrationStrategy.pk)
        .pipe(take(1))
        .subscribe();
    }

    this.loadingService.setLoading(false);

    super.ngOnDestroy();
  }

  approve() {
    this.loadingService.setLoading(true);

    this.gearMigrationStrategyApiService
      .approve(this.migrationStrategy.pk)
      .pipe(
        switchMap(migrationStrategy => {
          if (this.equipmentItem && !this.equipmentItem.reviewedBy) {
            this.store$.dispatch(new ApproveEquipmentItem({ item: this.equipmentItem, comment: null }));

            return this.actions$.pipe(ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS), take(1));
          } else {
            return of(migrationStrategy);
          }
        })
      )
      .subscribe(() => {
        this.exit();
      });
  }

  reject() {
    const modal: NgbModalRef = this.modalService.open(RejectMigrationModalComponent);
    const componentInstance: RejectMigrationModalComponent = modal.componentInstance;

    componentInstance.migrationStrategy = this.migrationStrategy;
    componentInstance.equipmentItem = this.equipmentItem;

    modal.closed.pipe(take(1)).subscribe(() => {
      this.releaseLockOnDestroy = false;
      this.exit();
    });
  }

  exit() {
    void this.router.navigateByUrl("/equipment/migration-review");
  }
}
