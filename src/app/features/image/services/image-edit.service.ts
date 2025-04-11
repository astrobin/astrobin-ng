import { TemplateRef, Injectable } from "@angular/core";
import { FormControl, ValidationErrors, FormGroup } from "@angular/forms";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { GroupInterface } from "@core/interfaces/group.interface";
import { ImageInterface, SolarSystemSubjectType, SubjectType } from "@core/interfaces/image.interface";
import { LocationInterface } from "@core/interfaces/location.interface";
import { RemoteSourceAffiliateInterface } from "@core/interfaces/remote-source-affiliate.interface";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { ItemBrowserClear, ItemBrowserSet, LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem, selectEquipmentPresets } from "@features/equipment/store/equipment.selectors";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType,
  EquipmentItemUsageType
} from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { AcquisitionForm } from "@features/image/components/override-acquisition-form-modal/override-acquisition-form-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { forkJoin, Observable } from "rxjs";
import { filter, first, map, take } from "rxjs/operators";

export type ImageEditModelInterface = Partial<
  Omit<
    ImageInterface,
    | "imagingTelescopes2"
    | "imagingCameras2"
    | "mounts2"
    | "filters2"
    | "accessories2"
    | "software2"
    | "guidingTelescopes2"
    | "guidingCameras2"
  > & {
    imagingTelescopes2: TelescopeInterface["id"][];
    imagingCameras2: CameraInterface["id"][];
    mounts2: MountInterface["id"][];
    filters2: FilterInterface["id"][];
    accessories2: AccessoryInterface["id"][];
    software2: SoftwareInterface["id"][];
    guidingTelescopes2: TelescopeInterface["id"][];
    guidingCameras2: CameraInterface["id"][];
    overrideAcquisitionForm: AcquisitionForm | null;
  }
>;

export function KeyValueTagsValidator(control: FormControl): ValidationErrors {
  if (!control.value) {
    return null;
  }

  const regex = /[a-zA-Z_]{1,100}=[a-zA-Z0-9]{1,100}/;

  for (const line of control.value.trim().split("\n")) {
    if (!regex.test(line)) {
      return { keyValueTags: true };
    }
  }

  return null;
}

@Injectable({
  providedIn: null
})
export class ImageEditService extends BaseService {
  model: ImageEditModelInterface;
  form = new FormGroup({});
  groups: GroupInterface[];
  collections: CollectionInterface[];
  locations: LocationInterface[];
  fields: FormlyFieldConfig[];
  remoteSourceAffiliates: RemoteSourceAffiliateInterface[];

