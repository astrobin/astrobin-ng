import type { AfterViewInit, OnInit, TemplateRef } from "@angular/core";
import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import type { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import type { FormlyFieldService } from "@core/services/formly-field.service";
import { FormlyFieldMessageLevel } from "@core/services/formly-field.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import type { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import type { BrandInterface } from "@features/equipment/types/brand.interface";
import type { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { of } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap
} from "rxjs/operators";

const PROHIBITED_DIY_WORDS = [
  // English
  "diy",
  "do-it-yourself",
  "do it yourself",
  "self-made",
  "self made",
  "self-built",
  "self built",
  "homemade",
  "home-made",
  "home made",
  "handmade",
  "hand made",
  "handcrafted",
  "custom",
  "n/a",
  "n.a.",

  // Italian
  "autocostruito",
  "autocostruita",
  "fai-da-te",
  "fai da te",

  // German
  "selbstmachen",
  "mach-es-selbst",
  "mach es selbst",
  "selbstgemacht",
  "handgemacht"
];

@Component({
  selector: "astrobin-brand-editor-form",
  templateUrl: "./brand-editor-form.component.html",
  styleUrls: ["./brand-editor-form.component.scss"]
})
export class BrandEditorFormComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
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
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly windowRefService: WindowRefService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    if (this.name?.length >= BrandEditorFormComponent.MIN_LENGTH_FOR_SUGGESTIONS) {
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
        props: {
          required: true,
          label: this.translateService.instant("Name of the brand (or company, or developer(s))"),
          description: this.translateService.instant("The name of this brand. Make sure it's spelled correctly.")
        },
        hooks: {
          onInit: field => {
            field.formControl.valueChanges
              .pipe(
                takeUntil(this.destroyed$),
                filter(value => !!value),
                switchMap(value => {
                  if (value.length >= BrandEditorFormComponent.MIN_LENGTH_FOR_SUGGESTIONS) {
                    return this.equipmentApiService.findAllBrands(value);
                  } else {
                    return of([]);
                  }
                }),
                tap(similarBrands => {
                  this.formlyFieldService.clearMessages(field, "similarBrands");
                  this._showSimilarBrandsWarning(similarBrands);
                })
              )
              .subscribe();
          }
        },
        asyncValidators: {
          prohibitedWords: {
            expression: (control: FormControl) => {
              for (const word of PROHIBITED_DIY_WORDS) {
                if (control.value.toLowerCase().indexOf(word) > -1) {
                  return of(false);
                }
              }

              return of(true);
            },
            message: (error, field: FormlyFieldConfig) => {
              for (const word of PROHIBITED_DIY_WORDS) {
                if (field.formControl.value.toLowerCase().indexOf(word) > -1) {
                  return this.translateService.instant(
                    `Your usage of the word "{{0}}" suggests that you are trying to add a DIY item. The AstroBin
                    equipment database is meant for products that are (or have been) on the market and can (or could)
                    be purchased. To add a DIY item, please use the appropriate checkbox during the item's creation.`,
                    {
                      "0": word
                    }
                  );
                }
              }
            }
          },
          nina: {
            expression: (control: FormControl) => {
              return of(control.value.toLowerCase().indexOf("nina") === -1);
            },
            message: (error, field: FormlyFieldConfig) => {
              return this.translateService.instant(
                `N.I.N.A. is a software and not a brand, and it does not need to be added again. Please ` +
                  `search for it as: 'Stefan Berg Nighttime Imaging 'N' Astronomy (N.I.N.A. / NINA)'.`
              );
            }
          },
          teleskopExpress: {
            expression: (control: FormControl) => {
              return of(
                control.value.toLowerCase().indexOf("teleskop-express") === -1 &&
                  control.value.toLowerCase().indexOf("teleskop express") === -1 &&
                  control.value.toLowerCase().indexOf("teleskop-service") === -1 &&
                  control.value.toLowerCase().indexOf("teleskop service") === -1
              );
            },
            message: (error, field: FormlyFieldConfig) => {
              return this.translateService.instant(
                "The brand you are looking for is {{0}} and it already exists on AstroBin's database.",
                {
                  0: "TS-Optics"
                }
              );
            }
          },
          unique: {
            expression: (control: FormControl) => {
              return control.valueChanges.pipe(
                startWith(control.value),
                debounceTime(500),
                distinctUntilChanged(),
                switchMap(value => this.equipmentApiService.getBrandsByName(value)),
                map(brands => brands.count === 0),
                first()
              );
            },
            message: this.translateService.instant("A brand with this name already exists.")
          }
        }
      },
      {
        key: "website",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "brand-field-website",
        props: {
          required: true,
          label: this.translateService.instant("Website")
        },
        validators: {
          validation: ["url"]
        },
        asyncValidators: {
          urlIsAvailable: "url-is-available",
          unique: {
            expression: (control: FormControl) => {
              return control.valueChanges.pipe(
                startWith(control.value),
                debounceTime(500),
                distinctUntilChanged(),
                switchMap(value => this.equipmentApiService.getBrandsByWebsite(value)),
                map(brands => brands.count === 0),
                first()
              );
            },
            message: this.translateService.instant("A brand with this website already exists.")
          }
        }
      },
      {
        key: "logo",
        type: "file",
        wrappers: ["default-wrapper"],
        id: "brand-field-logo",
        props: {
          required: false,
          label: this.translateService.instant("Logo"),
          accept: "image/jpeg, image/png",
          image: true
        }
      }
    ];
  }

  ngAfterViewInit(): void {
    this.utilsService.delay(100).subscribe(() => {
      const document = this.windowRefService.nativeWindow.document;
      (document.querySelector("#brand-field-name") as HTMLElement).focus();
    });
  }

  private _showSimilarBrandsWarning(similarBrands: BrandInterface[]) {
    const fieldConfig = this.fields.find(fields => fields.key === "name");
    let template = null;
    let data = null;

    if (similarBrands.length > 0) {
      template = this.similarItemsTemplate;
      data = similarBrands;

      this.formlyFieldService.addMessage(fieldConfig, {
        scope: "similarBrands",
        level: FormlyFieldMessageLevel.WARNING,
        template,
        data
      });
    } else {
      this.formlyFieldService.clearMessages(fieldConfig, "similarBrands");
    }
  }
}
