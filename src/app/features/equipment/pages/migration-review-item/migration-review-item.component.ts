import { Component, OnDestroy, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { map, switchMap, take } from "rxjs/operators";
import { GearService } from "@shared/services/gear/gear.service";
import { UserService } from "@shared/services/user.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { ApproveEquipmentItem, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { Observable, of } from "rxjs";
import { UserInterface } from "@shared/interfaces/user.interface";

@Component({
  selector: "astrobin-migration-review-item",
  templateUrl: "./migration-review-item.component.html",
  styleUrls: ["./migration-review-item.component.scss"]
})
export class MigrationReviewItemComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  MigrationFlag = MigrationFlag;
  title = "Migration review";
  legacyItem: any;
  equipmentItem: EquipmentItemBaseInterface;
  equipmentItem$: Observable<EquipmentItemBaseInterface>;
  user$: Observable<UserInterface>;

  constructor(
    public readonly store$: Store,
    public readonly actions$: Actions,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly legacyGearApiService: GearApiService,
    public readonly gearService: GearService,
    public readonly userService: UserService,
    public readonly loadingService: LoadingService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly router: Router
  ) {
    super(store$);
  }

  get showButtonsOnSummary(): boolean {
    return (
      [MigrationFlag.DIY, MigrationFlag.MULTIPLE_ITEMS, MigrationFlag.WRONG_TYPE].indexOf(
        this.legacyItem.migrationFlag
      ) > -1
    );
  }

  ngOnInit(): void {
    const itemId = this.activatedRoute.snapshot.paramMap.get("itemId");

    this.legacyGearApiService
      .get(+itemId)
      .pipe(
        take(1),
        switchMap(item => this.legacyGearApiService.lockForMigrationReview(+itemId).pipe(map(() => item)))
      )
      .subscribe(item => {
        this.legacyItem = item;

        if (item.migrationFlag === MigrationFlag.MIGRATE) {
          this.equipmentItem$ = this.equipmentApiService
            .getByContentTypeAndObjectId(item.migrationContentType, item.migrationObjectId)
            .pipe(map(equipmentItem => (this.equipmentItem = equipmentItem)));
        }

        this.user$ = this.userService.getUser$(item.migrationFlagModerator);
        this.store$.dispatch(new LoadUser({ id: item.migrationFlagModerator }));

        this.title = `Migration review for "${this.gearService.getDisplayName(item.make, item.name)}"`;

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
    const itemId = this.activatedRoute.snapshot.paramMap.get("itemId");

    this.legacyGearApiService
      .releaseLockForMigrationReview(+itemId)
      .pipe(take(1))
      .subscribe();

    this.loadingService.setLoading(false);

    super.ngOnDestroy();
  }

  accept() {
    this.loadingService.setLoading(true);

    this.legacyGearApiService
      .acceptMigration(this.legacyItem.pk)
      .pipe(
        switchMap(item => {
          if (this.equipmentItem && !this.equipmentItem.reviewedBy) {
            this.store$.dispatch(new ApproveEquipmentItem({ item: this.equipmentItem }));

            return this.actions$.pipe(ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS), take(1));
          } else {
            return of(item);
          }
        })
      )
      .subscribe(() => {
        this.exit();
      });
  }

  reject() {}

  exit() {
    this.router.navigateByUrl("/equipment/migration-review");
  }
}
