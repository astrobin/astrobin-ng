import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { of } from "rxjs";
import { filter, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { Store } from "@ngrx/store";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";

@Component({
  selector: "astrobin-brand-editor",
  templateUrl: "./brand-editor.component.html",
  styleUrls: ["./brand-editor.component.scss"]
})
export class BrandEditorComponent extends BaseComponentDirective implements OnInit {
  static MIN_LENGTH_FOR_SUGGESTIONS = 3;

  fields: FormlyFieldConfig[];

  @Input()
  form: FormGroup = new FormGroup({});

  @Input()
  model: Partial<BrandInterface> = {};

  @Input()
  name: string;

  @Output()
  suggestionSelected = new EventEmitter<BrandInterface>();

  @ViewChild("similarItemsTemplate")
  similarItemsTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly equipmentApiService: EquipmentApiService
  ) {
    super(store$);
  }

  private _showSimilarBrandsWarning(similarBrands: BrandInterface[]) {
    const fieldConfig = this.fields.find(fields => fields.key === "name");
    let template = null;
    let data = null;

    if (similarBrands.length > 0) {
      template = this.similarItemsTemplate;
      data = similarBrands;
    }

    fieldConfig.templateOptions.warningTemplate = template;
    fieldConfig.templateOptions.warningTemplateData = data;
  }

  ngOnInit(): void {
    if (this.name.length >= BrandEditorComponent.MIN_LENGTH_FOR_SUGGESTIONS) {
      this.equipmentApiService
        .findAllBrands(this.name)
        .pipe(take(1))
        .subscribe(similarBrands => {
          this._showSimilarBrandsWarning(similarBrands);
        });
    }

    this.fields = [
      {
        key: "name",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "brand-field-name",
        defaultValue: this.name,
        templateOptions: {
          required: true,
          label: this.translateService.instant("Name"),
          description: this.translateService.instant("The name of this brand. Make sure it's spelled correctly.")
        },
        hooks: {
          onInit: field => {
            field.formControl.valueChanges
              .pipe(
                takeUntil(this.destroyed$),
                switchMap(value => {
                  if (value.length >= BrandEditorComponent.MIN_LENGTH_FOR_SUGGESTIONS) {
                    return this.equipmentApiService.findAllBrands(value);
                  } else {
                    return of([]);
                  }
                }),
                tap(similarBrands => {
                  this._showSimilarBrandsWarning(similarBrands);
                })
              )
              .subscribe();
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
      .subscribe(brand => this.suggestionSelected.emit(brand));
  }
}
