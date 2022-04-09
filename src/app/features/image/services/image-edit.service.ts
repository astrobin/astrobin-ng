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

export function KeyValueTagsValidator(control: FormControl): ValidationErrors {
  if (!control.value) {
    return null;
  }

  const regex = /^[a-zA-Z]{1,100}=[a-zA-Z0-9]{1,100}(?:(?:\r\n?|\n)[a-zA-Z]{1,100}=[a-zA-Z0-9]{1,100})*$/g;

  return regex.test(control.value) ? null : { keyValueTags: true };
}

@Injectable({
  providedIn: null
})
export class ImageEditService extends BaseService {
  image: ImageInterface;
  model: Partial<ImageInterface>;
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
            JSON.stringify(preset.imagingTelescopes) ===
              JSON.stringify(this.model.imagingTelescopes2.map(value => value.id)) &&
            JSON.stringify(preset.guidingTelescopes) ===
              JSON.stringify(this.model.guidingTelescopes2.map(value => value.id)) &&
            JSON.stringify(preset.imagingCameras) ===
              JSON.stringify(this.model.imagingCameras2.map(value => value.id)) &&
            JSON.stringify(preset.guidingCameras) ===
              JSON.stringify(this.model.guidingCameras2.map(value => value.id)) &&
            JSON.stringify(preset.mounts) === JSON.stringify(this.model.mounts2.map(value => value.id)) &&
            JSON.stringify(preset.filters) === JSON.stringify(this.model.filters2.map(value => value.id)) &&
            JSON.stringify(preset.accessories) === JSON.stringify(this.model.accessories2.map(value => value.id)) &&
            JSON.stringify(preset.software) === JSON.stringify(this.model.software2.map(value => value.id))
          ) {
            return preset;
          }
        }

        return null;
      })
    );
  }
}
