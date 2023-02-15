import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";

export class AdditionalAcquisitionPropertiesBase extends BaseComponentDirective {
  imageEditService: ImageEditService;
  fields: FormlyFieldConfig[];
  fieldGroup: FormlyFieldConfig[];
  index: number;

  constructor(
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  close(): void {
    const fieldsWithErrors: FormlyFieldConfig[] = UtilsService.fieldWithErrors(this.fieldGroup);
    if (fieldsWithErrors.length > 0) {
      const errorList: string[] = fieldsWithErrors.map(field => `<li>${field.props.label}</li>`);

      this.popNotificationsService.error(
        `
          <p>
            ${this.translateService.instant("Please address all fields with errors before closing this window.")}
          </p>
          <ul>
            ${errorList.join("\n")}
          </ul>
        `,
        null,
        {
          enableHtml: true
        }
      );
    } else {
      this.modal.dismiss();
    }
  }
}
