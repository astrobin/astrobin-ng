import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { ActivatedRoute } from "@angular/router";
import { CameraApiService } from "@shared/services/api/classic/astrobin/camera/camera-api.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import { concat, forkJoin, of } from "rxjs";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GearService } from "@shared/services/gear/gear.service";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { FormGroup } from "@angular/forms";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { HttpStatusCode } from "@angular/common/http";
import { TelescopeApiService } from "@shared/services/api/classic/astrobin/telescope/telescope-api.service";
import { MountApiService } from "@shared/services/api/classic/astrobin/mount/mount-api.service";
import { FilterApiService } from "@shared/services/api/classic/astrobin/filter/filter-api.service";
import { AccessoryApiService } from "@shared/services/api/classic/astrobin/accessory/accessory-api.service";
import { SoftwareApiService } from "@shared/services/api/classic/astrobin/software/software-api.service";
import { ActiveToast } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-merge-into-modal",
  templateUrl: "./merge-into-modal.component.html",
  styleUrls: ["./merge-into-modal.component.scss"]
})
export class MergeIntoModalComponent extends BaseComponentDirective implements OnInit {
  @Input()
  activeType: EquipmentItemType;

  @Input()
  equipmentItem: EquipmentItemBaseInterface;

  similarLegacyItems: any[] = [];

  form: FormGroup = new FormGroup({});
  model: number[] = [];
  fields: FormlyFieldConfig[];

  singleMigrationNotification: ActiveToast<any>;

  message = this.translateService.instant(
    "We found these items in the legacy database that are similar to this one. Please check the ones that you " +
      "want to migrate into it. <strong>Please be careful!</strong> Not all items that AstroBin thinks are " +
      "similar, are necessarily the same product. Only check the ones that you are sure of."
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly modal: NgbActiveModal,
    public readonly loadingService: LoadingService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly legacyGearService: GearService,
    public readonly legacyGearApi: GearApiService,
    public readonly legacyCameraApi: CameraApiService,
    public readonly legacyTelescopeApi: TelescopeApiService,
    public readonly legacyMountApi: MountApiService,
    public readonly legacyFilterApi: FilterApiService,
    public readonly legacyAccessoryApi: AccessoryApiService,
    public readonly legacySoftwareApi: SoftwareApiService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    let api;

    if (!this.equipmentItem.brand) {
      return;
    }

    switch (this.activeType) {
      case EquipmentItemType.CAMERA:
        api = this.legacyCameraApi;
        break;
      case EquipmentItemType.TELESCOPE:
        api = this.legacyTelescopeApi;
        break;
      case EquipmentItemType.MOUNT:
        api = this.legacyMountApi;
        break;
      case EquipmentItemType.FILTER:
        api = this.legacyFilterApi;
        break;
      case EquipmentItemType.ACCESSORY:
        api = this.legacyAccessoryApi;
        break;
      case EquipmentItemType.SOFTWARE:
        api = this.legacySoftwareApi;
        break;
      default:
        this.popNotificationsService.error("Wrong item type requested.");
    }

    if (api) {
      this.loadingService.setLoading(true);

      this.store$.dispatch(new LoadBrand({ id: this.equipmentItem.brand }));

      this.store$
        .select(selectBrand, this.equipmentItem.brand)
        .pipe(
          filter(brand => !!brand),
          switchMap(brand => this.currentUser$.pipe(map(user => ({ brand, user })))),
          switchMap(({ brand, user }) =>
            api.getSimilarNonMigratedByMakeAndName(
              brand.name,
              this.equipmentItem.name,
              user.groups.filter(group => group.name === "equipment_moderators").length > 0
            )
          ),
          switchMap((legacyItems: any[]) => {
            this.similarLegacyItems = legacyItems;

            if (legacyItems.length === 0) {
              return of(legacyItems);
            }

            return forkJoin(...[legacyItems.map(item => this.legacyGearApi.lockForMigration(item.pk))]).pipe(
              map(() => legacyItems)
            );
          })
        )
        .subscribe(legacyItems => {
          this.loadingService.setLoading(false);

          if (legacyItems.length > 0) {
            this.model = legacyItems.map(item => item.pk);
            this.fields = legacyItems.map(item => ({
              key: `similar-item-${item.pk}`,
              type: "checkbox",
              id: `similar-item-${item.pk}`,
              defaultValue: false,
              templateOptions: {
                required: false,
                label: this.legacyGearService.getDisplayName(item.make, item.name),
                value: item.pk
              }
            }));
          }
        });
    }
  }

  migrateButtonDisabled(): boolean {
    const selection: { [key: string]: boolean } = this.form.value;
    const allFalse = Object.values(selection).every(value => !value);

    return this.similarLegacyItems.length === 0 || !this.form.valid || allFalse;
  }

  migrate() {
    const selectedSimilarLegacyItemsPks = this._getSelectedSimilarLegacyItemsPks();
    const similarLegacyItems = this.similarLegacyItems.filter(
      item => selectedSimilarLegacyItemsPks.indexOf(item.pk) > -1
    );
    const observables = similarLegacyItems.map(legacyItem =>
      this.legacyGearApi.setMigration(legacyItem.pk, MigrationFlag.MIGRATE, this.activeType, this.equipmentItem.id)
    );

    const total = similarLegacyItems.length;
    let counter = 0;

    this.loadingService.setLoading(true);

    concat(...observables).subscribe(() => {
      counter++;

      if (!!this.singleMigrationNotification) {
        this.popNotificationsService.remove(this.singleMigrationNotification.toastId);
      }

      if (counter === total) {
        this.loadingService.setLoading(false);

        this.popNotificationsService.success(
          this.translateService.instant("Good job! {{0}} items marked for migration.", {
            0: counter
          })
        );

        this.modal.close();
      } else {
        this.singleMigrationNotification = this.popNotificationsService.success(
          this.translateService.instant("Processed item {{0}}/{{1}}.", {
            0: counter,
            1: total
          }),
          null,
          {
            progressBar: false
          }
        );
      }
    });
  }

  _getSelectedSimilarLegacyItemsPks() {
    const items = [];

    for (const key of Object.keys(this.form.value)) {
      const pk: number = +key.split("similar-item-")[1];
      const value: boolean = this.form.value[key];

      if (value) {
        items.push(pk);
      }
    }

    return items;
  }
}
