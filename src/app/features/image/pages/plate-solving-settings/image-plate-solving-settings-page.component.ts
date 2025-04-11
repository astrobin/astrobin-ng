import { OnInit, Component } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { ImageInterface, ImageRevisionInterface, FINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { PlateSolvingAdvancedSettingsInterface } from "@core/interfaces/plate-solving-advanced-settings.interface";
import { PlateSolvingSettingsInterface } from "@core/interfaces/plate-solving-settings.interface";
import { SolutionStatus } from "@core/interfaces/solution.interface";
import { PlateSolvingSettingsApiService } from "@core/services/api/classic/platesolving/settings/plate-solving-settings-api.service";
import { ComponentCanDeactivate } from "@core/services/guards/pending-changes-guard.service";
import { ImageService } from "@core/services/image/image.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TitleService } from "@core/services/title/title.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Observable, forkJoin } from "rxjs";
import { switchMap } from "rxjs/operators";

@Component({
  selector: "astrobin-image-plate-solving-settings-page",
  template: `
    <div class="page has-breadcrumb">
      <ul ngbNav #nav="ngbNav" class="nav-tabs">
        <li ngbNavItem>
          <a ngbNavLink translate="Basic settings"></a>
          <ng-template ngbNavContent>
            <form [formGroup]="basicForm" class="mt-4">
              <formly-form [form]="basicForm" [model]="basicModel" [fields]="basicFields"></formly-form>
            </form>
          </ng-template>
        </li>
        <li ngbNavItem>
          <a ngbNavLink translate="Advanced settings"></a>
          <ng-template ngbNavContent>
            <form *ngIf="canPlateSolveAdvanced; else upgradeTemplate" [formGroup]="advancedForm" class="mt-4">
              <div *ngIf="!hasValidBasicSolution" class="alert alert-warning mb-4">
                <strong>{{ "Note:" | translate }}</strong>
                {{
                  "Advanced plate-solving settings can only be edited after the image has been successfully plate-solved with basic plate-solving."
                    | translate
                }}
              </div>

              <formly-form
                *ngIf="hasValidBasicSolution"
                [form]="advancedForm"
                [model]="advancedModel"
                [fields]="advancedFields"
              >
              </formly-form>
            </form>
          </ng-template>
        </li>
      </ul>

      <div [ngbNavOutlet]="nav"></div>

      <div class="form-actions">
        <button
          (click)="restart()"
          [class.loading]="loadingService.loading$ | async"
          class="btn btn-secondary"
          type="submit"
        >
          {{ "Restart plate-solving" | translate }}
        </button>

        <button
          (click)="save()"
          [class.loading]="loadingService.loading$ | async"
          class="btn btn-primary"
          type="submit"
        >
          {{ "Save" | translate }}
        </button>

        <a
          [class.loading]="loadingService.loading$ | async"
          [routerLink]="'/i/' + (image.hash || image.pk)"
          [queryParams]="{ r: revisionLabel }"
          class="btn btn-outline-secondary"
          astrobinEventPreventDefault
        >
          {{ "Cancel" | translate }}
        </a>
      </div>
    </div>

    <ng-template #upgradeTemplate>
      <p class="alert alert-dark mt-4 d-flex flex-nowrap justify-content-between align-items-center gap-3">
        <span [translate]="upgradeMessage"></span>
        <span class="no-wrap">
          <a
            href="https://welcome.astrobin.com/features/astrometry-tools"
            target="_blank"
            rel="noopener noreferrer"
            class="no-wrap btn btn-outline-secondary me-2"
          >
            {{ "Learn more" | translate }}
          </a>

          <a routerLink="/subscriptions/ultimate" class="no-wrap btn btn-primary">
            {{ "Upgrade" | translate }}
          </a>
        </span>
      </p>
    </ng-template>
  `,
  styleUrls: ["./image-plate-solving-settings-page.component.scss"]
})
export class ImagePlateSolvingSettingsPageComponent
  extends BaseComponentDirective
  implements OnInit, ComponentCanDeactivate
{
  protected image: ImageInterface;
  protected revisionLabel: ImageRevisionInterface["label"] = FINAL_REVISION_LABEL;
  protected canPlateSolveAdvanced: boolean;
  protected upgradeMessage = this.translateService.instant(
    "The AstroBin Advanced Plate-solving powered by PixInsight is available to AstroBin Ultimate subscribers."
  );

  protected readonly basicForm = new FormGroup({});
  protected basicModel: PlateSolvingSettingsInterface;
  protected basicFields: FormlyFieldConfig[];

  protected readonly advancedForm = new FormGroup({});
  protected advancedModel: PlateSolvingAdvancedSettingsInterface;
  protected advancedFields: FormlyFieldConfig[];

  protected radiusCategory: string = null;
  protected radiusCategoryLabel: string = null;
  protected hiddenFields: string[] = [];
  protected hasValidBasicSolution = false;

  // Map of field names to display labels for hidden fields notification
  private readonly fieldLabels = {
    showHd: "HD stars",
    showMessier: "Messier",
    showNgcIc: "NGC/IC",
    showVdb: "VdB",
    showSharpless: "Sharpless",
    showBarnard: "Barnard",
    showLbn: "LBN",
    showLdn: "LDN",
    showPgc: "PGC",
    showPlanets: "Planets",
    showAsteroids: "Asteroids",
    showGcvs: "GCVS stars",
    showTycho2: "Tycho-2 stars",
    showCgpn: "CGPN",
    showQuasars: "Quasars"
  };

  constructor(
    public readonly store$: Store<MainState>,
    public readonly activatedRoute: ActivatedRoute,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly plateSolvingSettingsApiService: PlateSolvingSettingsApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly router: Router,
    public readonly imageService: ImageService,
    public loadingService: LoadingService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setImage();
    this._setTitle();
    this._setBreadcrumb();
    this._initCanPlateSolveAdvanced();
    this._initFields();
  }

  canDeactivate(): boolean {
    return true;
  }

  save() {
    const observables$: Observable<PlateSolvingSettingsInterface | PlateSolvingAdvancedSettingsInterface>[] = [];

    if (this.basicForm.dirty) {
      observables$.push(this.plateSolvingSettingsApiService.updateSettings(this.basicModel));
    }

    if (this.advancedForm.dirty) {
      let updateAdvancedSettingsObservable$: Observable<PlateSolvingAdvancedSettingsInterface>;
      if (
        this.advancedModel.sampleRawFrameFile &&
        UtilsService.isArray(this.advancedModel.sampleRawFrameFile) &&
        this.advancedModel.sampleRawFrameFile.length === 1
      ) {
        const advancedModeWithoutFile = { ...this.advancedModel };
        delete advancedModeWithoutFile.sampleRawFrameFile;

        const file: File = (this.advancedModel.sampleRawFrameFile as any[])[0].file;
        updateAdvancedSettingsObservable$ = this.plateSolvingSettingsApiService
          .updateAdvancedSettings(advancedModeWithoutFile)
          .pipe(
            switchMap(() => this.plateSolvingSettingsApiService.uploadSampleRawFrameFile(this.advancedModel.id, file))
          );
      } else {
        updateAdvancedSettingsObservable$ = this.plateSolvingSettingsApiService.updateAdvancedSettings({
          ...this.advancedModel,
          sampleRawFrameFile: null
        });
      }

      observables$.push(updateAdvancedSettingsObservable$);
    }

    if (observables$.length === 0) {
      this.popNotificationsService.info(this.translateService.instant("No changes to save."));
      return;
    }

    this.loadingService.setLoading(true);

    forkJoin(observables$).subscribe(() => {
      void this.router
        .navigate(["/i", this.image.hash || this.image.pk], {
          queryParams: {
            r: this.revisionLabel
          }
        })
        .then(() => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.success(
            this.translateService.instant("Settings saved.") +
              " " +
              this.translateService.instant("Plate-solving will be restarted.")
          );
        });
    });
  }

  restart() {
    this.loadingService.setLoading(true);
    this.plateSolvingSettingsApiService.restart(this.basicModel.solution).subscribe(() => {
      void this.router
        .navigate(["/i", this.image.hash || this.image.pk], {
          queryParams: {
            r: this.revisionLabel
          }
        })
        .then(() => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.success(this.translateService.instant("Plate-solving will be restarted."));
        });
    });
  }

  private _setImage() {
    this.image = this.activatedRoute.snapshot.data.image;
    this.revisionLabel = this.activatedRoute.snapshot.queryParamMap.get("r") || FINAL_REVISION_LABEL;
  }

  private _setTitle() {
    this.titleService.setTitle(this.translateService.instant("Plate-solving settings"));
  }

  private _setBreadcrumb() {
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Image")
          },
          {
            label: this.image.title,
            link: `/i/${this.image.hash || this.image.pk}`
          },
          {
            label: this.revisionLabel,
            link: `/i/${this.image.hash || this.image.pk}?r=${this.revisionLabel}`
          },
          {
            label: this.translateService.instant("Plate-solving settings")
          }
        ]
      })
    );
  }

  private _initCanPlateSolveAdvanced() {
    this.userSubscriptionService.canPlateSolveAdvanced$().subscribe(canPlateSolveAdvanced => {
      this.canPlateSolveAdvanced = canPlateSolveAdvanced;
    });
  }

  /**
   * Categorizes a solution's field radius
   * @param radius - The field radius in degrees
   * @returns - The category string or null if radius is null
   */
  private getRadiusCategory(radius: string | number): string {
    if (radius === null || radius === undefined) {
      return null;
    }

    const radiusValue = parseFloat(radius as string);
    if (isNaN(radiusValue)) {
      return null;
    }

    if (radiusValue > 30) {
      return "very_large"; // >30 degrees
    } else if (radiusValue > 15) {
      return "large"; // 15-30 degrees
    } else if (radiusValue > 4) {
      return "medium"; // 4-15 degrees
    } else if (radiusValue > 1) {
      return "small"; // 1-4 degrees
    } else {
      return "very_small"; // <1 degree
    }
  }

  /**
   * Get human-readable label for radius category
   * @param category - The radius category
   * @returns - Human-readable label
   */
  private getRadiusCategoryLabel(category: string): string {
    switch (category) {
      case "very_large":
        return this.translateService.instant("Very large (>30°)");
      case "large":
        return this.translateService.instant("Large (15-30°)");
      case "medium":
        return this.translateService.instant("Medium (4-15°)");
      case "small":
        return this.translateService.instant("Small (1-4°)");
      case "very_small":
        return this.translateService.instant("Very small (<1°)");
      default:
        return "";
    }
  }

  /**
   * Get the default advanced settings for a specific radius category
   * @param radiusCategory - The radius category
   * @returns - A dictionary of default settings appropriate for the radius category
   */
  private getDefaultAdvancedSettingsForRadiusCategory(radiusCategory: string): Record<string, any> {
    const defaults: Record<string, any> = {};

    // If no radius category, return empty defaults
    if (!radiusCategory) {
      return defaults;
    }

    // Default settings for all field sizes
    defaults.showGrid = true;
    defaults.showEcliptic = true;
    defaults.showGalacticEquator = true;
    defaults.showConstellationBorders = true;
    defaults.showConstellationLines = true;

    // Very large field - only show structural elements (>30 degrees)
    if (radiusCategory === "very_large") {
      defaults.scaledFontSize = "S";
      defaults.showNamedStars = true;
      defaults.showHd = false;
      defaults.showMessier = true;
      defaults.showNgcIc = false;
      defaults.showVdb = false;
      defaults.showSharpless = false;
      defaults.showBarnard = false;
      defaults.showLbn = false;
      defaults.showLdn = false;
      defaults.showPgc = false;
      defaults.showPlanets = true;
      defaults.showAsteroids = false;
      defaults.showGcvs = false;
      defaults.showTycho2 = false;
      defaults.showCgpn = false;
      defaults.showQuasars = false;
    }

    // Large field (15-30 degrees)
    else if (radiusCategory === "large") {
      defaults.scaledFontSize = "S";
      defaults.showNamedStars = true;
      defaults.showHd = true;
      defaults.hdMaxMagnitude = "4.5";
      defaults.showMessier = true;
      defaults.showNgcIc = false;
      defaults.showVdb = false;
      defaults.showSharpless = true;
      defaults.showBarnard = false;
      defaults.showLbn = false;
      defaults.showLdn = false;
      defaults.showPgc = false;
      defaults.showPlanets = true;
      defaults.showAsteroids = false;
      defaults.showGcvs = false;
      defaults.showTycho2 = false;
      defaults.showCgpn = true;
      defaults.showQuasars = false;
    }

    // Medium field (4-15 degrees)
    else if (radiusCategory === "medium") {
      defaults.scaledFontSize = "M";
      defaults.showNamedStars = true;
      defaults.showHd = true;
      defaults.hdMaxMagnitude = "6.0";
      defaults.showMessier = true;
      defaults.showNgcIc = true;
      defaults.showVdb = true;
      defaults.showSharpless = true;
      defaults.showBarnard = true;
      defaults.showLbn = true;
      defaults.showLdn = true;
      defaults.showPgc = false;
      defaults.showPlanets = true;
      defaults.showAsteroids = true;
      defaults.showGcvs = false;
      defaults.showTycho2 = false;
      defaults.showCgpn = true;
      defaults.showQuasars = false;
    }

    // Small field (1-4 degrees)
    else if (radiusCategory === "small") {
      defaults.scaledFontSize = "M";
      defaults.showNamedStars = true;
      defaults.showHd = true;
      defaults.hdMaxMagnitude = "6";
      defaults.showMessier = true;
      defaults.showNgcIc = true;
      defaults.showVdb = true;
      defaults.showSharpless = true;
      defaults.showBarnard = true;
      defaults.showLbn = true;
      defaults.showLdn = true;
      defaults.showPgc = true;
      defaults.showPlanets = true;
      defaults.showAsteroids = true;
      defaults.showGcvs = true;
      defaults.gcvsMaxMagnitude = "10.0";
      defaults.showTycho2 = false;
      defaults.showCgpn = true;
      defaults.showQuasars = false;
    }

    // Very small field (<1 degree) - show everything
    else if (radiusCategory === "very_small") {
      defaults.scaledFontSize = "M";
      defaults.showNamedStars = true;
      defaults.showHd = true;
      defaults.hdMaxMagnitude = "8";
      defaults.showMessier = true;
      defaults.showNgcIc = true;
      defaults.showVdb = true;
      defaults.showSharpless = true;
      defaults.showBarnard = true;
      defaults.showLbn = true;
      defaults.showLdn = true;
      defaults.showPgc = true;
      defaults.showPlanets = true;
      defaults.showAsteroids = true;
      defaults.showGcvs = true;
      defaults.gcvsMaxMagnitude = "12.0";
      defaults.showTycho2 = true;
      defaults.tycho2MaxMagnitude = "11.0";
      defaults.showCgpn = true;
      defaults.showQuasars = true;
    }

    return defaults;
  }

  /**
   * Process and update the advanced model and fields based on radius category
   */
  private _processFieldsBasedOnRadiusCategory(): void {
    // Get the image from the activated route
    const image = this.activatedRoute.snapshot.data.image;

    // Get the correct revision based on the revision label
    const revision = this.revisionLabel ? this.imageService.getRevision(image, this.revisionLabel) : image;

    // Get the solution radius from the specific revision
    const radius = revision?.solution?.radius || null;

    // Check if the solution is valid (SUCCESS or higher)
    this.hasValidBasicSolution = revision?.solution?.status >= SolutionStatus.SUCCESS;

    // Set radius category and label
    this.radiusCategory = this.getRadiusCategory(radius);
    this.radiusCategoryLabel = this.getRadiusCategoryLabel(this.radiusCategory);

    if (!this.radiusCategory) {
      return;
    }

    // Get default settings for this radius category
    const defaults = this.getDefaultAdvancedSettingsForRadiusCategory(this.radiusCategory);

    // List of fields that should be hidden based on radius category
    this.hiddenFields = [];

    // For each toggle field in the advanced form
    Object.keys(this.fieldLabels).forEach(fieldName => {
      // If field is disabled in defaults, it should be hidden
      if (defaults[fieldName] === false) {
        // Add to hidden fields list for display in notice
        this.hiddenFields.push(this.fieldLabels[fieldName]);

        // Find and disable this field in the advancedFields
        this.updateAdvancedField(fieldName, false);
      }
    });
  }

  /**
   * Update a specific field in the advancedFields configuration
   * @param fieldName - The name of the field to update
   * @param enabled - Whether the field should be enabled
   */
  private updateAdvancedField(fieldName: string, enabled: boolean): void {
    // Set the model value to false (disabled)
    if (this.advancedModel && this.advancedModel.hasOwnProperty(fieldName)) {
      this.advancedModel[fieldName] = enabled;
    }

    const disabledMessage = this.translateService.instant("Option disabled based on field radius.");

    // Look through advancedFields to find and update the field's properties
    this.advancedFields.forEach(section => {
      if (section.fieldGroup) {
        section.fieldGroup.forEach(field => {
          // For nested field groups (cards/sections)
          if (field.fieldGroup) {
            field.fieldGroup.forEach(nestedField => {
              if (nestedField.key === fieldName) {
                // If field is found, add expressions to disable it
                if (!enabled) {
                  nestedField.props = nestedField.props || {};
                  nestedField.props.disabled = true;

                  // Add a note to the field's description explaining why it's disabled
                  const originalDescription = nestedField.props.description || "";
                  nestedField.props.description =
                    originalDescription + (originalDescription ? " " : "") + disabledMessage;
                }
              }

              // For even more nested field groups (e.g., fieldGroups in a toggle with magnitude)
              if (nestedField.fieldGroup) {
                nestedField.fieldGroup.forEach(deepNestedField => {
                  if (deepNestedField.key === fieldName) {
                    if (!enabled) {
                      deepNestedField.props = deepNestedField.props || {};
                      deepNestedField.props.disabled = true;

                      // Add a note to the field's description explaining why it's disabled
                      const deepOriginalDescription = deepNestedField.props.description || "";
                      deepNestedField.props.description =
                        deepOriginalDescription + (deepOriginalDescription ? " " : "") + disabledMessage;
                    }
                  }
                });
              }
            });
          } else if (field.key === fieldName) {
            // Direct field match
            if (!enabled) {
              field.props = field.props || {};
              field.props.disabled = true;

              // Add a note to the field's description explaining why it's disabled
              const originalDescription = field.props.description || "";
              field.props.description = originalDescription + (originalDescription ? " " : "") + disabledMessage;
            }
          }
        });
      }
    });
  }

  private _initFields() {
    this.basicModel = this.activatedRoute.snapshot.data.basicSettings;
    this.advancedModel = this.activatedRoute.snapshot.data.advancedSettings;

    this.basicFields = [
      {
        key: "id",
        type: "input",
        className: "d-none"
      },
      {
        key: "solution",
        type: "input",
        className: "d-none"
      },
      {
        key: "",
        fieldGroupClassName: "row",
        fieldGroup: [
          {
            key: "downsampleFactor",
            type: "input",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-6",
            props: {
              label: this.translateService.instant("Downsample factor"),
              description: this.translateService.instant(
                "If you have a large image, you can downsample it to speed up the plate-solving process."
              )
            }
          },
          {
            key: "useSextractor",
            type: "toggle",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-6",
            props: {
              lineHeight: "36px",
              label: this.translateService.instant("Star detection"),
              toggleLabel: this.translateService.instant("Use SExtractor"),
              description:
                this.translateService.instant(
                  "If checked, SExtractor will be used to extract the necessary information from the image."
                ) +
                " <a href='https://astrometry.net/doc/readme.html#source-extractor' target='_blank' rel='noopener'>" +
                this.translateService.instant("Learn more") +
                ".</a>"
            }
          }
        ]
      },
      {
        key: "",
        fieldGroupClassName: "row",
        fieldGroup: [
          {
            key: "astrometryNetPubliclyVisible",
            type: "toggle",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-6",
            props: {
              lineHeight: "36px",
              label: this.translateService.instant("Astrometry.net publicly visible"),
              description: this.translateService.instant(
                "If checked, the astrometry.net submission will be publicly visible. If you leave this unchecked," +
                  "you won't be able to see the full log of the astrometry.net submission, but the image will still" +
                  "be plate-solved and annotated."
              )
            }
          },
          {
            key: "blind",
            type: "toggle",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-6",
            props: {
              lineHeight: "36px",
              label: this.translateService.instant("Plate-solving method"),
              toggleLabel: this.translateService.instant("Blind"),
              description: this.translateService.instant(
                "If checked, the plate-solving will be done without the need for you to provide hints."
              )
            }
          }
        ]
      },
      {
        key: "",
        fieldGroupClassName: "row",
        expressions: {
          hide: "model.blind"
        },
        fieldGroup: [
          {
            type: "formly-template",
            className: "col-12",
            template: `<label>${this.translateService.instant("Plate-solving hints")}</label>`
          },
          {
            key: "scaleUnits",
            type: "ng-select",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-4",
            props: {
              label: this.translateService.instant("Scale units"),
              options: [
                {
                  value: "degwidth",
                  label: this.translateService.instant("Width of the field in degrees")
                },
                {
                  value: "arcminwidth",
                  label: this.translateService.instant("Width of the field in arcminutes")
                },
                {
                  value: "arcsecperpix",
                  label: this.translateService.instant("Resolution of the field in arcseconds/pixel")
                }
              ]
            }
          },
          {
            key: "scaleMin",
            type: "input",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-4",
            props: {
              label: this.translateService.instant("Scale min"),
              min: 0
            }
          },
          {
            key: "scaleMax",
            type: "input",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-4",
            props: {
              label: this.translateService.instant("Scale max"),
              min: 0
            }
          }
        ]
      },
      {
        key: "",
        fieldGroupClassName: "row",
        expressions: {
          hide: "model.blind"
        },
        fieldGroup: [
          {
            key: "centerRa",
            type: "input",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-4",
            props: {
              label: this.translateService.instant("Center RA")
            }
          },
          {
            key: "centerDec",
            type: "input",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-4",
            props: {
              label: this.translateService.instant("Center Dec")
            }
          },
          {
            key: "radius",
            type: "input",
            wrappers: ["default-wrapper"],
            className: "col-12 col-lg-4",
            props: {
              label: this.translateService.instant("Radius")
            }
          }
        ]
      }
    ];

    this.advancedFields = [
      {
        key: "id",
        type: "input",
        className: "d-none"
      },
      {
        key: "solution",
        type: "input",
        className: "d-none"
      },
      {
        key: "scaledFontSize",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Font size"),
          description: this.translateService.instant("Select the font size for the labels."),
          options: [
            {
              value: "S",
              label: this.translateService.instant("Small")
            },
            {
              value: "M",
              label: this.translateService.instant("Medium")
            },
            {
              value: "L",
              label: this.translateService.instant("Large")
            }
          ]
        }
      },
      {
        key: "",
        wrappers: ["card-wrapper"],
        props: {
          label: this.translateService.instant("Lines")
        },
        fieldGroup: [
          {
            key: "showGrid",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Equatorial grid")
            }
          },
          {
            key: "showEcliptic",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Ecliptic")
            }
          },
          {
            key: "showGalacticEquator",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Galactic equator")
            }
          },
          {
            key: "showConstellationBorders",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Constellation borders")
            }
          },
          {
            key: "showConstellationLines",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Constellation lines")
            }
          }
        ]
      },
      {
        key: "",
        wrappers: ["card-wrapper"],
        props: {
          label: this.translateService.instant("Stars")
        },
        fieldGroup: [
          {
            key: "showNamedStars",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Named stars")
            }
          },
          {
            key: "",
            fieldGroupClassName:
              "d-flex justify-content-md-between align-items-md-center align-items-start flex-column flex-md-row gap-2",
            fieldGroup: [
              {
                key: "showHd",
                type: "toggle",
                wrappers: ["default-wrapper"],
                className: "flex-grow-0 mb-0",
                props: {
                  labelClassName: "no-wrap",
                  toggleLabel: this.translateService.instant("HD stars")
                }
              },
              {
                key: "hdMaxMagnitude",
                type: "input",
                wrappers: ["default-wrapper"],
                className: "ms-md-4",
                expressions: {
                  hide: "!model.showHd"
                },
                props: {
                  fieldGroupClassName: "d-flex align-items-center gap-2 flex-nowrap",
                  labelClassName: "no-wrap mb-0",
                  label: this.translateService.instant("Max. magnitude")
                }
              }
            ]
          },
          {
            key: "",
            fieldGroupClassName:
              "d-flex justify-content-md-between align-items-md-center align-items-start flex-column flex-md-row gap-2",
            fieldGroup: [
              {
                key: "showGcvs",
                type: "toggle",
                wrappers: ["default-wrapper"],
                className: "flex-grow-0 mb-0",
                props: {
                  labelClassName: "no-wrap",
                  toggleLabel: this.translateService.instant("GCVS stars")
                }
              },
              {
                key: "gcvsMaxMagnitude",
                type: "input",
                wrappers: ["default-wrapper"],
                className: "ms-md-4",
                expressions: {
                  hide: "!model.showGcvs"
                },
                props: {
                  fieldGroupClassName: "d-flex align-items-center gap-2 flex-nowrap",
                  labelClassName: "no-wrap mb-0",
                  label: this.translateService.instant("Max. magnitude")
                }
              }
            ]
          },
          {
            key: "",
            fieldGroupClassName:
              "d-flex justify-content-md-between align-items-md-center align-items-start" +
              " flex-column flex-md-row gap-2",
            fieldGroup: [
              {
                key: "showTycho2",
                type: "toggle",
                wrappers: ["default-wrapper"],
                className: "flex-grow-0 mb-0",
                props: {
                  labelClassName: "no-wrap",
                  toggleLabel: this.translateService.instant("Tycho-2 stars")
                }
              },
              {
                key: "tycho2MaxMagnitude",
                type: "input",
                wrappers: ["default-wrapper"],
                className: "ms-md-4",
                expressions: {
                  hide: "!model.showTycho2"
                },
                props: {
                  fieldGroupClassName: "d-flex align-items-center gap-2 flex-nowrap",
                  labelClassName: "no-wrap mb-0",
                  label: this.translateService.instant("Max. magnitude")
                }
              }
            ]
          }
        ]
      },
      {
        key: "",
        wrappers: ["card-wrapper"],
        props: {
          label: this.translateService.instant("Catalogs")
        },
        fieldGroup: [
          {
            key: "showMessier",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Messier")
            }
          },
          {
            key: "showNgcIc",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("NGC/IC")
            }
          },
          {
            key: "showVdb",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("VdB")
            }
          },
          {
            key: "showSharpless",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Sharpless")
            }
          },
          {
            key: "showBarnard",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Barnard")
            }
          },
          {
            key: "showLbn",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("LBN")
            }
          },
          {
            key: "showLdn",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("LDN")
            }
          },
          {
            key: "showPgc",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("PGC")
            }
          },
          {
            key: "showCgpn",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("CGPN")
            }
          },
          {
            key: "showQuasars",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Quasars")
            }
          }
        ]
      },
      {
        key: "",
        wrappers: ["card-wrapper"],
        props: {
          label: this.translateService.instant("Solar system")
        },
        fieldGroup: [
          {
            key: "showPlanets",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Planets")
            }
          },
          {
            key: "showAsteroids",
            type: "toggle",
            wrappers: ["default-wrapper"],
            props: {
              toggleLabel: this.translateService.instant("Asteroids")
            }
          }
        ]
      },
      {
        key: "sampleRawFrameFile",
        type: "file",
        props: {
          label: this.translateService.instant("Sample RAW frame (max 100 MB)"),
          description: this.translateService.instant(
            "To improve the accuracy of your plate-solution even further, please upload one of the XISF or " +
              "FITS files from your data set. Such files normally have date and time headers that will allow AstroBin " +
              "to calculate solar system body ephemerides and find planets and asteroids in your image (provided you " +
              "also add location information to it).<br/><br/>For maximum accuracy, it's recommended that you use " +
              "PixInsight's native and open format XISF. Learn more about XISF here:<br/><br/><a " +
              'href="https://pixinsight.com/xisf/" target="_blank">https://pixinsight.com/xisf/</a><br/><br/> ' +
              "<strong>Please note:</strong> it's very important that the XISF or FITS file you upload is aligned to " +
              "your processed image, otherwise the object annotations will not match. To improve your chances at a " +
              "successful accurate plate-solution, calibrate your file the usual way (dark/bias/flats) but do not " +
              "stretch it."
          ),
          accept: ".fits, .xisf"
        }
      }
    ];

    // Process the fields based on the radius category after all fields are initialized
    this._processFieldsBasedOnRadiusCategory();
  }
}
