import { Injectable, TemplateRef } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { FormControl, FormGroup, ValidationErrors } from "@angular/forms";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { GroupInterface } from "@shared/interfaces/group.interface";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { RemoteSourceAffiliateInterface } from "@shared/interfaces/remote-source-affiliate.interface";
import { LocationInterface } from "@shared/interfaces/location.interface";

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

  constructor(public readonly loadingService: LoadingService) {
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
}
