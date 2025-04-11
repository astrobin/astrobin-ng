import { MainState } from "@app/store/state";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

export class AdditionalAcquisitionPropertiesBase extends BaseComponentDirective {
  imageEditService: ImageEditService;
  fields: FormlyFieldConfig[];
  fieldGroup: FormlyFieldConfig[];
  index: number;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  close(): void {
    const fieldsWithErrors: FormlyFieldConfig[] = UtilsService.fieldsWithErrors(this.fieldGroup);
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
