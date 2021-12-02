import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { AfterViewInit, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { EMPTY, of } from "rxjs";
import {
  CreateBrand,
  CreateBrandSuccess,
  EquipmentActionTypes,
  FindAllBrands,
  FindAllBrandsSuccess,
  FindSimilarInBrand,
  FindSimilarInBrandSuccess,
  GetOthersInBrand,
  GetOthersInBrandSuccess
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { LoadingService } from "@shared/services/loading.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";

export enum EquipmentItemEditorMode {
  CREATION,
  EDIT_PROPOSAL
}

const PROHIBITED_WORDS = [
  // English
  "modified",
  "modded",
  "upgraded",
  "sold",
  "used",
  "discontinued",
  "broken",
  "defective",
  "returned",
  "gift",
  "present",
  "lost",
  "cooled",

  // Italian
  "modificato",
  "modificata",
  "aggiornato",
  "aggiornata",
  "migliorato",
  "migliorata",
  "venduto",
  "venduta",
  "usato",
  "usata",
  "discontinuato",
  "discontinuata",
  "rotto",
  "rotta",
  "regalo",
  "regalato",
  "regalata",
  "perso",
  "persa",
  "perduto",
  "perduta",
  "raffreddato",
  "raffreddata",

  // German
  "geändert",
  "modifiziert",
  "hinaufgestuft",
  "verkauft",
  "gebraucht",
  "abgesetzt",
  "kaputt",
  "defekt",
  "retourniert",
  "Geschenk",
  "gegenwärtig",
  "verloren",
  "gekühlt"
];

@Component({
  selector: "astrobin-base-equipment-item-editor",
  template: ""
})
export class BaseItemEditorComponent<T extends EquipmentItemBaseInterface, SUB extends EquipmentItemBaseInterface>
  extends BaseComponentDirective
  implements AfterViewInit {
  fields: FormlyFieldConfig[];

  @Input()
  form: FormGroup = new FormGroup({});

  @Input()
  model: Partial<T> = {};

  @Input()
  name: string;

  @Input()
  returnToSelector: string;

  @Input()
  editorMode = EquipmentItemEditorMode.CREATION;

  @Output()
  subCreationInProgress = new EventEmitter<boolean>();

  @Output()
  suggestionSelected = new EventEmitter<EquipmentItem>();

  @ViewChild("brandOptionTemplate")
  brandOptionTemplate: TemplateRef<any>;

  @ViewChild("similarItemsTemplate")
  similarItemsTemplate: TemplateRef<any>;

  @ViewChild("othersInBrandTemplate")
  othersInBrandTemplate: TemplateRef<any>;

  brandCreation: {
    inProgress: boolean;
    form: FormGroup;
    model: Partial<BrandInterface>;
    name: string;
  } = {
    inProgress: false,
    form: new FormGroup({}),
    model: {},
    name: null
  };

  subCreation: {
    inProgress: boolean;
    form: FormGroup;
    model: Partial<SUB>;
    name: string;
  } = {
    inProgress: false,
    form: new FormGroup({}),
    model: {},
    name: null
  };

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService
  ) {
    super(store$);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const document = this.windowRefService.nativeWindow.document;
      (document.querySelector("#equipment-item-field-brand .ng-input input") as HTMLElement).focus();
    }, 100);
  }

  startBrandCreation() {
    this.brandCreation.inProgress = true;
    this.subCreationInProgress.emit(true);
  }

  endBrandCreation() {
    this.brandCreation.inProgress = false;
    this.subCreationInProgress.emit(false);
    this.brandCreation.model = {};
    this.brandCreation.form.reset();
  }

  createBrand() {
    const { id, ...brand } = this.brandCreation.form.value;
    this.loadingService.setLoading(true);
    this.store$.dispatch(new CreateBrand({ brand }));
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.CREATE_BRAND_SUCCESS),
        take(1),
        map((action: CreateBrandSuccess) => action.payload.brand)
      )
      .subscribe(newBrand => {
        this.brandCreated(newBrand);
        this.loadingService.setLoading(false);
      });
  }

  brandCreated(brand: BrandInterface) {
    if (brand === null) {
      this.endBrandCreation();
      return;
    }

    this.fields.find(field => field.key === "brand").templateOptions.options = [
      {
        value: brand.id,
        label: brand.name,
        brand
      }
    ];
    this.model = { ...this.model, ...{ brand: brand.id } };
    this.form.controls.brand.setValue(brand.id);
    this.brandCreation.name = brand.name;
    this.endBrandCreation();

    if (this.returnToSelector) {
      setTimeout(() => {
        this.windowRefService.nativeWindow.document
          .querySelector(this.returnToSelector)
          .scrollIntoView({ behavior: "smooth" });
      }, 1);
    }
  }

  protected _getDIYField() {
    return {
      key: "diy",
      type: "checkbox",
      id: "equipment-item-field-diy",
      expressionProperties: {
        "templateOptions.disabled": () =>
          this.subCreation.inProgress ||
          this.brandCreation.inProgress ||
          this.editorMode === EquipmentItemEditorMode.EDIT_PROPOSAL
      },
      defaultValue: false,
      templateOptions: {
        required: true,
        label: this.translateService.instant("Self-made / non-commercial (no brand)"),
        description:
          this.editorMode === EquipmentItemEditorMode.EDIT_PROPOSAL
            ? this.translateService.instant("Editing this field is not possible.")
            : this.translateService.instant(
                "Check this box if this item is self-made, and/or was never on the market as a commercial " +
                  "product, and therefore does not have a brand."
              )
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges
            .pipe(
              takeUntil(this.destroyed$),
              tap(value => {
                if (!!value) {
                  this.model.brand = null;
                  this.form.get("brand").setValue(null);
                }
              })
            )
            .subscribe();
        }
      }
    };
  }

  protected _getBrandField() {
    return {
      key: "brand",
      type: "ng-select",
      id: "equipment-item-field-brand",
      expressionProperties: {
        "templateOptions.disabled": () =>
          this.subCreation.inProgress ||
          this.brandCreation.inProgress ||
          this.editorMode === EquipmentItemEditorMode.EDIT_PROPOSAL ||
          !!this.model.diy,
        "templateOptions.required": () => !this.model.diy
      },
      templateOptions: {
        clearable: true,
        label: this.translateService.instant("Brand"),
        description:
          this.editorMode === EquipmentItemEditorMode.EDIT_PROPOSAL
            ? this.translateService.instant("Editing this field is not possible.")
            : null,
        options:
          this.model && this.model.brand
            ? this.store$.select(selectBrand, this.model.brand).pipe(
                filter(brand => !!brand),
                take(1),
                map(brand => [
                  {
                    value: brand.id,
                    label: brand.name,
                    brand
                  }
                ])
              )
            : of([]),
        onSearch: (term: string) => {
          this._onBrandSearch(term);
        },
        optionTemplate: this.brandOptionTemplate,
        addTag: () => {
          this.startBrandCreation();
          this.form.get("brand").setValue(null);
          setTimeout(() => {
            this.windowRefService.nativeWindow.document
              .getElementById("create-new-brand")
              .scrollIntoView({ behavior: "smooth" });
          }, 1);
        }
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges
            .pipe(
              takeUntil(this.destroyed$),
              tap(value => {
                this.formlyFieldService.clearMessages(field.templateOptions);

                if (!!value && this.form.get("name").value) {
                  this.form.get("name").markAsTouched();
                }
              }),
              switchMap((value: BrandInterface["id"]) => {
                if (!!value) {
                  return this.equipmentApiService.getBrand(value).pipe(
                    tap((brand: BrandInterface) => {
                      this.brandCreation.name = brand.name;

                      this.formlyFieldService.clearMessages(this.fields.find(f => f.key === "name").templateOptions);
                      this._validateBrandInName();
                      this._similarItemSuggestion();
                      this._othersInBrand();
                    })
                  );
                }

                return EMPTY;
              })
            )
            .subscribe();
        }
      }
    };
  }

  protected _getNameField() {
    return {
      key: "name",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "equipment-item-field-name",
      defaultValue: this.name,
      expressionProperties: {
        "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      templateOptions: {
        required: true,
        label: this.translateService.instant("Name"),
        description: this.translateService.instant(
          "The name of this product. Do not include the brand's name and make sure it's spelled correctly."
        )
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges
            .pipe(
              takeUntil(this.destroyed$),
              filter(value => !!value),
              tap((value: string) => {
                this.formlyFieldService.clearMessages(field.templateOptions);
                this.formlyFieldService.clearMessages(this.fields.find(f => f.key === "brand").templateOptions);
                this._validateBrandInName();
                this._similarItemSuggestion();
                this._editProposalWarning(field);
              })
            )
            .subscribe();
        }
      },
      asyncValidators: {
        uniqueForBrand: {
          expression: (control: FormControl) => {
            const type: EquipmentItemType = this.equipmentItemService.getType({
              ...this.model,
              ...this.form.value
            } as EquipmentItemBaseInterface);

            return this.equipmentApiService.getByBrandAndName(type, this.model.brand, control.value).pipe(
              map(item => {
                if (this.editorMode === EquipmentItemEditorMode.CREATION) {
                  return !item;
                }

                return !item || item.name === this.model.name;
              })
            );
          },
          message: this.translateService.instant("An item of the same class, brand, and name already exists.")
        },
        prohibitedWords: {
          expression: (control: FormControl) => {
            for (const word of PROHIBITED_WORDS) {
              if (control.value.toLowerCase().indexOf(word) > -1) {
                return of(false);
              }
            }

            return of(true);
          },
          message: (error, field: FormlyFieldConfig) => {
            for (const word of PROHIBITED_WORDS) {
              if (field.formControl.value.toLowerCase().indexOf(word) > -1) {
                return this.translateService.instant(
                  `Your usage of the word "{{0}}" suggests that you are using this field to specify a property ` +
                    "of this item that is only relevant to your own copy. Remember that here you are creating or editing " +
                    "the generic instance that will be shared by all owners on AstroBin.",
                  {
                    "0": word
                  }
                );
              }
            }
          }
        }
      }
    };
  }

  protected _getWebsiteField() {
    return {
      key: "website",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "equipment-item-field-website",
      expressionProperties: {
        "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      templateOptions: {
        required: false,
        label: this.translateService.instant("Website")
      },
      validators: {
        validation: ["url"]
      },
      asyncValidators: {
        urlIsAvailable: "url-is-available"
      }
    };
  }

  protected _getImageField() {
    return {
      key: "image",
      type: "file",
      id: "equipment-item-field-image",
      expressionProperties: {
        "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      templateOptions: {
        required: false,
        label: this.translateService.instant("Image"),
        description: this.translateService.instant("Official (or official looking) product image. Max. 1MB."),
        accept: "image/jpeg, image/png"
      },

      validators: {
        validation: [{ name: "file-size", options: { max: 1024 * 1024 } }, { name: "image-file" }]
      }
    };
  }

  protected _getEditProposalCommentField() {
    return {
      key: "editProposalComment",
      type: "textarea",
      wrappers: ["default-wrapper"],
      id: "equipment-item-field-edit-proposal-comment",
      templateOptions: {
        required: false,
        label: this.translateService.instant("Edit proposal comment")
      }
    };
  }

  protected _addBaseItemEditorFields() {
    if (this.editorMode === EquipmentItemEditorMode.EDIT_PROPOSAL) {
      this.fields.push(this._getEditProposalCommentField());
    }
  }

  protected _onBrandSearch(term: string) {
    this.brandCreation.name = term;

    if (!this.brandCreation.name) {
      return of([]);
    }

    const field = this.fields.find(f => f.key === "brand");
    this.store$.dispatch(new FindAllBrands({ q: this.brandCreation.name }));
    field.templateOptions.options = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_BRANDS_SUCCESS),
      map((action: FindAllBrandsSuccess) => action.payload.brands),
      map(brands =>
        brands.map(brand => {
          return {
            value: brand.id,
            label: brand.name,
            brand
          };
        })
      )
    );
  }

  private _similarItemSuggestion() {
    const brandControl: AbstractControl = this.form.get("brand");
    const nameControl: AbstractControl = this.form.get("name");
    const nameFieldConfig: FormlyFieldConfig = this.fields.find(field => field.key === "name");
    const type: EquipmentItemType = this.equipmentItemService.getType({ ...this.model, ...this.form.value });

    if (!type || !brandControl?.value || !nameControl.value || this.editorMode !== EquipmentItemEditorMode.CREATION) {
      return;
    }

    this.store$.dispatch(new FindSimilarInBrand({ brand: brandControl.value, q: nameControl.value, type }));
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS),
        map((action: FindSimilarInBrandSuccess) => action.payload.items),
        take(1)
      )
      .subscribe(similarItems => {
        let template = null;
        let data = null;

        if (similarItems.length > 0) {
          template = this.similarItemsTemplate;
          data = similarItems;
        }

        this.formlyFieldService.addMessage(nameFieldConfig.templateOptions, {
          level: FormlyFieldMessageLevel.WARNING,
          template,
          data
        });
      });
  }

  private _othersInBrand() {
    const brandControl: AbstractControl = this.form.get("brand");
    const brandFieldConfig: FormlyFieldConfig = this.fields.find(field => field.key === "brand");
    const type: EquipmentItemType = this.equipmentItemService.getType({ ...this.model, ...this.form.value });

    if (!type || !brandControl.value) {
      return;
    }

    this.store$.dispatch(new GetOthersInBrand({ brand: brandControl.value, type }));
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.GET_OTHERS_IN_BRAND_SUCCESS),
        map((action: GetOthersInBrandSuccess) => action.payload.items),
        take(1)
      )
      .subscribe(others => {
        let template = null;
        let data = null;

        if (others.length > 0) {
          template = this.othersInBrandTemplate;
          data = others;
          this.formlyFieldService.addMessage(brandFieldConfig.templateOptions, {
            level: FormlyFieldMessageLevel.INFO,
            template,
            data
          });
        }
      });
  }

  private _validateBrandInName() {
    const brandControl: AbstractControl = this.form.get("brand");
    const nameControl: AbstractControl = this.form.get("name");
    const brandFieldConfig: FormlyFieldConfig = this.fields.find(field => field.key === "brand");
    const nameFieldConfig: FormlyFieldConfig = this.fields.find(field => field.key === "name");
    const message = this.translateService.instant(
      "<strong>Careful!</strong> The item's name contains the brand's name (or vice versa), and it probably shouldn't."
    );

    if (!brandControl?.value || !nameControl?.value) {
      return;
    }

    this.store$
      .select(selectBrand, brandControl.value)
      .pipe(
        filter(brand => !!brand),
        take(1)
      )
      .subscribe(brand => {
        if (nameControl.value.toLowerCase().indexOf(brand.name.toLowerCase()) > -1) {
          this.formlyFieldService.addMessage(brandFieldConfig.templateOptions, {
            level: FormlyFieldMessageLevel.WARNING,
            text: message
          });
          this.formlyFieldService.addMessage(nameFieldConfig.templateOptions, {
            level: FormlyFieldMessageLevel.WARNING,
            text: message
          });
        }

        for (const word of nameControl.value.split(" ")) {
          if (brand.name.toLowerCase() === word.toLowerCase()) {
            this.formlyFieldService.addMessage(brandFieldConfig.templateOptions, {
              level: FormlyFieldMessageLevel.WARNING,
              text: message
            });
            this.formlyFieldService.addMessage(nameFieldConfig.templateOptions, {
              level: FormlyFieldMessageLevel.WARNING,
              text: message
            });
          }
        }
      });
  }

  private _editProposalWarning(field: FormlyFieldConfig) {
    if (this.editorMode !== EquipmentItemEditorMode.EDIT_PROPOSAL) {
      return;
    }

    const message = this.equipmentItemService.nameChangeWarningMessage();

    this.formlyFieldService.addMessage(field.templateOptions, {
      level: FormlyFieldMessageLevel.WARNING,
      text: message
    });
  }
}