  remoteSourceLabelTemplate: TemplateRef<any>;
  remoteSourceOptionTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(loadingService);
  }

  isLongExposure(subjectType?: SubjectType, solarSystemMainSubject?: SolarSystemSubjectType): boolean {
    const { overrideAcquisitionForm } = this.model;

    if (!!overrideAcquisitionForm) {
      return overrideAcquisitionForm === AcquisitionForm.LONG_EXPOSURE;
    }

    return (
      this.isDeepSky(subjectType) ||
      (this.isSolarSystem(subjectType) &&
        (solarSystemMainSubject || this.model.solarSystemMainSubject) === SolarSystemSubjectType.COMET)
    );
  }

  isVideoBased(subjectType?: SubjectType, solarSystemMainSubject?: SolarSystemSubjectType): boolean {
    return !this.isLongExposure(subjectType, solarSystemMainSubject);
  }

  isDeepSky(subjectType?: SubjectType): boolean {
    if (subjectType === undefined) {
      subjectType = this.model.subjectType;
    }

    return (
      [
        SubjectType.DEEP_SKY,
        SubjectType.WIDE_FIELD,
        SubjectType.STAR_TRAILS,
        SubjectType.NORTHERN_LIGHTS,
        SubjectType.NOCTILUCENT_CLOUDS,
        SubjectType.LANDSCAPE
      ].indexOf(subjectType) > -1
    );
  }

  isSolarSystem(subjectType?: SubjectType): boolean {
    if (subjectType === undefined) {
      subjectType = this.model.subjectType;
    }

    return [SubjectType.SOLAR_SYSTEM].indexOf(subjectType) > -1;
  }

  public isSponsor(code: string): boolean {
    return (
      this.remoteSourceAffiliates.filter(affiliate => {
        const now = new Date();
        return (
          affiliate.code === code &&
          new Date(affiliate.affiliationStart) <= now &&
          new Date(affiliate.affiliationExpiration) > now
        );
      }).length > 0
    );
  }

  public hasEquipmentItems(): boolean {
    return (
      this.model.imagingTelescopes2?.length > 0 ||
      this.model.imagingCameras2?.length > 0 ||
      this.model.mounts2?.length > 0 ||
      this.model.filters2?.length > 0 ||
      this.model.accessories2?.length > 0 ||
      this.model.software2?.length > 0 ||
      this.model.guidingTelescopes2?.length > 0 ||
      this.model.guidingCameras2?.length > 0
    );
  }

  public hasDeepSkyAcquisitions(): boolean {
    return this.model.deepSkyAcquisitions && this.model.deepSkyAcquisitions.length > 0;
  }

  public hasSolarSystemAcquisitions(): boolean {
    return this.model.solarSystemAcquisitions && this.model.solarSystemAcquisitions.length > 0;
  }

  public currentEquipmentPreset$(): Observable<EquipmentPresetInterface | null> {
    return this.store$.select(selectEquipmentPresets).pipe(
      take(1),
      map(presets => {
        if (!presets || presets.length === 0) {
          return null;
        }

        for (const preset of presets) {
          if (
            JSON.stringify([...preset.imagingTelescopes].sort()) ===
              JSON.stringify([...this.model.imagingTelescopes2].sort()) &&
            JSON.stringify([...preset.guidingTelescopes].sort()) ===
              JSON.stringify([...this.model.guidingTelescopes2].sort()) &&
            JSON.stringify([...preset.imagingCameras].sort()) ===
              JSON.stringify([...this.model.imagingCameras2].sort()) &&
            JSON.stringify([...preset.guidingCameras].sort()) ===
              JSON.stringify([...this.model.guidingCameras2].sort()) &&
            JSON.stringify([...preset.mounts].sort()) === JSON.stringify([...this.model.mounts2].sort()) &&
            JSON.stringify([...preset.filters].sort()) === JSON.stringify([...this.model.filters2].sort()) &&
            JSON.stringify([...preset.accessories].sort()) === JSON.stringify([...this.model.accessories2].sort()) &&
            JSON.stringify([...preset.software].sort()) === JSON.stringify([...this.model.software2].sort())
          ) {
            return preset;
          }
        }

        return null;
      })
    );
  }

  loadEquipmentPreset(preset: EquipmentPresetInterface, componentId: string): Observable<void> {
    const load = (preset: EquipmentPresetInterface): Observable<void> => {
      return new Observable(observer => {
        for (const klass of [
          {
            property: "imagingTelescopes",
            type: EquipmentItemType.TELESCOPE,
            usageType: EquipmentItemUsageType.IMAGING
          },
          {
            property: "imagingCameras",
            type: EquipmentItemType.CAMERA,
            usageType: EquipmentItemUsageType.IMAGING
          },
          {
            property: "mounts",
            type: EquipmentItemType.MOUNT
          },
          {
            property: "filters",
            type: EquipmentItemType.FILTER
          },
          {
            property: "accessories",
            type: EquipmentItemType.ACCESSORY
          },
          {
            property: "software",
            type: EquipmentItemType.SOFTWARE
          },
          {
            property: "guidingTelescopes",
            type: EquipmentItemType.TELESCOPE,
            usageType: EquipmentItemUsageType.GUIDING
          },
          {
            property: "guidingCameras",
            type: EquipmentItemType.CAMERA,
            usageType: EquipmentItemUsageType.GUIDING
          }
        ]) {
          const ids = preset[klass.property] as EquipmentItemBaseInterface["id"][];
          ids.forEach(id => {
            this.store$.dispatch(new LoadEquipmentItem({ id, type: klass.type }));
          });

          this.store$.dispatch(new ItemBrowserClear({ type: klass.type, usageType: klass.usageType, componentId }));

          forkJoin(
            ids.map(id =>
              this.store$.select(selectEquipmentItem, { id, type: klass.type }).pipe(
                filter(item => !!item),
                first()
              )
            )
          ).subscribe(items => {
            this.store$.dispatch(
              new ItemBrowserSet({
                type: klass.type,
                usageType: klass.usageType,
                items,
                componentId
              })
            );

            this.popNotificationsService.success(this.translateService.instant("Equipment setup loaded."));

            observer.next();
            observer.complete();
          });
        }
      });
    };

    return new Observable(observer => {
      if (this.hasEquipmentItems()) {
        const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
        const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

        componentInstance.message = this.translateService.instant(
          "This operation will overwrite the current equipment selection."
        );

        modalRef.closed.pipe(take(1)).subscribe(() => {
          load(preset).subscribe(() => {
            observer.next();
            observer.complete();
          });
        });

        return;
      }

      load(preset).subscribe(() => {
        observer.next();
        observer.complete();
      });
    });
  }
}
