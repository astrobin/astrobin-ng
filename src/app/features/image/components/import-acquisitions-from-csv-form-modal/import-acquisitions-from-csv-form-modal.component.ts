import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";

@Component({
  selector: "astrobin-import-acquisitions-from-csv-form-modal",
  templateUrl: "./import-acquisitions-from-csv-form-modal.component.html",
  styleUrls: ["./import-acquisitions-from-csv-form-modal.component.scss"]
})
export class ImportAcquisitionsFromCsvFormModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    acquisitionsCsv: string | null;
  } = {
    acquisitionsCsv: null
  };

  @ViewChild("optionTemplate")
  optionTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService,
    public readonly imageEditService: ImageEditService,
    public readonly acquisitionFieldsService: ImageEditAcquisitionFieldsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.utilsService.delay(1).subscribe(() => {
      this._setFields();
    });
  }

  onImportClicked() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.modal.close(this.model.acquisitionsCsv);
  }

  private _setFields() {
    this.fields = [
      {
        key: "acquisitionsCsv",
        type: "textarea",
        wrappers: ["default-wrapper"],
        props: {
          required: true,
          label: this.translateService.instant("Comma-separated values (CSV) of acquisition sessions"),
          description: this.translateService.instant("Invalid values will be ignored. Documentation is available here: {{link}}", {
            link: `<a href="https://welcome.astrobin.com/importing-acquisitions-from-csv/" target="_blank">
              ${this.translateService.instant("Importing acquisitions from CSV")}</a>`
          }),
          rows: 10
        },
        modelOptions: {
          updateOn: "blur"
        },
        parsers: [value => value ? value.trim() : value],
        validators: {
          validation: [
            {
              name: "csv",
              options: {
                requiredHeaders: this._requiredHeaders(),
                allowedHeaders: this._allowedHeaders()
              }
            }
          ]
        }
      }
    ];
  }

  private _requiredHeaders() {
    const longExposureValue = this._allDeepSkyFields()
      .filter(field => field.props?.required)
      .map(field => field.key);

    const videoBasedValue = this._allSolarSystemFields()
      .filter(field => field.props?.required)
      .map(field => field.key);

    return this.imageEditService.isLongExposure() ? longExposureValue : videoBasedValue;
  }

  private _allowedHeaders() {
    const longExposureValue = this._allDeepSkyFields()
      .map(field => field.key)
      .map(key => key === "filter2" ? "filter" : key);
    const videoBasedValue = this._allSolarSystemFields().map(field => field.key);

    return this.imageEditService.isLongExposure() ? longExposureValue : videoBasedValue;
  }

  private _allDeepSkyFields() {
    return this._findLeafFields(this.acquisitionFieldsService.getDeepSkyFields());
  }

  private _allSolarSystemFields() {
    return this._findLeafFields(this.acquisitionFieldsService.getSolarSystemFields());
  }

  private _findLeafFields(fieldConfig: FormlyFieldConfig[], fields: FormlyFieldConfig[] = []): FormlyFieldConfig[] {
    fieldConfig.forEach(field => {
      if (field.fieldGroup && field.fieldGroup.length > 0) {
        this._findLeafFields(field.fieldGroup, fields);
      } else if (field.fieldArray && (field.fieldArray as any).fieldGroup && (field.fieldArray as any).fieldGroup.length > 0) {
        this._findLeafFields((field.fieldArray as any).fieldGroup, fields);
      } else if (field.key) {
        fields.push(field);
      }
    });
    return fields;
  }
}
