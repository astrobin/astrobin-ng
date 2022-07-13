import { Injectable, TemplateRef } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { FormControl, FormGroup, ValidationErrors } from "@angular/forms";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { GroupInterface } from "@shared/interfaces/group.interface";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { RemoteSourceAffiliateInterface } from "@shared/interfaces/remote-source-affiliate.interface";
import { LocationInterface } from "@shared/interfaces/location.interface";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { selectEquipmentPresets } from "@features/equipment/store/equipment.selectors";
import { map } from "rxjs/operators";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";

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
  image: ImageInterface;
  model: Partial<
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
    }
  >;
  form = new FormGroup({});
  groups: GroupInterface[];
  locations: LocationInterface[];
  fields: FormlyFieldConfig[];
  remoteSourceAffiliates: RemoteSourceAffiliateInterface[];

  remoteSourceLabelTemplate: TemplateRef<any>;
  remoteSourceOptionTemplate: TemplateRef<any>;

  constructor(public readonly store$: Store<State>, public readonly loadingService: LoadingService) {
    super(loadingService);
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

  public currentEquipmentPreset$(): Observable<EquipmentPresetInterface | null> {
    return this.store$.select(selectEquipmentPresets).pipe(
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
}
