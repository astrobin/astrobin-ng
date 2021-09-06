import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from "@angular/router";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { take } from "rxjs/operators";
import { GearService } from "@shared/services/gear/gear.service";
import { UserService } from "@shared/services/user.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";

@Component({
  selector: "astrobin-migration-review-item",
  templateUrl: "./migration-review-item.component.html",
  styleUrls: ["./migration-review-item.component.scss"]
})
export class MigrationReviewItemComponent extends BaseComponentDirective implements OnInit {
  MigrationFlag = MigrationFlag;
  title = "Migration review";
  item;
  equipmentItem$;
  user$;

  constructor(
    public readonly store$: Store,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly legacyGearApiService: GearApiService,
    public readonly gearService: GearService,
    public readonly userService: UserService,
    public readonly loadingService: LoadingService,
    public readonly equipmentApiService: EquipmentApiService
  ) {
    super(store$);
  }

  get showButtonsOnSummary(): boolean {
    return (
      [MigrationFlag.DIY, MigrationFlag.MULTIPLE_ITEMS, MigrationFlag.WRONG_TYPE].indexOf(this.item.migrationFlag) > -1
    );
  }

  ngOnInit(): void {
    const itemId = this.activatedRoute.snapshot.paramMap.get("itemId");

    this.legacyGearApiService
      .get(+itemId)
      .pipe(take(1))
      .subscribe(item => {
        this.item = item;

        if (item.migrationFlag === MigrationFlag.MIGRATE) {
          this.equipmentItem$ = this.equipmentApiService.getByContentTypeAndObjectId(
            item.migrationContentType,
            item.migrationObjectId
          );
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

  accept() {
  }

  reject() {
  }
}
