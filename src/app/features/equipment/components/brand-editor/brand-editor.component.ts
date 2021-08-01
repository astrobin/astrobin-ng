import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { Observable, of } from "rxjs";
import { filter, tap } from "rxjs/operators";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { Store } from "@ngrx/store";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-brand-editor",
  templateUrl: "./brand-editor.component.html",
  styleUrls: ["./brand-editor.component.scss"]
})
export class BrandEditorComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];

  @Input()
  form: FormGroup = new FormGroup({});

  @Input()
  model: Partial<BrandInterface> = {};

  @Input()
  name: string;

  @Output()
  created = new EventEmitter<BrandInterface>();

  similarBrands$: Observable<BrandInterface[]> = of([]);

  constructor(
    public readonly store$: Store,
    public readonly translateService: TranslateService,
    public readonly equipmentApiService: EquipmentApiService
  ) {
    super();
  }

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
        },
        hooks: {
          onInit: field => {
            return field.formControl.valueChanges.pipe(
              tap(value => {
                if (value.length >= 3) {
                  this.similarBrands$ = this.equipmentApiService.findAllBrands(value);
                } else {
                  this.similarBrands$ = of([]);
                }
              })
            );
          }
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
      },

      {
        key: "logo",
        type: "file",
        id: "brand-field-logo",
        templateOptions: {
          required: false,
          label: this.translateService.instant("Logo"),
          accept: "image/jpeg, image/png"
        }
      }
    ];
  }

  use(event, brandId: BrandInterface["id"]) {
    event.preventDefault();

    this.store$.dispatch(new LoadBrand({ id: brandId }));
    this.store$
      .select(selectBrand, brandId)
      .pipe(filter(brand => !!brand))
      .subscribe(brand => this.created.emit(brand));
  }
}
