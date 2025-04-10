import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  OnDestroy,
  OnInit,
  TemplateRef,
  Component,
  HostListener,
  Inject,
  PLATFORM_ID,
  ViewChild
} from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { SaveImage } from "@app/store/actions/image.actions";
import { LoadThumbnail } from "@app/store/actions/thumbnail.actions";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { DeepSkyAcquisitionInterface } from "@core/interfaces/deep-sky-acquisition.interface";
import { SolarSystemAcquisitionInterface } from "@core/interfaces/solar-system-acquisition.interface";
import { RemoteSourceAffiliateApiService } from "@core/services/api/classic/remote-source-affiliation/remote-source-affiliate-api.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { DeviceService } from "@core/services/device.service";
import { ComponentCanDeactivate } from "@core/services/guards/pending-changes-guard.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TitleService } from "@core/services/title/title.service";
import { UserService } from "@core/services/user.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import {
  LoadEquipmentItemFailure,
  EquipmentActionTypes,
  FindEquipmentPresets,
  ItemBrowserSet,
  LoadEquipmentItem,
  LoadEquipmentItemSuccess
} from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem, selectEquipmentPresets } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { CopyAcquisitionSessionsFromAnotherImageModalComponent } from "@features/image/components/copy-acquisition-sessions-from-another-image-modal/copy-acquisition-sessions-from-another-image-modal.component";
import { ImportAcquisitionsFromCsvFormModalComponent } from "@features/image/components/import-acquisitions-from-csv-form-modal/import-acquisitions-from-csv-form-modal.component";
import {
  AcquisitionForm,
  OverrideAcquisitionFormModalComponent
} from "@features/image/components/override-acquisition-form-modal/override-acquisition-form-modal.component";
import { SaveEquipmentPresetModalComponent } from "@features/image/components/save-equipment-preset-modal/save-equipment-preset-modal.component";
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";
import { ImageEditBasicFieldsService } from "@features/image/services/image-edit-basic-fields.service";
import { ImageEditContentFieldsService } from "@features/image/services/image-edit-content-fields.service";
import { ImageEditEquipmentFieldsService } from "@features/image/services/image-edit-equipment-fields.service";
import { ImageEditSettingsFieldsService } from "@features/image/services/image-edit-settings-fields.service";
import { ImageEditThumbnailFieldsService } from "@features/image/services/image-edit-thumbnail-fields.service";
import { ImageEditWatermarkFieldsService } from "@features/image/services/image-edit-watermark-fields.service";
import { ImageEditModelInterface, ImageEditService } from "@features/image/services/image-edit.service";
import { ImageEditorSetCropperShown } from "@features/image/store/image.actions";
import { NgbModal, NgbModalRef, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { Constants } from "@shared/constants";
import { CookieService } from "ngx-cookie";
import { Observable, forkJoin, of, switchMap } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-image-edit-page",
  templateUrl: "./image-edit-page.component.html",
  styleUrls: ["./image-edit-page.component.scss"]
})
export class ImageEditPageComponent
  extends BaseComponentDirective
  implements OnInit, ComponentCanDeactivate, AfterViewInit, OnDestroy
{
  readonly Constants = Constants;

  readonly isBrowser: boolean;

  ImageAlias = ImageAlias;

  @ViewChild("stepperButtonsTemplate")
  stepperButtonsTemplate: TemplateRef<any>;

  @ViewChild("equipmentStepPreambleTemplate")
  equipmentStepPreambleTemplate: TemplateRef<any>;

  @ViewChild("equipmentStepButtonsTemplate")
  equipmentStepButtonsTemplate: TemplateRef<any>;

  @ViewChild("acquisitionFilterSelectFooterTemplateExtra")
  acquisitionFilterSelectFooterTemplateExtra: TemplateRef<any>;

  @ViewChild("acquisitionAdditionalButtonsTemplate")
  acquisitionAdditionalButtonsTemplate: TemplateRef<any>;

  @ViewChild("presetCreateOffcanvas")
  presetCreateOffcanvas: TemplateRef<any>;

  editingExistingImage: boolean;

  private _returnUrl: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly route: ActivatedRoute,
    public readonly router: Router,
    public readonly translateService: TranslateService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService,
    public readonly remoteSourceAffiliateApiService: RemoteSourceAffiliateApiService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly imageEditService: ImageEditService,
    public readonly imageEditBasicFieldsService: ImageEditBasicFieldsService,
    public readonly imageEditContentFieldsService: ImageEditContentFieldsService,
    public readonly imageEditWatermarkFieldsService: ImageEditWatermarkFieldsService,
    public readonly imageEditThumbnailFieldsService: ImageEditThumbnailFieldsService,
    public readonly imageEditEquipmentFieldsService: ImageEditEquipmentFieldsService,
    public readonly imageEditAcquisitionFieldsService: ImageEditAcquisitionFieldsService,
    public readonly imageEditSettingsFieldsService: ImageEditSettingsFieldsService,
    public readonly modalService: NgbModal,
    public readonly userService: UserService,
    public readonly cookieService: CookieService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService
  ) {
    super(store$);

    this.isBrowser = isPlatformBrowser(this.platformId);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        take(1)
      )
      .subscribe(() => {
        const state = this.router.getCurrentNavigation()?.extras?.state;
        if (state) {
          this._returnUrl = state["returnUrl"];
        }
      });
  }

  @ViewChild("remoteSourceLabelTemplate")
  set remoteSourceLabelTemplate(template: TemplateRef<any>) {
    this.imageEditService.remoteSourceLabelTemplate = template;
  }

  @ViewChild("remoteSourceOptionTemplate")
  set remoteSourceOptionTemplate(template: TemplateRef<any>) {
    this.imageEditService.remoteSourceOptionTemplate = template;
  }

  get presets$(): Observable<EquipmentPresetInterface[]> {
    return this.store$.select(selectEquipmentPresets).pipe(takeUntil(this.destroyed$));
  }

  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    return this.imageEditService.form.pristine;
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === "Escape" && this.imageEditEquipmentFieldsService.creationMode) {
      const fullscreenModal =
        isPlatformBrowser(this.platformId) &&
        this.windowRefService.nativeWindow.document.querySelector(".equipment-item-browser-fullscreen-modal");

      // Don't handle Escape if we're in fullscreen mode (let the ItemBrowserComponent handle it)
      if (!fullscreenModal) {
        this.promptToExitEquipmentItemCreationMode();
        event.preventDefault();
      }
    }
  }

  ngOnInit(): void {
    super.ngOnInit();

    const image = this.route.snapshot.data.image;
    this.imageEditService.model = image;

    let overrideAcquisitionForm = null;

    if (image.deepSkyAcquisitions?.length > 0) {
      overrideAcquisitionForm = AcquisitionForm.LONG_EXPOSURE;
    } else if (image.solarSystemAcquisitions?.length > 0) {
      overrideAcquisitionForm = AcquisitionForm.VIDEO_BASED;
    }

    this.imageEditService.model = {
      ...image,
      ...{
        imagingTelescopes2: image.imagingTelescopes2.map(x => x.id),
        imagingCameras2: image.imagingCameras2.map(x => x.id),
        mounts2: image.mounts2.map(x => x.id),
        filters2: image.filters2.map(x => x.id),
        accessories2: image.accessories2.map(x => x.id),
        software2: image.software2.map(x => x.id),
        guidingTelescopes2: image.guidingTelescopes2.map(x => x.id),
        guidingCameras2: image.guidingCameras2.map(x => x.id)
      },
      overrideAcquisitionForm: overrideAcquisitionForm
    };

    this.imageEditService.groups = this.route.snapshot.data.groups;
    this.imageEditService.collections = this.route.snapshot.data.collections;
    this.imageEditService.locations = this.route.snapshot.data.locations;

    this.editingExistingImage = !!this.imageEditService.model.subjectType;

    this.titleService.setTitle("Edit image");

    this._initBreadcrumb();

    this.store$.dispatch(new LoadUser({ id: this.imageEditService.model.user }));

    this.store$.dispatch(
      new LoadThumbnail({
        data: { id: this.imageEditService.model.pk, revision: "0", alias: ImageAlias.HD },
        bustCache: false
      })
    );

    this.store$.dispatch(new FindEquipmentPresets({ userId: this.imageEditService.model.user }));

    this.route.fragment.pipe(takeUntil(this.destroyed$)).subscribe((fragment: string) => {
      if (fragment === "3") {
        this.store$.dispatch(new ImageEditorSetCropperShown(true));
      }
    });
  }

  ngAfterViewInit(): void {
    this.imageEditAcquisitionFieldsService.acquisitionFilterSelectFooterTemplateExtra =
      this.acquisitionFilterSelectFooterTemplateExtra;
    this.imageEditAcquisitionFieldsService.acquisitionAdditionalButtonsTemplate =
      this.acquisitionAdditionalButtonsTemplate;

    if (this.isBrowser) {
      this.remoteSourceAffiliateApiService.getAll().subscribe(remoteSourceAffiliates => {
        this.imageEditService.remoteSourceAffiliates = remoteSourceAffiliates;
        this._initFields();
      });
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this._destroyFields();
  }

  clearEquipment() {
    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.TELESCOPE,
        usageType: EquipmentItemUsageType.IMAGING,
        items: [],
        componentId: this.componentId
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.CAMERA,
        usageType: EquipmentItemUsageType.IMAGING,
        items: [],
        componentId: this.componentId
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.MOUNT,
        items: [],
        componentId: this.componentId
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.FILTER,
        items: [],
        componentId: this.componentId
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.ACCESSORY,
        items: [],
        componentId: this.componentId
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.SOFTWARE,
        items: [],
        componentId: this.componentId
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.TELESCOPE,
        usageType: EquipmentItemUsageType.GUIDING,
        items: [],
        componentId: this.componentId
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.CAMERA,
        usageType: EquipmentItemUsageType.GUIDING,
        items: [],
        componentId: this.componentId
      })
    );
  }

  onClearEquipmentClicked() {
    if (this.imageEditService.hasEquipmentItems()) {
      this.modalService
        .open(ConfirmationDialogComponent)
        .closed.pipe(take(1))
        .subscribe(() => {
          this.clearEquipment();
        });
    }
  }

  onPresetClicked(preset: EquipmentPresetInterface) {
    this.imageEditService.loadEquipmentPreset(preset, this.componentId).subscribe();
  }

  onSaveEquipmentPresetClicked(cb?: () => void) {
    if (this.imageEditService.hasEquipmentItems()) {
      this.imageEditService
        .currentEquipmentPreset$()
        .pipe(take(1))
        .subscribe(currentEquipmentPreset => {
          const modalRef: NgbModalRef = this.modalService.open(SaveEquipmentPresetModalComponent);
          const componentInstance: SaveEquipmentPresetModalComponent = modalRef.componentInstance;

          componentInstance.initialPreset = {
            name: !!currentEquipmentPreset ? currentEquipmentPreset.name : "",
            description: "",
            imagingTelescopes: this.imageEditService.model.imagingTelescopes2,
            guidingTelescopes: this.imageEditService.model.guidingTelescopes2,
            imagingCameras: this.imageEditService.model.imagingCameras2,
            guidingCameras: this.imageEditService.model.guidingCameras2,
            mounts: this.imageEditService.model.mounts2,
            filters: this.imageEditService.model.filters2,
            accessories: this.imageEditService.model.accessories2,
            software: this.imageEditService.model.software2
          };

          if (!!currentEquipmentPreset) {
            componentInstance.model.name = currentEquipmentPreset.name;
          }

          modalRef.closed.pipe(take(1)).subscribe(() => {
            if (!!cb) {
              cb();
            }
          });
        });
    }
  }

  onCopyAcquisitionSessionsFromAnotherImageClicked(event: Event) {
    if (event) {
      event.preventDefault();
    }

    const modalRef: NgbModalRef = this.modalService.open(CopyAcquisitionSessionsFromAnotherImageModalComponent);
    const componentInstance: CopyAcquisitionSessionsFromAnotherImageModalComponent = modalRef.componentInstance;

    componentInstance.alreadyHasAcquisitions =
      this.imageEditService.hasDeepSkyAcquisitions() || this.imageEditService.hasSolarSystemAcquisitions();

    componentInstance.editPageComponentId = this.componentId;
  }

  onImportFromCsvClicked(event: Event) {
    if (event) {
      event.preventDefault();
    }

    const _setModel = (acquisitions: any[]): void => {
      if (this.imageEditService.isLongExposure()) {
        this.imageEditService.form.patchValue({ deepSkyAcquisitions: acquisitions });
        this.imageEditService.model = {
          ...this.imageEditService.model,
          deepSkyAcquisitions: acquisitions as DeepSkyAcquisitionInterface[]
        };
      } else {
        this.imageEditService.form.patchValue({ solarSystemAcquisitions: acquisitions });
        this.imageEditService.model = {
          ...this.imageEditService.model,
          solarSystemAcquisitions: acquisitions as SolarSystemAcquisitionInterface[]
        };
      }
    };

    const _fixNumbers = (acquisitions: any[]): void => {
      acquisitions.forEach(acquisition => {
        Object.keys(acquisition).forEach(key => {
          const value = acquisition[key];
          acquisition[key] = UtilsService.isString(value) && UtilsService.isNumeric(value) ? +value : value;
        });
      });
    };

    const _fixFilters = (acquisitions: any[]): void => {
      acquisitions.forEach(acquisition => {
        if (acquisition.filter !== undefined) {
          acquisition["filter2"] = acquisition.filter;
          delete acquisition.filter;
        }
      });
    };

    const _loadFilters$ = (acquisitions: any[]): Observable<FilterInterface[]> => {
      const filterIds: FilterInterface["id"][] = acquisitions
        .filter(acquisition => acquisition["filter2"] !== undefined)
        .map(acquisition => acquisition["filter2"]);

      if (filterIds.length === 0) {
        return of([]);
      } else {
        const observables: Observable<FilterInterface>[] = filterIds.map(id => {
          const payload = { type: EquipmentItemType.FILTER, id };
          return this.actions$.pipe(
            ofType(EquipmentActionTypes.LOAD_EQUIPMENT_ITEM_SUCCESS, EquipmentActionTypes.LOAD_EQUIPMENT_ITEM_FAILURE),
            map((action: LoadEquipmentItemSuccess | LoadEquipmentItemFailure) => {
              if (action instanceof LoadEquipmentItemSuccess) {
                return action.payload.item as FilterInterface;
              } else {
                this.popNotificationsService.warning(
                  this.translateService.instant("Filter with id {{id}} could not be found.", { id: action.payload.id })
                );
                return null;
              }
            }),
            filter(filter => filter === null || (filter.id === payload.id && filter.klass === payload.type)),
            take(1)
          );
        });

        this.utilsService.delay(1).subscribe(() => {
          filterIds.forEach(id => {
            const payload = { type: EquipmentItemType.FILTER, id };
            this.store$.dispatch(new LoadEquipmentItem(payload));
          });
        });

        return forkJoin(observables);
      }
    };

    const startImport = () => {
      const modalRef: NgbModalRef = this.modalService.open(ImportAcquisitionsFromCsvFormModalComponent, { size: "lg" });
      modalRef.closed.subscribe(csv => {
        const acquisitions: any[] = UtilsService.csvToArrayOfDictionaries(csv);

        this.loadingService.setLoading(true);

        // Additional cleanup - remove any empty objects
        const validAcquisitions = acquisitions.filter(acq => Object.keys(acq).length > 0);

        _fixNumbers(validAcquisitions);
        _fixFilters(validAcquisitions);
        _loadFilters$(validAcquisitions).subscribe(filters => {
          filters.forEach(filter => {
            if (filter !== null) {
              this.imageEditService.model.filters2.push(filter.id);
              this.imageEditService.form.patchValue({ filters2: this.imageEditService.model.filters2 });
            }
          });

          _setModel(validAcquisitions);
          this.loadingService.setLoading(false);
        });
      });
    };

    if (this.imageEditService.hasDeepSkyAcquisitions() || this.imageEditService.hasSolarSystemAcquisitions()) {
      const confirmationDialog: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
      const componentInstance: ConfirmationDialogComponent = confirmationDialog.componentInstance;

      componentInstance.message = this.translateService.instant(
        "You are about to remove all acquisition sessions you have entered thus far."
      );

      confirmationDialog.closed.pipe(take(1)).subscribe(() => {
        startImport();
      });
    } else {
      startImport();
    }
  }

  onOverrideAcquisitionFormClicked(event: Event) {
    if (event) {
      event.preventDefault();
    }

    const modalRef: NgbModalRef = this.modalService.open(OverrideAcquisitionFormModalComponent);
    const componentInstance: OverrideAcquisitionFormModalComponent = modalRef.componentInstance;

    componentInstance.model = {
      acquisitionForm: this.imageEditService.model.overrideAcquisitionForm
    };

    if (!componentInstance.model.acquisitionForm) {
      componentInstance.model = {
        acquisitionForm: this.imageEditService.isDeepSky() ? AcquisitionForm.LONG_EXPOSURE : AcquisitionForm.VIDEO_BASED
      };
    }

    modalRef.closed.subscribe(acquisitionForm => {
      const clearModel = () => {
        this.imageEditService.model = {
          ...this.imageEditService.model,
          deepSkyAcquisitions: [],
          solarSystemAcquisitions: [],
          overrideAcquisitionForm: acquisitionForm
        };
      };
      if (
        this.imageEditService.model.deepSkyAcquisitions?.length > 0 ||
        this.imageEditService.model.solarSystemAcquisitions?.length > 0
      ) {
        const confirmationModalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
        const confirmationComponentInstance: ConfirmationDialogComponent = confirmationModalRef.componentInstance;
        confirmationComponentInstance.message = this.translateService.instant(
          "Changing this value will remove any acquisition sessions you have already added."
        );
        confirmationModalRef.closed.subscribe(() => {
          clearModel();
        });
      } else {
        clearModel();
      }
    });
  }

  promptToExitEquipmentItemCreationMode(event?: MouseEvent) {
    // Stop event propagation to prevent it from bubbling up in case of nested creation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

    componentInstance.title = this.translateService.instant("Exit equipment creation?");
    componentInstance.message = this.translateService.instant("All unsaved changes will be lost.");

    modalRef.closed.pipe(take(1)).subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        // Find the cancel button and click it programmatically
        const cancelButton = this.windowRefService.nativeWindow.document.querySelector(
          "#create-new-item .card-footer button.btn-secondary"
        ) as HTMLButtonElement;

        if (cancelButton) {
          cancelButton.click();
        }
      }
    });
  }

  onPresetCreateClicked() {
    this.offcanvasService.open(this.presetCreateOffcanvas, {
      panelClass: "preset-create-offcanvas",
      position: this.deviceService.offcanvasPosition()
    });
  }

  onSave(event: Event) {
    if (event) {
      event.preventDefault();
    }

    if (this.imageEditEquipmentFieldsService.creationMode) {
      this.popNotificationsService.error(
        this.translateService.instant(
          "It looks like you are in the process of creating an equipment item, please complete or cancel that " +
            "operation before saving the entire form."
        ),
        null,
        {
          timeOut: 10000
        }
      );
      return;
    }

    if (!this.imageEditService.form.valid) {
      this.imageEditService.form.markAllAsTouched();
      UtilsService.notifyAboutFieldsWithErrors(
        this.imageEditService.fields,
        this.popNotificationsService,
        this.translateService
      );
      return;
    }

    const _doSave = () => {
      this.store$.dispatch(
        new SaveImage({
          pk: this.imageEditService.model.pk,
          image: { ...this.imageEditService.model, ...this.imageEditService.form.value } as ImageEditModelInterface
        })
      );

      this.actions$.pipe(ofType(AppActionTypes.SAVE_IMAGE_SUCCESS)).subscribe(() => {
        this.imageEditService.form.markAsPristine();

        if (!this._returnUrl) {
          this.currentUserProfile$.pipe(take(1)).subscribe(userProfile => {
            if (userProfile.enableNewGalleryExperience) {
              this.router
                .navigate(["i", this.imageEditService.model.hash || this.imageEditService.model.pk])
                .then(() => {
                  this.popNotificationsService.success(this.translateService.instant("Image saved."));
                });
            } else {
              this.loadingService.setLoading(true);
              UtilsService.openLink(
                this.windowRefService.nativeWindow.document,
                this.classicRoutesService.IMAGE(this.imageEditService.model.hash || this.imageEditService.model.pk)
              );
            }
          });
        } else {
          this.router.navigateByUrl(this._returnUrl).then(() => {
            this.popNotificationsService.success(this.translateService.instant("Image saved."));
          });
        }
      });
    };

    this.imageEditService
      .currentEquipmentPreset$()
      .pipe(take(1))
      .subscribe(preset => {
        if (!preset) {
          const imagingTelescopes = this.imageEditService.model.imagingTelescopes2;
          const imagingCameras = this.imageEditService.model.imagingCameras2;
          const mounts = this.imageEditService.model.mounts2;
          const filters = this.imageEditService.model.filters2;
          const accessories = this.imageEditService.model.accessories2;
          const software = this.imageEditService.model.software2;

          if (
            !imagingTelescopes.length &&
            !imagingCameras.length &&
            !mounts.length &&
            !filters.length &&
            !accessories.length &&
            !software.length
          ) {
            _doSave();
            return;
          }

          forkJoin([
            ...imagingTelescopes.map(id =>
              this.store$
                .select(selectEquipmentItem, {
                  id,
                  type: EquipmentItemType.TELESCOPE
                })
                .pipe(take(1))
            ),
            ...imagingCameras.map(id =>
              this.store$
                .select(selectEquipmentItem, {
                  id,
                  type: EquipmentItemType.CAMERA
                })
                .pipe(take(1))
            ),
            ...mounts.map(id =>
              this.store$
                .select(selectEquipmentItem, {
                  id,
                  type: EquipmentItemType.MOUNT
                })
                .pipe(take(1))
            ),
            ...filters.map(id =>
              this.store$
                .select(selectEquipmentItem, {
                  id,
                  type: EquipmentItemType.FILTER
                })
                .pipe(take(1))
            ),
            ...accessories.map(id =>
              this.store$
                .select(selectEquipmentItem, {
                  id,
                  type: EquipmentItemType.ACCESSORY
                })
                .pipe(take(1))
            ),
            ...software.map(id =>
              this.store$
                .select(selectEquipmentItem, {
                  id,
                  type: EquipmentItemType.SOFTWARE
                })
                .pipe(take(1))
            )
          ]).subscribe((equipment: EquipmentItem[]) => {
            const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
            const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;
            componentInstance.title = this.translateService.instant(
              "Would you like to save this equipment configuration as a setup?"
            );
            componentInstance.message = `
            <p>
              ${this.translateService.instant(
                "AstroBin noticed that you have not saved this equipment configuration as a setup. " +
                  "Would you like to save it now, so you can easily load it in the future?"
              )}
            </p>
            <p>
              ${equipment
                .map(
                  equipmentItem =>
                    (equipmentItem.brandName || this.translateService.instant("DIY")) + " " + equipmentItem.name
                )
                .join(" &middot; ")}
            </p>
          `;
            componentInstance.showAreYouSure = false;
            componentInstance.cancelLabel = this.translateService.instant("No, just save the image");
            componentInstance.confirmLabel = this.translateService.instant("Yes, save the setup");

            modalRef.closed.subscribe(result => {
              this.onSaveEquipmentPresetClicked(() => {
                _doSave();
              });
            });

            modalRef.dismissed.subscribe(() => {
              _doSave();
            });
          });
        } else {
          _doSave();
        }
      });
  }

  private _initFields(): void {
    this.store$
      .select(selectUser, this.imageEditService.model.user)
      .pipe(
        filter(user => !!user),
        take(1),
        switchMap(user =>
          this.currentUser$.pipe(
            take(1),
            map(currentUser => ({ user, currentUser }))
          )
        )
      )
      .subscribe(({ user, currentUser }) => {
        const basic = {
          id: "image-stepper-basic-information",
          props: { label: this.translateService.instant("Basic information") },
          fieldGroup: [
            this.imageEditBasicFieldsService.getTitleField(),
            this.imageEditBasicFieldsService.getDescriptionField(),
            this.imageEditBasicFieldsService.getPendingCollaboratorsField(),
            this.imageEditBasicFieldsService.getLinkField(),
            this.imageEditBasicFieldsService.getLinkToFitsField()
          ]
        };

        const content = {
          id: "image-stepper-content",
          props: { label: this.translateService.instant("Content") },
          fieldGroup: [
            this.imageEditContentFieldsService.getAcquisitionTypeField(),
            this.imageEditContentFieldsService.getSubjectTypeField(),
            this.imageEditContentFieldsService.getSolarSystemMainSubjectField(),
            this.imageEditContentFieldsService.getDataSourceField(),
            this.imageEditContentFieldsService.getRemoteSourceField()
          ]
        };

        if (this.imageEditService.model.user === currentUser.id) {
          content.fieldGroup.push(this.imageEditContentFieldsService.getLocationsField());
        }

        content.fieldGroup.push(
          this.imageEditContentFieldsService.getGroupsField(),
          this.imageEditContentFieldsService.getCollectionsField()
        );

        const thumbnail = {
          id: "image-stepper-thumbnail",
          props: { label: this.translateService.instant("Thumbnail") },
          fieldGroup: [
            this.imageEditThumbnailFieldsService.getThumbnailField(),
            this.imageEditThumbnailFieldsService.getSharpenThumbnailsField()
          ]
        };

        const watermark = {
          id: "image-stepper-watermark",
          props: { label: this.translateService.instant("Watermark") },
          fieldGroup: [
            this.imageEditWatermarkFieldsService.getWatermarkCheckboxField(),
            this.imageEditWatermarkFieldsService.getWatermarkTextField(),
            this.imageEditWatermarkFieldsService.getWatermarkPosition(),
            this.imageEditWatermarkFieldsService.getWatermarkTextSize(),
            this.imageEditWatermarkFieldsService.getWatermarkTextOpacity()
          ]
        };

        const equipment = {
          id: "image-stepper-equipment",
          props: {
            label: this.translateService.instant("Equipment"),
            stepPreambleTemplate: this.equipmentStepPreambleTemplate,
            stepActionsTemplate: this.equipmentStepButtonsTemplate
          },
          fieldGroup: [
            this.imageEditEquipmentFieldsService.getImagingTelescopes(this.componentId),
            this.imageEditEquipmentFieldsService.getImagingCameras(this.componentId),
            this.imageEditEquipmentFieldsService.getMounts(this.componentId),
            this.imageEditEquipmentFieldsService.getFilters(this.componentId),
            this.imageEditEquipmentFieldsService.getAccessories(this.componentId),
            this.imageEditEquipmentFieldsService.getSoftware(this.componentId),
            this.imageEditEquipmentFieldsService.getShowGuidingEquipment(),
            this.imageEditEquipmentFieldsService.getGuidingTelescopes(this.componentId),
            this.imageEditEquipmentFieldsService.getGuidingCameras(this.componentId)
          ]
        };

        const acquisition = {
          id: "image-stepper-acquisition",
          props: {
            label: this.translateService.instant("Acquisition")
          },
          fieldGroup: this.imageEditAcquisitionFieldsService.getFields()
        };

        const settings = {
          id: "image-stepper-settings",
          props: { label: this.translateService.instant("Settings") },
          fieldGroup: []
        };

        if (this.imageEditService.model.videoFile) {
          settings.fieldGroup = [
            this.imageEditSettingsFieldsService.getLicenseField(),
            this.imageEditSettingsFieldsService.getKeyValueTagsField(),
            this.imageEditSettingsFieldsService.getLoopVideoField(),
            this.imageEditSettingsFieldsService.getDownloadLimitationField(),
            this.imageEditSettingsFieldsService.getAllowCommentsField(),
            this.imageEditSettingsFieldsService.getAllowImageAdjustmentsWidgetField()
          ];
        } else {
          settings.fieldGroup = [
            this.imageEditSettingsFieldsService.getLicenseField(),
            this.imageEditSettingsFieldsService.getMouseHoverImageField(),
            this.imageEditSettingsFieldsService.getKeyValueTagsField(),
            this.imageEditSettingsFieldsService.getFullSizeDisplayLimitationField(),
            this.imageEditSettingsFieldsService.getMaxZoomField(),
            this.imageEditSettingsFieldsService.getDownloadLimitationField(),
            this.imageEditSettingsFieldsService.getAllowCommentsField(),
            this.imageEditSettingsFieldsService.getAllowImageAdjustmentsWidgetField()
          ];
        }

        const fieldGroup = [basic, content, thumbnail, watermark];

        if (this.userService.isInGroup(user, Constants.OWN_EQUIPMENT_MIGRATORS_GROUP)) {
          fieldGroup.push(equipment);
        }

        fieldGroup.push(acquisition);
        fieldGroup.push(settings);

        this.imageEditService.fields = [
          {
            type: "stepper",
            id: "image-stepper-field",
            props: {
              buttonsTemplate: this.stepperButtonsTemplate,
              fixed: true
            },
            fieldGroup
          }
        ];

        this.utilsService.delay(1).subscribe(() => {
          this.imageEditBasicFieldsService.onFieldsInitialized();
          this.imageEditContentFieldsService.onFieldsInitialized();
          this.imageEditWatermarkFieldsService.onFieldsInitialized();
          this.imageEditThumbnailFieldsService.onFieldsInitialized();
          this.imageEditEquipmentFieldsService.onFieldsInitialized();
          this.imageEditAcquisitionFieldsService.onFieldsInitialized();
          this.imageEditSettingsFieldsService.onFieldsInitialized();
        });
      });
  }

  private _destroyFields(): void {
    this.imageEditService.fields = [];
  }

  private _initBreadcrumb(): void {
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Image")
          },
          {
            label: this.imageEditService.model.title
          },
          {
            label: this.translateService.instant("Edit")
          }
        ]
      })
    );
  }
}
