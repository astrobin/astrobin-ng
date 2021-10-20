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
import { filter, map, switchMap, take } from "rxjs/operators";
import { forkJoin, of } from "rxjs";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GearService } from "@shared/services/gear/gear.service";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { FormGroup } from "@angular/forms";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { HttpStatusCode } from "@angular/common/http";
import { TelescopeApiService } from "@shared/services/api/classic/astrobin/telescope/telescope-api.service";

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

  constructor(
    public readonly store$: Store<State>,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly modal: NgbActiveModal,
    public readonly loadingService: LoadingService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly legacyGearService: GearService,
    public readonly legacyGearApi: GearApiService,
    public readonly legacyCameraApi: CameraApiService,
    public readonly legacyTelescopeApi: TelescopeApiService
  ) {
    super(store$);
  }

  ngOnInit() {
    let api;

    // TODO: complete
    switch (this.activeType) {
      case EquipmentItemType.CAMERA:
        api = this.legacyCameraApi;
        break;
      case EquipmentItemType.TELESCOPE:
        api = this.legacyTelescopeApi;
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
          switchMap(brand => api.getSimilarNonMigratedByMakeAndName(brand.name, this.equipmentItem.name)),
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

    for (const itemToMigrate of similarLegacyItems) {
      this.loadingService.setLoading(true);
      this.legacyGearApi
        .setMigration(itemToMigrate.pk, MigrationFlag.MIGRATE, this.activeType, this.equipmentItem.id)
        .subscribe(
          () => {
            this.loadingService.setLoading(false);
            this.popNotificationsService.success(`Good job! Items marked for migration.`);
            this.modal.close();
          },
          error => {
            this._operationError(error);
          }
        );
    }
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

  _operationError(error) {
    this.loadingService.setLoading(false);

    let message: string;

    if (error.status === HttpStatusCode.Conflict) {
      message = "This object was already processed by someone else at the same time. We'll get you another one!";
    } else {
      message = `Sorry, something went wrong: <em>${error.message}</em>`;
    }

    this.popNotificationsService.error(message, null, {
      enableHtml: true
    });
  }
}
