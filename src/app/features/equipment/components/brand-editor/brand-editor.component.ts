import { Component, Input, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { AnyEquipmentItemType } from "@features/equipment/interfaces/equipment-item-base.interface";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-brand-editor",
  templateUrl: "./brand-editor.component.html",
  styleUrls: ["./brand-editor.component.scss"]
})
export class BrandEditorComponent implements OnInit {
  fields: FormlyFieldConfig[];

  @Input()
  form: FormGroup = new FormGroup({});

  @Input()
  model: Partial<AnyEquipmentItemType> = {};

  @Input()
  name: string;

  constructor(public readonly translateService: TranslateService) {}

  ngOnInit(): void {
    this.fields = [
      {
        key: "name",
        type: "input",
        id: "brand-field-name",
        defaultValue: this.name,
        templateOptions: {
          required: true,
          label: this.translateService.instant("Name"),
          description: this.translateService.instant("The name of this brand. Make sure it's spelled correctly.")
        }
      },
      {
        key: "website",
        type: "input",
        id: "brand-field-website",
        templateOptions: {
          required: true,
          label: this.translateService.instant("Website")
        },
        validators: {
          validation: ["url"]
        }
      }
    ];
  }
}
