import { Component, OnInit } from "@angular/core";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ComponentCanDeactivate } from "@shared/services/guards/pending-changes-guard.service";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { ActivatedRoute, Router } from "@angular/router";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { PlateSolvingSettingsInterface } from "@shared/interfaces/plate-solving-settings.interface";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { forkJoin, Observable } from "rxjs";
import { PlateSolvingSettingsApiService } from "@shared/services/api/classic/platesolving/settings/plate-solving-settings-api.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { PlateSolvingAdvancedSettingsInterface } from "@shared/interfaces/plate-solving-advanced-settings.interface";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { switchMap } from "rxjs/operators";

@Component({
  selector: "astrobin-image-plate-solving-settings-page",
  template: `
    <div class="page has-breadcrumb">
      <ul ngbNav #nav="ngbNav" class="nav-tabs">
        <li ngbNavItem>
          <a ngbNavLink translate="Basic settings"></a>
          <ng-template ngbNavContent>
            <form
              [formGroup]="basicForm"
              class="mt-4"
            >
              <formly-form [form]="basicForm" [model]="basicModel" [fields]="basicFields"></formly-form>
            </form>
          </ng-template>
        </li>
        <li ngbNavItem>
          <a ngbNavLink translate="Advanced settings"></a>
          <ng-template ngbNavContent>
            <form
              *ngIf="canPlateSolveAdvanced; else upgradeTemplate"
              [formGroup]="advancedForm"
              class="mt-4"
            >
              <formly-form [form]="advancedForm" [model]="advancedModel" [fields]="advancedFields"></formly-form>
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

          <a
            routerLink="/subscriptions/ultimate"
            class="no-wrap btn btn-primary"
          >
            {{ "Upgrade" | translate }}
          </a>
        </span>
      </p>
    </ng-template>
  `,
  styleUrls: ["./image-plate-solving-settings-page.component.scss"]
})
export class ImagePlateSolvingSettingsPageComponent
  extends BaseComponentDirective implements OnInit, ComponentCanDeactivate {

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

  constructor(
    public readonly store$: Store<MainState>,
    public readonly activatedRoute: ActivatedRoute,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly plateSolvingSettingsApiService: PlateSolvingSettingsApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly router: Router,
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
        updateAdvancedSettingsObservable$ =
          this.plateSolvingSettingsApiService.updateAdvancedSettings(advancedModeWithoutFile).pipe(
            switchMap(() => this.plateSolvingSettingsApiService.uploadSampleRawFrameFile(this.advancedModel.id, file))
          );
      } else {
        updateAdvancedSettingsObservable$ =
          this.plateSolvingSettingsApiService.updateAdvancedSettings({
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
      this.router.navigate(["/i", this.image.hash || this.image.pk], {
        queryParams: {
          r: this.revisionLabel
        }
      }).then(() => {
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
      this.router.navigate(["/i", this.image.hash || this.image.pk], {
        queryParams: {
          r: this.revisionLabel
        }
      }).then(() => {
        this.loadingService.setLoading(false);
        this.popNotificationsService.success(
          this.translateService.instant("Plate-solving will be restarted.")
        );
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
    this.store$.dispatch(new SetBreadcrumb({
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
    }));
  }

  private _initCanPlateSolveAdvanced() {
    this.userSubscriptionService.canPlateSolveAdvanced$().subscribe(canPlateSolveAdvanced => {
      this.canPlateSolveAdvanced = canPlateSolveAdvanced;
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
                "If checked, the plate-solving will be done without the need for you to provide hinds."
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
            type: "html",
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
            fieldGroupClassName: "d-flex justify-content-md-between align-items-md-center align-items-start flex-column flex-md-row gap-2",
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
            fieldGroupClassName: "d-flex justify-content-md-between align-items-md-center align-items-start flex-column flex-md-row gap-2",
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
            fieldGroupClassName: "d-flex justify-content-md-between align-items-md-center align-items-start" +
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
            key: "showPlaners",
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
            "href=\"https://pixinsight.com/xisf/\" target=\"_blank\">https://pixinsight.com/xisf/</a><br/><br/> " +
            "<strong>Please note:</strong> it's very important that the XISF or FITS file you upload is aligned to " +
            "your processed image, otherwise the object annotations will not match. To improve your chances at a " +
            "successful accurate plate-solution, calibrate your file the usual way (dark/bias/flats) but do not " +
            "stretch it."
          ),
          accept: ".fits, .xisf"
        }
      }
    ];
  }
}
