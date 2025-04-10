import {
  AfterViewInit,
  ChangeDetectorRef,
  OnInit,
  TemplateRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { EquipmentItemService, EquipmentItemDisplayProperty } from "@core/services/equipment-item.service";
import { FormlyFieldService, FormlyFieldMessageLevel } from "@core/services/formly-field.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import {
  CreateBrand,
  EquipmentActionTypes,
  FindAllBrands,
  FindSimilarInBrand,
  GetOthersInBrand,
  LoadBrand,
  LoadEquipmentItem,
  CreateBrandSuccess,
  FindAllBrandsSuccess,
  FindSimilarInBrandSuccess,
  GetOthersInBrandSuccess
} from "@features/equipment/store/equipment.actions";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { CameraType, CameraInterface } from "@features/equipment/types/camera.interface";
import { EquipmentItemType, EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ofType, Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { InformationDialogComponent } from "@shared/components/misc/information-dialog/information-dialog.component";
import { EMPTY, Observable, of } from "rxjs";
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

export enum EquipmentItemEditorMode {
  CREATION = "CREATION",
  EDIT_PROPOSAL = "EDIT_PROPOSAL"
}

export interface AsyncValidator {
  expression: (control: FormControl) => Promise<boolean> | Observable<boolean>;
  message: string | ((error: any, field: FormlyFieldConfig) => string);
}

export interface AsyncValidatorsMap {
  [key: string]: AsyncValidator;
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
  implements OnInit, AfterViewInit
{
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

  options: FormlyFormOptions = {
    formState: {
      brandCreation: {
        inProgress: false,
        form: new FormGroup({}),
        model: {},
        name: null
      },
      subCreation: {
        inProgress: false,
        form: new FormGroup({}),
        model: {},
        name: null
      },
      editorMode: null
    }
  };

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly sanitizer: DomSanitizer
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.options.formState.editorMode = this.editorMode;
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
    this.options.formState.brandCreation.inProgress = true;
    this.subCreationInProgress.emit(true);
  }

  endBrandCreation() {
    this.options.formState.brandCreation.inProgress = false;
    this.subCreationInProgress.emit(false);
    this.options.formState.brandCreation.model = {};
    this.options.formState.brandCreation.form.reset();
  }

  createBrand() {
    const { id, ...brand } = this.options.formState.brandCreation.form.value;
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

    const brandField = this.fields.find(field => field.key === "brand");

    brandField.props = {
      ...brandField.props,
      options: of([
        {
          value: brand.id,
          label: brand.name,
          brand
        }
      ])
    };

    this.model = { ...this.model, ...{ brand: brand.id } };
    this.form.controls.brand.setValue(brand.id);
    this.options.formState.brandCreation.name = brand.name;
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
      expressions: {
        "props.disabled":
          "formState.subCreation.inProgress || formState.brandCreation.inProgress ||formState.editorMode === 'EDIT_PROPOSAL'"
      },
      defaultValue: false,
      props: {
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
      expressions: {
        "props.disabled":
          "formState.subCreation.inProgress || formState.brandCreation.inProgress || formState.editorMode === 'EDIT_PROPOSAL' || model.diy",
        "props.required": "!model.diy"
      },
      props: {
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
                this.formlyFieldService.clearMessages(field, "brandField");

                if (!!value && this.form.get("name").value) {
                  this.form.get("name").markAsTouched();
                }
              }),
              switchMap((value: BrandInterface["id"]) => {
                if (!!value) {
                  return this.equipmentApiService.getBrand(value).pipe(
                    tap((brand: BrandInterface) => {
                      this.options.formState.brandCreation.name = brand.name;

                      field.props = {
                        ...field.props,
                        options: of([
                          {
                            value: brand.id,
                            label: brand.name,
                            brand
                          }
                        ])
                      };

                      this.formlyFieldService.clearMessages(
                        this.fields.find(f => f.key === "name"),
                        "brandChange"
                      );
                      this._validateCanonAndCentralDS();
                      this._similarItemSuggestion();
                      this._othersInBrand(brand.name);
                      this._customNameChangesValidations(field, this.model.name);

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

  protected _getNameField(additionalAsyncValidators?: AsyncValidatorsMap): FormlyFieldConfig {
    const defaultAsyncValidators: AsyncValidatorsMap = {
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

          return this.equipmentApiService
            .getByBrandAndName(type, this.model.brand, control.value, {
              allowUnapproved: true
            })
            .pipe(
              map(item => {
                const nameField = this.fields.find(field => field.key === "name");

                // Clear any existing messages first
                if (nameField) {
                  this.formlyFieldService.clearMessages(nameField, "uniqueForBrand");
                }

                // If we found an item, check if it's unapproved and add a special message
                if (item && !item.reviewerDecision) {
                  if (nameField) {
                    // Create a mailto link
                    const subject = encodeURIComponent(
                      `Review request for unapproved ${item.klass}: ${item.brandName || ""} ${item.name}`
                    );
                    const emailLink = `<a href="mailto:support@astrobin.com?subject=${subject}">support@astrobin.com</a>`;
                    const messageText = this.translateService.instant(
                      "Unapproved duplicate exists. Please email {{0}} to request an expedited review.",
                      { 0: emailLink }
                    );

                    const message = {
                      scope: "uniqueForBrand",
                      level: FormlyFieldMessageLevel.WARNING,
                      text: this.sanitizer.bypassSecurityTrustHtml(messageText) as string
                    };

                    this.formlyFieldService.addMessage(nameField, message);
                  }
                }

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
    };

    const asyncValidators = {
      ...defaultAsyncValidators,
      ...additionalAsyncValidators
    };

    return {
      key: "name",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "equipment-item-field-name",
      defaultValue: this.name,
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress",
        "props.label": () =>
          this.model.diy
            ? this.equipmentItemService.getPrintablePropertyName(null, EquipmentItemDisplayProperty.NAME, true)
            : this.equipmentItemService.getPrintablePropertyName(null, EquipmentItemDisplayProperty.NAME, false),
        "props.description": () =>
          this.model.diy
            ? null
            : this.translateService.instant(
                "The name of this product. Do not include the brand's name and make sure it's spelled correctly."
              ) +
              " " +
              this.translateService.instant("Try to use the official product name in English, if applicable.")
      },
      props: {
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
                this.formlyFieldService.clearMessages(field, "nameChange");
                if (this.fields.find(f => f.key === "brand")) {
                  this.formlyFieldService.clearMessages(
                    this.fields.find(f => f.key === "brand"),
                    "nameChange"
                  );
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
      asyncValidators
    };
  }

  protected _getCommunityNotesField(): any {
    return {
      key: "communityNotes",
      type: "ckeditor",
      wrappers: ["default-wrapper"],
      id: "community-notes",
      props: {
        label: this.equipmentItemService.getPrintablePropertyName(null, EquipmentItemDisplayProperty.COMMUNITY_NOTES),
        description: this.translateService.instant(
          "This section can be used as a community page to share information about this item that doesn't fit " +
            "the available data fields. Please use English and do not include any personal information or anecdotes."
        ),
        required: false
      }
    };
  }

  protected _getVariantOfField(itemType: EquipmentItemType, isModerator: boolean): FormlyFieldConfig {
    return {
      key: "variantOf",
      type: "equipment-item-browser",
      id: "equipment-item-field-variant-of",
      hideExpression: () =>
        !isModerator ||
        !!this.model.diy ||
        !this.model.brand ||
        (this.model.klass === EquipmentItemType.CAMERA &&
          (this.model as unknown as CameraInterface).type === CameraType.DSLR_MIRRORLESS),
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        label: this.equipmentItemService.getPrintablePropertyName(itemType, EquipmentItemDisplayProperty.VARIANT_OF),
        description: this.translateService.instant(
          "If this item is a variant of another product, please select it here. This is typically used for " +
            "products that have multiple versions (e.g. filter size, filter wheel size and number of slots, software " +
            "versions...) and AstroBin will use this information to group certain pieces of data (e.g. search results)."
        ),
        itemType,
        quickAddRecentFromUserId: null,
        showPlaceholderImage: false,
        required: false,
        multiple: false,
        enableCreation: false,
        enableVariantSelection: false,
        excludeId: this.model.id,
        componentId: this.componentId
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
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
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
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        required: false,
        label: this.translateService.instant("Image"),
        description: this.translateService.instant("Official (or official looking) product image. Max. 1MB."),
        accept: "image/jpeg, image/png",
        image: true
      },

      validators: {
        validation: [{ name: "file-size", options: { max: 1024 * 1024 } }, { name: "image-or-video-file" }]
      }
    };
  }

  protected _getEditProposalCommentField() {
    return {
      key: "editProposalComment",
      type: "textarea",
      wrappers: ["default-wrapper"],
      id: "equipment-item-field-edit-proposal-comment",
      props: {
        required: false,
        label: this.translateService.instant("Edit proposal comment")
      }
    };
  }

  protected _addBaseItemEditorFields() {
    if (this.editorMode === EquipmentItemEditorMode.EDIT_PROPOSAL) {
      this.fields.push(this._getEditProposalCommentField());
    }

    // _addBaseItemEditorFields is called last by all sub-class editor, which triggers detecting that fields have been
    // set.
    this.changeDetectorRef.detectChanges();
  }

  protected _onBrandSearch(q: string): Observable<any[]> {
    return new Observable<any[]>(observer => {
      this.options.formState.brandCreation.name = q;

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
          field.props = {
            ...field.props,
            options: of(options)
          };
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

          this.formlyFieldService.addMessage(nameFieldConfig, {
            scope: "similarItems",
            level: FormlyFieldMessageLevel.WARNING,
            template,
            data
          });
        } else {
          this.formlyFieldService.clearMessages(nameFieldConfig, "similarItems");
        }
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
          this.formlyFieldService.addMessage(brandFieldConfig, {
            scope: "othersInBrand",
            level: FormlyFieldMessageLevel.INFO,
            template,
            data
          });
        } else {
          this.formlyFieldService.clearMessages(brandFieldConfig, "othersInBrand");
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
          this.formlyFieldService.addMessage(nameFieldConfig, {
            scope: "canonCentralDS",
            level: FormlyFieldMessageLevel.WARNING,
            text: message
          });
        } else {
          this.formlyFieldService.clearMessages(nameFieldConfig, "canonCentralDS");
        }
      });
  }

  private _editProposalWarning(field: FormlyFieldConfig) {
    if (this.editorMode !== EquipmentItemEditorMode.EDIT_PROPOSAL) {
      return;
    }

    const message = this.equipmentItemService.nameChangeWarningMessage();

    this.formlyFieldService.addMessage(field, {
      scope: "editProposalWarning",
      level: FormlyFieldMessageLevel.WARNING,
      text: message
    });
  }
}
