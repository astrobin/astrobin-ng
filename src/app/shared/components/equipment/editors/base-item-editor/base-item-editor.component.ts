import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { AfterViewInit, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { EMPTY, Observable, of } from "rxjs";
import {
  CreateBrand,
  CreateBrandSuccess,
  EquipmentActionTypes,
  FindAllBrands,
  FindAllBrandsSuccess,
  FindSimilarInBrand,
  FindSimilarInBrandSuccess,
  GetOthersInBrand,
  GetOthersInBrandSuccess,
  LoadBrand,
  LoadEquipmentItem
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap
} from "rxjs/operators";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { LoadingService } from "@shared/services/loading.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import {
  EquipmentItemDisplayProperty,
  EquipmentItemService
} from "@features/equipment/services/equipment-item.service";
import { FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { InformationDialogComponent } from "@shared/components/misc/information-dialog/information-dialog.component";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { UtilsService } from "@shared/services/utils/utils.service";

export enum EquipmentItemEditorMode {
  CREATION,
  EDIT_PROPOSAL
}

const DIY_PROHIBITED_WORDS = [
  "diy",
  "self-made",
  "selfmade",
  "homemade",
  "home-made",
  "do-it-yourself",
  "fai-da-te",
  "auto-costruito",
  "auto-costruita",
  "autocostruito",
  "autocostruita"
];

const OWN_INSTANCE_PROHIBITED_WORDS = [
  // English
  "modified",
  "modded",
  "mod",
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
  "stock",

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
  form: FormGroup;

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
    public readonly formlyFieldService: FormlyFieldService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  ngAfterViewInit(): void {
    this.utilsService.delay(100).subscribe(() => {
      const document = this.windowRefService.nativeWindow.document;
      const element = document.querySelector("#equipment-item-field-brand .ng-input input") as HTMLElement;

      if (!!element) {
        element.focus();
      }
    });
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

    this.fields.find(field => field.key === "brand").templateOptions.options = of([
      {
        value: brand.id,
        label: brand.name,
        brand
      }
    ]);
    this.model = { ...this.model, ...{ brand: brand.id } };
    this.form.controls.brand.setValue(brand.id);
    this.brandCreation.name = brand.name;
    this.endBrandCreation();

    if (this.returnToSelector) {
      this.windowRefService.scrollToElement(this.returnToSelector);
    }
  }

  initBrandAndName(): Observable<void> {
    return new Observable<void>(observer => {
      if (this.name) {
        const words = this.name.split(" ");

        // Attempt to get the brand from the first n words.
        for (let n = words.length; n > 0; n--) {
          const attemptedBrandName = words.slice(0, n).join(" ");
          this.actions$
            .pipe(
              ofType(EquipmentActionTypes.FIND_ALL_BRANDS_SUCCESS),
              take(1),
              map((action: FindAllBrandsSuccess) => action.payload.brands)
            )
            .subscribe(brands => {
              if (brands.length > 0) {
                const pattern = brands[0].name;
                const re = new RegExp(pattern, "gi");
                const string = this.name;
                const replaced = string.replace(re, "");

                this.model = {
                  ...this.model,
                  ...{
                    brand: brands[0].id,
                    name: replaced.trim()
                  }
                };
              }

              observer.next();
              observer.complete();
            });
          this.store$.dispatch(new FindAllBrands({ q: attemptedBrandName }));
        }
      } else {
        observer.next();
        observer.complete();
      }
    });
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
                  const informationModalRef: NgbModalRef = this.modalService.open(InformationDialogComponent);
                  const informationModalInstance: InformationDialogComponent = informationModalRef.componentInstance;

                  informationModalInstance.message = this.translateService.instant(
                    "Marking an item as DIY (i.e. self-made) means that you, or someone on your behalf, actually " +
                      "made this equipment item, and it's something unique that other people literally cannot " +
                      "obtain. This item will not be available to others to add to their images."
                  );

                  informationModalRef.closed.pipe(take(1)).subscribe(() => {
                    this.model.brand = null;
                    this.form.get("brand").setValue(null);
                  });
                }

                this.form.get("name").updateValueAndValidity({ emitEvent: false });
              })
            )
            .subscribe();
        }
      }
    };
  }

  protected _getBrandField(label?: string) {
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
        label: label
          ? label
          : `${this.translateService.instant("Brand")} / ${this.translateService.instant("Company")}`,
        fullScreenLabel: label
          ? label
          : `${this.translateService.instant("Brand")} / ${this.translateService.instant("Company")}`,
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
        enableFullscreen: true,
        onSearch: (term: string): Observable<any[]> => {
          return this._onBrandSearch(term);
        },
        optionTemplate: this.brandOptionTemplate,
        addTag: () => {
          this.startBrandCreation();
          this.form.get("brand").setValue(null);
          this.windowRefService.scrollToElement("#create-new-brand");
        },
        striped: true
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges
            .pipe(
              takeUntil(this.destroyed$),
              startWith(this.model.brand),
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

                      field.templateOptions.options = of([
                        {
                          value: brand.id,
                          label: brand.name,
                          brand
                        }
                      ]);

                      this.formlyFieldService.clearMessages(this.fields.find(f => f.key === "name").templateOptions);
                      this._validateCanonAndCentralDS();
                      this._similarItemSuggestion();
                      this._othersInBrand(brand.name);

                      this.form.get("name").updateValueAndValidity({ emitEvent: false });

                      if (!!this.form.get("variantOf")) {
                        this.form.get("variantOf").updateValueAndValidity({ emitEvent: false });
                      }
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
        "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress,
        "templateOptions.label": () =>
          this.model.diy
            ? this.equipmentItemService.getPrintablePropertyName(null, EquipmentItemDisplayProperty.NAME, true)
            : this.equipmentItemService.getPrintablePropertyName(null, EquipmentItemDisplayProperty.NAME, false),
        "templateOptions.description": () =>
          this.model.diy
            ? null
            : this.translateService.instant(
                "The name of this product. Do not include the brand's name and make sure it's spelled correctly."
              ) +
              " " +
              this.translateService.instant("Try to use the official product name in English, if applicable.")
      },
      templateOptions: {
        required: true
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges

            .pipe(
              takeUntil(this.destroyed$),
              startWith(this.name),
              filter(value => !!value),
              debounceTime(500),
              distinctUntilChanged(),
              tap((value: string) => {
                this.formlyFieldService.clearMessages(field.templateOptions);
                if (this.fields.find(f => f.key === "brand")) {
                  this.formlyFieldService.clearMessages(this.fields.find(f => f.key === "brand").templateOptions);
                }
                this._validateCanonAndCentralDS();
                this._similarItemSuggestion();
                this._editProposalWarning(field);
                this._customNameChangesValidations(field, value);
              })
            )
            .subscribe();
        }
      },
      asyncValidators: {
        brandInName: {
          expression: (control: FormControl) => {
            const brandControl: AbstractControl = this.form.get("brand");

            if (!control.value || !brandControl?.value) {
              return of(true);
            }

            this.store$.dispatch(new LoadBrand({ id: brandControl.value }));

            return this.store$.select(selectBrand, brandControl.value).pipe(
              filter(brand => !!brand),
              take(1),
              map((brand: BrandInterface) => control.value.toLowerCase().indexOf(brand.name.toLowerCase()) === -1)
            );
          },
          message: this.translateService.instant("Do not repeat the brand's name in the item's name.")
        },
        uniqueForBrand: {
          expression: (control: FormControl) => {
            const type: EquipmentItemType = this.equipmentItemService.getType({
              ...this.model,
              ...this.form.value
            } as EquipmentItemBaseInterface);

            if (!this.model.brand || !control.value) {
              return of(true);
            }

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
            if (!control.value) {
              return of(true);
            }

            for (const word of DIY_PROHIBITED_WORDS) {
              if (new RegExp(`\\b${word}\\b`).test(control.value.toLowerCase())) {
                return of(false);
              }
            }

            for (const word of OWN_INSTANCE_PROHIBITED_WORDS) {
              if (new RegExp(`\\b${word}\\b`).test(control.value.toLowerCase())) {
                return of(false);
              }
            }

            return of(true);
          },
          message: (error, field: FormlyFieldConfig) => {
            for (const word of OWN_INSTANCE_PROHIBITED_WORDS) {
              if (new RegExp(`\\b${word}\\b`).test(field.formControl.value.toLowerCase())) {
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

            for (const word of DIY_PROHIBITED_WORDS) {
              if (new RegExp(`\\b${word}\\b`).test(field.formControl.value.toLowerCase())) {
                const label = this.translateService.instant("Self-made / non-commercial (no brand)");
                return this.translateService.instant(
                  `You don't need to use the word "{{0}}", as this meaning is already conveyed by clicking on ` +
                    `the checkbox above: "{{1}}".`,
                  {
                    "0": word,
                    "1": label
                  }
                );
              }
            }
          }
        }
      }
    };
  }

  protected _getCommunityNotesField(): any {
    return {
      key: "communityNotes",
      type: "ckeditor",
      wrappers: ["default-wrapper"],
      id: "community-notes",
      templateOptions: {
        label: this.equipmentItemService.getPrintablePropertyName(null, EquipmentItemDisplayProperty.COMMUNITY_NOTES),
        description: this.translateService.instant(
          "This section can be used as a community page to share information about this item that doesn't fit " +
            "the available data fields. Please use English and do not include any personal information or anecdotes."
        ),
        required: false
      }
    };
  }

  protected _getVariantOfField(itemType: EquipmentItemType) {
    return {
      key: "variantOf",
      type: "equipment-item-browser",
      id: "equipment-item-field-variant-of",
      hideExpression: () =>
        !!this.model.diy ||
        !this.model.brand ||
        (this.model.klass === EquipmentItemType.CAMERA &&
          ((this.model as unknown) as CameraInterface).type === CameraType.DSLR_MIRRORLESS),
      expressionProperties: {
        "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      templateOptions: {
        label: this.equipmentItemService.getPrintablePropertyName(itemType, EquipmentItemDisplayProperty.VARIANT_OF),
        description: this.translateService.instant(
          "If this item is a variant of another product, please select it here. This is typically used for " +
            "products that have multiple versions (e.g. filter size, filter wheel size and number of slots, software " +
            "versions...) and AstroBin will use this information to group certain pieces of data (e.g. search results)."
        ),
        itemType,
        showQuickAddRecent: false,
        showPlaceholderImage: false,
        required: false,
        multiple: false,
        enableCreation: false,
        enableVariantSelection: false,
        excludeId: this.model.id
      },
      asyncValidators: {
        sameBrand: {
          expression: (control: FormControl) => {
            if (!control.value) {
              return of(true);
            }

            const payload = { id: control.value, type: itemType };
            this.store$.dispatch(new LoadEquipmentItem(payload));
            return this.store$.select(selectEquipmentItem, payload).pipe(
              filter(variantOf => !!variantOf),
              take(1),
              map(variantOf => variantOf.brand === this.model.brand)
            );
          },
          message: this.translateService.instant(
            `The "Variant of" field must be an item with the same brand as this one.`
          )
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

  protected _onBrandSearch(q: string): Observable<any[]> {
    return new Observable<any[]>(observer => {
      this.brandCreation.name = q;

      if (!q) {
        observer.next();
        observer.complete();
        return;
      }

      const field = this.fields.find(f => f.key === "brand");

      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.FIND_ALL_BRANDS_SUCCESS),
          take(1),
          map((action: FindAllBrandsSuccess) => action.payload.brands),
          map(brands =>
            brands.map(brand => ({
              value: brand.id,
              label: brand.name,
              brand
            }))
          )
        )
        .subscribe(options => {
          field.templateOptions.options = of(options);
          observer.next(options);
          observer.complete();
        });

      this.store$.dispatch(new FindAllBrands({ q }));
    });
  }

  protected _customNameChangesValidations(field: FormlyFieldConfig, value: string) {
    // Override this method in editor components to perform actions when the name changes.
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

  private _othersInBrand(name: string) {
    const brandControl: AbstractControl = this.form.get("brand");
    const brandFieldConfig: FormlyFieldConfig = this.fields.find(field => field.key === "brand");
    const type: EquipmentItemType = this.equipmentItemService.getType({ ...this.model, ...this.form.value });

    if (!type || !brandControl?.value) {
      return;
    }

    this.store$.dispatch(new GetOthersInBrand({ brand: brandControl.value, type, name }));
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

  private _validateCanonAndCentralDS() {
    const brandControl: AbstractControl = this.form.get("brand");
    const nameControl: AbstractControl = this.form.get("name");
    const nameFieldConfig: FormlyFieldConfig = this.fields.find(field => field.key === "name");
    const message = this.translateService.instant(
      "<strong>Careful!</strong> {{0}} is a separate brand on AstroBin, so you probably want to select it as a brand.",
      {
        0: "CentralDS"
      }
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
        if (
          brand.name === "Canon" &&
          (nameControl.value.toLowerCase().indexOf("centralds") > -1 ||
            nameControl.value.toLowerCase().indexOf("central ds") > -1)
        ) {
          this.formlyFieldService.addMessage(nameFieldConfig.templateOptions, {
            level: FormlyFieldMessageLevel.WARNING,
            text: message
          });
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
