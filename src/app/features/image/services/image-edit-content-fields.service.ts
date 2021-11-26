import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import {
  AcquisitionType,
  DataSource,
  RemoteSource,
  SolarSystemSubjectType,
  SubjectType
} from "@shared/interfaces/image.interface";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Observable, of } from "rxjs";
import { CreateLocationAddTag } from "@app/store/actions/location.actions";
import { CreateLocationModalComponent } from "@features/image/components/create-location-modal/create-location-modal.component";
import { take } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

@Injectable({
  providedIn: null
})
export class ImageEditContentFieldsService extends BaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService,
    public readonly modalService: NgbModal
  ) {
    super(loadingService);
  }

  getAcquisitionTypeField(): any {
    return {
      key: "acquisitionType",
      type: "ng-select",
      id: "image-acquisition-type-field",
      templateOptions: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Acquisition type"),
        options: [
          {
            value: AcquisitionType.REGULAR,
            label: this.translateService.instant("Regular (e.g. medium/long exposure with a CCD or DSLR)")
          },
          {
            value: AcquisitionType.EAA,
            label: this.translateService.instant(
              "Electronically-Assisted Astronomy (EAA, e.g. based on a live video feed)"
            )
          },
          {
            value: AcquisitionType.LUCKY,
            label: this.translateService.instant("Lucky imaging")
          },
          {
            value: AcquisitionType.DRAWING,
            label: this.translateService.instant("Drawing/Sketch")
          },
          {
            value: AcquisitionType.OTHER,
            label: this.translateService.instant("Other/Unknown")
          }
        ]
      }
    };
  }

  getSubjectTypeField(): any {
    return {
      key: "subjectType",
      type: "ng-select",
      id: "image-subject-type-field",
      templateOptions: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Subject type"),
        options: [
          { value: SubjectType.DEEP_SKY, label: this.translateService.instant("Deep sky object or field") },
          { value: SubjectType.SOLAR_SYSTEM, label: this.translateService.instant("Solar system body or event") },
          { value: SubjectType.WIDE_FIELD, label: this.translateService.instant("Extremely wide field") },
          { value: SubjectType.STAR_TRAILS, label: this.translateService.instant("Star trails") },
          { value: SubjectType.NORTHERN_LIGHTS, label: this.translateService.instant("Northern lights") },
          { value: SubjectType.GEAR, label: this.translateService.instant("Gear") },
          { value: SubjectType.OTHER, label: this.translateService.instant("Other") }
        ]
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges.subscribe(value => {
            if (value !== SubjectType.SOLAR_SYSTEM) {
              this.imageEditService.model.solarSystemMainSubject = null;
            }
          });
        }
      }
    };
  }

  getSolarSystemMainSubjectField(): any {
    return {
      key: "solarSystemMainSubject",
      type: "ng-select",
      id: "image-solar-system-main-subject-field",
      hideExpression: () => this.imageEditService.model.subjectType !== SubjectType.SOLAR_SYSTEM,
      expressionProperties: {
        "templateOptions.required": "model.subjectType === 'SOLAR_SYSTEM'"
      },
      templateOptions: {
        label: this.translateService.instant("Main solar system subject"),
        options: [
          { value: SolarSystemSubjectType.SUN, label: this.translateService.instant("Sun") },
          { value: SolarSystemSubjectType.MOON, label: this.translateService.instant("Earth's Moon") },
          { value: SolarSystemSubjectType.MERCURY, label: this.translateService.instant("Mercury") },
          { value: SolarSystemSubjectType.VENUS, label: this.translateService.instant("Venus") },
          { value: SolarSystemSubjectType.MARS, label: this.translateService.instant("Mars") },
          { value: SolarSystemSubjectType.JUPITER, label: this.translateService.instant("Jupiter") },
          { value: SolarSystemSubjectType.SATURN, label: this.translateService.instant("Saturn") },
          { value: SolarSystemSubjectType.URANUS, label: this.translateService.instant("Uranus") },
          { value: SolarSystemSubjectType.NEPTUNE, label: this.translateService.instant("Neptune") },
          { value: SolarSystemSubjectType.MINOR_PLANET, label: this.translateService.instant("Minor planet") },
          { value: SolarSystemSubjectType.COMET, label: this.translateService.instant("Comet") },
          { value: SolarSystemSubjectType.OCCULTATION, label: this.translateService.instant("Occultation") },
          { value: SolarSystemSubjectType.CONJUNCTION, label: this.translateService.instant("Conjunction") },
          {
            value: SolarSystemSubjectType.PARTIAL_LUNAR_ECLIPSE,
            label: this.translateService.instant("Partial lunar eclipse")
          },
          {
            value: SolarSystemSubjectType.TOTAL_LUNAR_ECLIPSE,
            label: this.translateService.instant("Total lunar eclipse")
          },
          {
            value: SolarSystemSubjectType.PARTIAL_SOLAR_ECLIPSE,
            label: this.translateService.instant("Partial solar eclipse")
          },
          {
            value: SolarSystemSubjectType.ANULAR_SOLAR_ECLIPSE,
            label: this.translateService.instant("Anular solar eclipse")
          },
          {
            value: SolarSystemSubjectType.TOTAL_SOLAR_ECLIPSE,
            label: this.translateService.instant("Total solar eclipse")
          },
          { value: SolarSystemSubjectType.OTHER, label: this.translateService.instant("Other") }
        ]
      }
    };
  }

  getDataSourceField(): any {
    return {
      key: "dataSource",
      type: "ng-select",
      id: "image-data-source-field",
      templateOptions: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Data source"),
        description: this.translateService.instant("Where does the data for this image come from?"),
        options: [
          {
            value: DataSource.BACKYARD,
            label: this.translateService.instant("Backyard"),
            group: this.translateService.instant("Self acquired")
          },
          {
            value: DataSource.TRAVELLER,
            label: this.translateService.instant("Traveller"),
            group: this.translateService.instant("Self acquired")
          },
          {
            value: DataSource.OWN_REMOTE,
            label: this.translateService.instant("Own remote observatory"),
            group: this.translateService.instant("Self acquired")
          },
          {
            value: DataSource.AMATEUR_HOSTING,
            label: this.translateService.instant("Amateur hosting facility"),
            group: this.translateService.instant("Downloaded")
          },
          {
            value: DataSource.PUBLIC_AMATEUR_DATA,
            label: this.translateService.instant("Public amateur data"),
            group: this.translateService.instant("Downloaded")
          },
          {
            value: DataSource.PRO_DATA,
            label: this.translateService.instant("Professional, scientific grade data"),
            group: this.translateService.instant("Downloaded")
          },
          {
            value: DataSource.MIX,
            label: this.translateService.instant("Mix of multiple sources"),
            group: this.translateService.instant("Other")
          },
          {
            value: DataSource.OTHER,
            label: this.translateService.instant("None of the above"),
            group: this.translateService.instant("Other")
          },
          {
            value: DataSource.UNKNOWN,
            label: this.translateService.instant("Unknown"),
            group: this.translateService.instant("Other")
          }
        ]
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges.subscribe(value => {
            if ([DataSource.OWN_REMOTE, DataSource.AMATEUR_HOSTING].indexOf(value) === -1) {
              this.imageEditService.model.remoteSource = null;
            }
          });
        }
      }
    };
  }

  getRemoteSourceField(): any {
    return {
      key: "remoteSource",
      type: "ng-select",
      id: "image-remote-source-field",
      hideExpression: () =>
        [DataSource.OWN_REMOTE, DataSource.AMATEUR_HOSTING].indexOf(this.imageEditService.model.dataSource) === -1,
      expressionProperties: {
        "templateOptions.required": "model.dataSource === 'OWN_REMOTE' || model.dataSource === 'AMATEUR_HOSTING'"
      },
      templateOptions: {
        label: this.translateService.instant("Remote data source"),
        description: this.translateService.instant(
          "Which remote hosting facility did you use to acquire data for this image?"
        ),
        labelTemplate: this.imageEditService.remoteSourceLabelTemplate,
        optionTemplate: this.imageEditService.remoteSourceOptionTemplate,
        options: [
          ...Array.from(Object.keys(RemoteSource)).map(key => ({
            value: key,
            label: RemoteSource[key],
            group: this.translateService.instant("Commercial facilities")
          })),
          {
            value: "OWN",
            label: this.translateService.instant("Non-commercial independent facility"),
            group: this.translateService.instant("Other")
          },
          {
            value: "OTHER",
            label: this.translateService.instant("None of the above"),
            group: this.translateService.instant("Other")
          }
        ]
      }
    };
  }

  getLocationsField(): any {
    return {
      key: "locations",
      type: "ng-select",
      id: "image-locations-field",
      hideExpression: () => Object.keys(RemoteSource).indexOf(this.imageEditService.model.remoteSource) > -1,
      templateOptions: {
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
        addTag: name => {
          this.store$.dispatch(new CreateLocationAddTag(name));
          const modalRef = this.modalService.open(CreateLocationModalComponent);
          modalRef.result.then(result => {
            const newItem = {
              value: result.id,
              label: result.name
            };

            const stepperField = this.imageEditService.fields.filter(field => field.id === "image-stepper-field")[0];
            const contentFieldGroup = stepperField.fieldGroup.filter(group => group.id === "image-stepper-content")[0];
            const locationsField = contentFieldGroup.fieldGroup.filter(
              group => group.id === "image-locations-field"
            )[0];

            setTimeout(() => {
              (locationsField.templateOptions.options as Observable<{ value: number; label: string }[]>)
                .pipe(take(1))
                .subscribe(currentOptions => {
                  locationsField.templateOptions.options = of([
                    ...(currentOptions as { value: number; label: string }[]),
                    ...[newItem]
                  ]);
                });

              this.imageEditService.model = {
                ...this.imageEditService.model,
                ...{
                  locations: [...(this.imageEditService.model.locations || []), ...[newItem.value]]
                }
              };
            }, 1);
          });
        }
      }
    };
  }

  getGroupsField(): any {
    let description = this.translateService.instant("Submit this image to the selected groups.");

    if (this.imageEditService.groups.length === 0) {
      const reason = this.translateService.instant("This field is disabled because you haven't joined any groups yet.");
      description += ` <strong>${reason}</strong>`;
    } else if (this.imageEditService.image.isWip) {
      const publicationInfo = this.translateService.instant(
        "This setting will take affect after the image will be moved to your public area."
      );
      description += ` <strong>${publicationInfo}</strong>`;
    }

    return {
      key: "partOfGroupSet",
      type: "ng-select",
      id: "image-groups-field",
      templateOptions: {
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
}
