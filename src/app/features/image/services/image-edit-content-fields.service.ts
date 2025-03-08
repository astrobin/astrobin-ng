import { Injectable } from "@angular/core";
import { LoadingService } from "@core/services/loading.service";
import { AcquisitionType, DataSource, RemoteSource, SolarSystemSubjectType, SubjectType } from "@core/interfaces/image.interface";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Observable, of, Subscription } from "rxjs";
import { CreateLocationAddTag } from "@app/store/actions/location.actions";
import { CreateLocationModalComponent } from "@features/image/components/create-location-modal/create-location-modal.component";
import { take } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { ImageEditFieldsBaseService } from "@features/image/services/image-edit-fields-base.service";
import { AcquisitionForm } from "@features/image/components/override-acquisition-form-modal/override-acquisition-form-modal.component";
import { ImageService } from "@core/services/image/image.service";

@Injectable({
  providedIn: null
})
export class ImageEditContentFieldsService extends ImageEditFieldsBaseService {
  private _dataSourceValueChangesSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService,
    public readonly imageEditService: ImageEditService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService
  ) {
    super(loadingService);
  }

  onFieldsInitialized(): void {
  }

  getAcquisitionTypeField(): FormlyFieldConfig {
    return {
      key: "acquisitionType",
      type: "ng-select",
      id: "image-acquisition-type-field",
      props: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Acquisition type"),
        options: [
          {
            value: AcquisitionType.REGULAR,
            label: this.imageService.humanizeAcquisitionType(AcquisitionType.REGULAR)
          },
          {
            value: AcquisitionType.EAA,
            label: this.imageService.humanizeAcquisitionType(AcquisitionType.EAA)
          },
          {
            value: AcquisitionType.LUCKY,
            label: this.imageService.humanizeAcquisitionType(AcquisitionType.LUCKY)
          },
          {
            value: AcquisitionType.DRAWING,
            label: this.imageService.humanizeAcquisitionType(AcquisitionType.DRAWING)
          },
          {
            value: AcquisitionType.OTHER,
            label: this.imageService.humanizeAcquisitionType(AcquisitionType.OTHER)
          }
        ]
      },
      validators: {
        validation: [{ name: "enum-value", options: { allowedValues: Object.values(AcquisitionType) } }]
      }
    };
  }

  getSubjectTypeField(): FormlyFieldConfig {
    return {
      key: "subjectType",
      type: "ng-select",
      id: "image-subject-type-field",
      props: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Subject type"),
        options: Object.keys(SubjectType).map((subjectType: SubjectType) => ({
          value: subjectType,
          label: this.imageService.humanizeSubjectType(subjectType)
        })),
        changeConfirmationCondition: (currentValue: SubjectType, newValue: SubjectType): boolean => {
          if (
            (
              this.imageEditService.isLongExposure(currentValue) ||
              this.imageEditService.model.overrideAcquisitionForm === AcquisitionForm.LONG_EXPOSURE
            ) &&
            !this.imageEditService.isLongExposure(newValue)) {
            return this.imageEditService.hasDeepSkyAcquisitions();
          }

          if (
            (
              this.imageEditService.isVideoBased(currentValue) ||
              this.imageEditService.model.overrideAcquisitionForm === AcquisitionForm.VIDEO_BASED
            ) &&
            !this.imageEditService.isVideoBased(newValue)
          ) {
            return this.imageEditService.hasSolarSystemAcquisitions();
          }

          return false;
        },
        changeConfirmationMessage: this.translateService.instant(
          "Changing this value will remove any acquisition sessions you have already added."
        ),
        onChangeConfirmation: (value: SubjectType): void => {
          this.imageEditService.model = {
            ...this.imageEditService.model,
            overrideAcquisitionForm: null
          };

          if (this.imageEditService.isVideoBased(value)) {
            this.imageEditService.model = {
              ...this.imageEditService.model,
              solarSystemMainSubject: null
            };
          }

          if (!this.imageEditService.isLongExposure(value)) {
            this.imageEditService.model.deepSkyAcquisitions = [];
          }

          if (!this.imageEditService.isVideoBased(value)) {
            this.imageEditService.model.solarSystemAcquisitions = [];
          }
        }
      },
      validators: {
        validation: [{ name: "enum-value", options: { allowedValues: Object.values(SubjectType) } }]
      }
    };
  }

  getSolarSystemMainSubjectField(): FormlyFieldConfig {
    return {
      key: "solarSystemMainSubject",
      type: "ng-select",
      id: "image-solar-system-main-subject-field",
      hideExpression: () => this.imageEditService.model.subjectType !== SubjectType.SOLAR_SYSTEM,
      expressions: {
        "props.required": "model.subjectType === 'SOLAR_SYSTEM'"
      },
      props: {
        label: this.translateService.instant("Main solar system subject"),
        options: Object.values(SolarSystemSubjectType).map(type => ({
          value: type,
          label: this.imageService.humanizeSolarSystemSubjectType(type)
        }))
      },
      validators: {
        validation: [{ name: "enum-value", options: { allowedValues: Object.values(SolarSystemSubjectType) } }]
      }
    };
  }

  getDataSourceField(): FormlyFieldConfig {
    return {
      key: "dataSource",
      type: "ng-select",
      id: "image-data-source-field",
      props: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Data source"),
        description: this.translateService.instant("Where does the data for this image come from?"),
        options: [
          {
            value: DataSource.BACKYARD,
            label: this.imageService.humanizeDataSource(DataSource.BACKYARD),
            description: this.translateService.instant(
              "Images captured with your own equipment near home."
            ),
            group: this.translateService.instant("Self-acquired")
          },
          {
            value: DataSource.TRAVELLER,
            label: this.imageService.humanizeDataSource(DataSource.TRAVELLER),
            description: this.translateService.instant(
              "Images captured with portable gear at distant locations."
            ),
            group: this.translateService.instant("Self-acquired")
          },
          {
            value: DataSource.OWN_REMOTE,
            label: this.imageService.humanizeDataSource(DataSource.OWN_REMOTE),
            description: this.translateService.instant(
              "Images captured with your own equipment at a remote observatory you own or rent, at a distant location."
            ),
            group: this.translateService.instant("Self-acquired")
          },
          {
            value: DataSource.AMATEUR_HOSTING,
            label: this.imageService.humanizeDataSource(DataSource.AMATEUR_HOSTING),
            description: this.translateService.instant(
              "Images captured by renting time or purchasing data from an amateur hosting facility."
            ),
            group: this.translateService.instant("External sources")
          },
          {
            value: DataSource.PUBLIC_AMATEUR_DATA,
            label: this.imageService.humanizeDataSource(DataSource.PUBLIC_AMATEUR_DATA),
            description: this.translateService.instant(
              "Images processed from publicly shared data by amateur astrophotographers."
            ),
            group: this.translateService.instant("External sources")
          },
          {
            value: DataSource.PRO_DATA,
            label: this.imageService.humanizeDataSource(DataSource.PRO_DATA),
            description: this.translateService.instant(
              "Images processed from professional data repositories, e.g. Hubble, JWST, ESO, etc."
            ),
            group: this.translateService.instant("External sources")
          },
          {
            value: DataSource.MIX,
            label: this.imageService.humanizeDataSource(DataSource.MIX),
            description: this.translateService.instant(
              "Images processed from a mix of the above sources."
            ),
            group: this.translateService.instant("External sources")
          },
          {
            value: DataSource.OTHER,
            label: this.imageService.humanizeDataSource(DataSource.OTHER),
            description: this.translateService.instant(
              "Images acquired or processed from a source not listed above."
            ),
            group: this.translateService.instant("External sources")
          },
          {
            value: DataSource.UNKNOWN,
            label: this.imageService.humanizeDataSource(DataSource.UNKNOWN),
            description: this.translateService.instant(
              "You're not sure where the data comes from."
            ),
            group: this.translateService.instant("External sources")
          }
        ]
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          if (!!this._dataSourceValueChangesSubscription) {
            this._dataSourceValueChangesSubscription.unsubscribe();
          }

          this._dataSourceValueChangesSubscription = field.formControl.valueChanges.subscribe(value => {
            if ([DataSource.OWN_REMOTE, DataSource.AMATEUR_HOSTING].indexOf(value) === -1) {
              this.imageEditService.model.remoteSource = null;
            }
          });
        },
        onDestroy: () => {
          this._dataSourceValueChangesSubscription.unsubscribe();
          this._dataSourceValueChangesSubscription = undefined;
        }
      },
      validators: {
        validation: [{ name: "enum-value", options: { allowedValues: Object.values(DataSource) } }]
      }
    };
  }

  getRemoteSourceField(): FormlyFieldConfig {
    return {
      key: "remoteSource",
      type: "ng-select",
      id: "image-remote-source-field",
      hideExpression: () =>
        [DataSource.OWN_REMOTE, DataSource.AMATEUR_HOSTING].indexOf(this.imageEditService.model.dataSource) === -1,
      expressions: {
        "props.required": "model.dataSource === 'OWN_REMOTE' || model.dataSource === 'AMATEUR_HOSTING'"
      },
      props: {
        label: this.translateService.instant("Remote data source"),
        description: this.translateService.instant(
          "Which remote hosting facility did you use to acquire data for this image?"
        ),
        labelTemplate: this.imageEditService.remoteSourceLabelTemplate,
        optionTemplate: this.imageEditService.remoteSourceOptionTemplate,
        options: [
          {
            value: "OWN",
            label: this.translateService.instant("Private remote observatory"),
            group: this.translateService.instant("Non-commercial independent facility")
          },
          ...Array.from(Object.keys(RemoteSource)).map(key => ({
            value: key,
            label: RemoteSource[key],
            group: this.translateService.instant("Commercial facilities")
          })),
          {
            value: "OTHER",
            label: this.translateService.instant("None of the above"),
            group: this.translateService.instant("Other")
          }
        ]
      }
    };
  }

  getLocationsField(): FormlyFieldConfig {
    return {
      key: "locations",
      type: "ng-select",
      id: "image-locations-field",
      props: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Locations"),
        description: `
          <strong>${this.translateService.instant("Please note")}: </strong>
          ${this.translateService.instant("AstroBin does not share your coordinates with anyone.")}
        `,
        options: of(
          this.imageEditService.locations.map(location => ({
            value: location.id,
            label: location.name
          }))
        ),
        onSearch: (): Observable<void> => {
          return of(void 0);
        },
        addTag: name => {
          this.store$.dispatch(new CreateLocationAddTag(name));
          const modalRef = this.modalService.open(CreateLocationModalComponent);
          const componentInstance: CreateLocationModalComponent = modalRef.componentInstance;
          componentInstance.userId = this.imageEditService.model.user;
          modalRef.result.then(result => {
            if (result === null) {
              return;
            }

            const newItem = {
              value: result.id,
              label: result.name
            };

            const stepperField = this.imageEditService.fields.filter(field => field.id === "image-stepper-field")[0];
            const contentFieldGroup = stepperField.fieldGroup.filter(
              group => group.id === "image-stepper-content"
            )[0];
            const locationsField = contentFieldGroup.fieldGroup.filter(
              group => group.id === "image-locations-field"
            )[0];

            this.utilsService.delay(1).subscribe(() => {
              (locationsField.props.options as Observable<{ value: number; label: string }[]>)
                .pipe(take(1))
                .subscribe(currentOptions => {
                  locationsField.props = {
                    ...locationsField.props,
                    options: of([...(currentOptions as { value: number; label: string }[]), ...[newItem]])
                  };
                });

              this.imageEditService.model = {
                ...this.imageEditService.model,
                ...{
                  locations: [...(this.imageEditService.model.locations || []), ...[newItem.value]]
                }
              };
            });
          });
        }
      }
    };
  }

  getGroupsField(): FormlyFieldConfig {
    let description =
      this.translateService.instant("Submit this image to the selected groups.") +
      " " +
      "<a href=\"https://welcome.astrobin.com/features/groups\" target=\"_blank\">" +
      this.translateService.instant("Learn more about AstroBin Groups.") +
      "</a>";

    if (this.imageEditService.groups.length === 0) {
      const reason = this.translateService.instant("This field is disabled because you haven't joined any groups yet.");
      description += ` <strong>${reason}</strong>`;
    }
 else if (this.imageEditService.model.isWip) {
      const publicationInfo = this.translateService.instant(
        "This setting will take affect after the image will be moved to your public area."
      );
      description += ` <strong>${publicationInfo}</strong>`;
    }

    return {
      key: "partOfGroupSet",
      type: "ng-select",
      id: "image-groups-field",
      props: {
        multiple: true,
        required: false,
        disabled: this.imageEditService.groups.length === 0,
        label: this.translateService.instant("Groups"),
        description,
        options: this.imageEditService.groups.map(group => ({
          value: group.id,
          label: group.name
        }))
      }
    };
  }

  getCollectionsField(): FormlyFieldConfig {
    let description =
      this.translateService.instant("Add this image to the selected collections.") +
      " " +
      "<a href=\"https://welcome.astrobin.com/image-collections\" target=\"_blank\">" +
      this.translateService.instant("Learn more about collections.") +
      "</a>";

    if (this.imageEditService.collections.length === 0) {
      const reason = this.translateService.instant(
        "This field is disabled because you haven't created any collections yet."
      );
      description += ` <strong>${reason}</strong>`;
    }

    return {
      key: "collections",
      type: "ng-select",
      id: "image-collections-field",
      props: {
        multiple: true,
        required: false,
        disabled: this.imageEditService.collections.length === 0,
        label: this.translateService.instant("Collections"),
        description,
        options: this.imageEditService.collections.map(collection => ({
          value: collection.id,
          label: collection.name
        }))
      }
    };
  }
}
