import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import {
  AcquisitionType,
  DataSource,
  ImageInterface,
  SolarSystemSubjectType,
  SubjectType
} from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { TitleService } from "@shared/services/title/title.service";

@Component({
  selector: "astrobin-image-edit-page",
  templateUrl: "./image-edit-page.component.html",
  styleUrls: ["./image-edit-page.component.scss"]
})
export class ImageEditPageComponent extends BaseComponentDirective implements OnInit {
  ImageAlias = ImageAlias;
  image: ImageInterface;
  model: Partial<ImageInterface>;
  form = new FormGroup({});
  fields: FormlyFieldConfig[];

  constructor(
    public readonly store$: Store<State>,
    public readonly route: ActivatedRoute,
    public readonly translate: TranslateService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService
  ) {
    super();
  }

  ngOnInit(): void {
    this.image = this.route.snapshot.data.image;
    this.model = { ...this.image };
    this.titleService.setTitle("Edit image");
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translate.instant("Image")
          },
          {
            label: this.image.title
          },
          {
            label: this.translate.instant("Edit")
          }
        ]
      })
    );

    this._initFields();
    this._initBreadcrumb();
  }

  onSubmit(): void {}

  private _getTitleField(): any {
    return {
      key: "title",
      type: "input",
      templateOptions: {
        label: this.translate.instant("Title"),
        required: true
      }
    };
  }

  private _getDescriptionField(): any {
    return {
      key: "description",
      type: "textarea",
      templateOptions: {
        label: this.translate.instant("Description"),
        description: this.translate.instant("HTML tags are allowed."),
        required: false,
        rows: 10
      }
    };
  }

  private _getLinkField(): any {
    return {
      key: "link",
      type: "input",
      templateOptions: {
        label: this.translate.instant("Link"),
        description: this.translate.instant(
          "If you're hosting a copy of this image on your website, put the address here."
        ),
        placeholder: "https://www.example.com/my-page.html",
        required: false
      }
    };
  }

  private _getLinkToFitsField(): any {
    return {
      key: "linkToFits",
      type: "input",
      templateOptions: {
        label: this.translate.instant("Link to TIFF/FITS"),
        description: this.translate.instant(
          "If you want to share the TIFF or FITS file of your image, put a link to the file here. " +
            "Unfortunately, AstroBin cannot offer to store these files at the moment, so you will have to " +
            "host them on your personal space."
        ),
        placeholder: "https://www.example.com/my-page.html",
        required: false
      }
    };
  }

  private _getAcquisitionTypeField(): any {
    return {
      key: "acquisitionType",
      type: "ng-select",
      templateOptions: {
        required: true,
        label: this.translate.instant("Acquisition type"),
        options: [
          {
            value: AcquisitionType.REGULAR,
            label: this.translate.instant("Regular (e.g. medium/long exposure with a CCD or DSLR)")
          },
          {
            value: AcquisitionType.EAA,
            label: this.translate.instant("Electronically-Assisted Astronomy (EAA, e.g. based on a live video feed)")
          },
          {
            value: AcquisitionType.LUCKY,
            label: this.translate.instant("Lucky imaging")
          },
          {
            value: AcquisitionType.DRAWING,
            label: this.translate.instant("Drawing/Sketch")
          },
          {
            value: AcquisitionType.OTHER,
            label: this.translate.instant("Other/Unknown")
          }
        ]
      }
    };
  }

  private _getSubjectTypeField(): any {
    return {
      key: "subjectType",
      type: "ng-select",
      templateOptions: {
        required: true,
        label: this.translate.instant("Subject type"),
        options: [
          { value: SubjectType.DEEP_SKY, label: this.translate.instant("Deep sky object or field") },
          { value: SubjectType.SOLAR_SYSTEM, label: this.translate.instant("Solar system body or event") },
          { value: SubjectType.WIDE_FIELD, label: this.translate.instant("Extremely wide field") },
          { value: SubjectType.STAR_TRAILS, label: this.translate.instant("Star trails") },
          { value: SubjectType.NORTHERN_LIGHTS, label: this.translate.instant("Northern lights") },
          { value: SubjectType.GEAR, label: this.translate.instant("Gear") },
          { value: SubjectType.OTHER, label: this.translate.instant("Other") }
        ]
      }
    };
  }

  private _getSolarSystemMainSubjectField(): any {
    return {
      key: "solarSystemMainSubject",
      type: "ng-select",
      hideExpression: () => this.model.subjectType !== SubjectType.SOLAR_SYSTEM,
      templateOptions: {
        required: () => this.model.subjectType === SubjectType.SOLAR_SYSTEM,
        label: this.translate.instant("Main solar system subject"),
        options: [
          { value: SolarSystemSubjectType.SUN, label: this.translate.instant("Sun") },
          { value: SolarSystemSubjectType.MOON, label: this.translate.instant("Earth's Moon") },
          { value: SolarSystemSubjectType.MERCURY, label: this.translate.instant("Mercury") },
          { value: SolarSystemSubjectType.VENUS, label: this.translate.instant("Venus") },
          { value: SolarSystemSubjectType.MARS, label: this.translate.instant("Mars") },
          { value: SolarSystemSubjectType.JUPITER, label: this.translate.instant("Jupiter") },
          { value: SolarSystemSubjectType.SATURN, label: this.translate.instant("Saturn") },
          { value: SolarSystemSubjectType.URANUS, label: this.translate.instant("Uranus") },
          { value: SolarSystemSubjectType.NEPTUNE, label: this.translate.instant("Neptune") },
          { value: SolarSystemSubjectType.MINOR_PLANET, label: this.translate.instant("Minor planet") },
          { value: SolarSystemSubjectType.COMET, label: this.translate.instant("Comet") },
          { value: SolarSystemSubjectType.OCCULTATION, label: this.translate.instant("Occultation") },
          { value: SolarSystemSubjectType.CONJUNCTION, label: this.translate.instant("Conjunction") },
          {
            value: SolarSystemSubjectType.PARTIAL_LUNAR_ECLIPSE,
            label: this.translate.instant("Partial lunar eclipse")
          },
          {
            value: SolarSystemSubjectType.TOTAL_LUNAR_ECLIPSE,
            label: this.translate.instant("Total lunar eclipse")
          },
          {
            value: SolarSystemSubjectType.PARTIAL_SOLAR_ECLIPSE,
            label: this.translate.instant("Partial solar eclipse")
          },
          {
            value: SolarSystemSubjectType.ANULAR_SOLAR_ECLIPSE,
            label: this.translate.instant("Anular solar eclipse")
          },
          {
            value: SolarSystemSubjectType.TOTAL_SOLAR_ECLIPSE,
            label: this.translate.instant("Total solar eclipse")
          },
          { value: SolarSystemSubjectType.OTHER, label: this.translate.instant("Other") }
        ]
      }
    };
  }

  private _getDataSourceField(): any {
    return {
      key: "dataSource",
      type: "ng-select",
      templateOptions: {
        required: true,
        label: this.translate.instant("Data source"),
        options: [
          {
            value: DataSource.BACKYARD,
            label: this.translate.instant("Backyard"),
            group: this.translate.instant("Self acquired")
          },
          {
            value: DataSource.TRAVELLER,
            label: this.translate.instant("Traveller"),
            group: this.translate.instant("Self acquired")
          },
          {
            value: DataSource.OWN_REMOTE,
            label: this.translate.instant("Own remote observatory"),
            group: this.translate.instant("Self acquired")
          },
          {
            value: DataSource.AMATEUR_HOSTING,
            label: this.translate.instant("Amateur hosting facility"),
            group: this.translate.instant("Downloaded")
          },
          {
            value: DataSource.PUBLIC_AMATEUR_DATA,
            label: this.translate.instant("Public amateur data"),
            group: this.translate.instant("Downloaded")
          },
          {
            value: DataSource.PRO_DATA,
            label: this.translate.instant("Professional, scientific grade data"),
            group: this.translate.instant("Downloaded")
          },
          {
            value: DataSource.MIX,
            label: this.translate.instant("Mix of multiple sources"),
            group: this.translate.instant("Other")
          },
          {
            value: DataSource.OTHER,
            label: this.translate.instant("None of the above"),
            group: this.translate.instant("Other")
          },
          {
            value: DataSource.UNKNOWN,
            label: this.translate.instant("Unknown"),
            group: this.translate.instant("Other")
          }
        ]
      }
    };
  }

  private _initFields(): void {
    this.fields = [
      {
        type: "image-edit-stepper",
        templateOptions: {
          image: this.image
        },
        fieldGroup: [
          {
            templateOptions: { label: this.translate.instant("Basic information") },
            fieldGroup: [
              this._getTitleField(),
              this._getDescriptionField(),
              this._getLinkField(),
              this._getLinkToFitsField()
            ]
          },
          {
            templateOptions: { label: this.translate.instant("Content") },
            fieldGroup: [
              this._getAcquisitionTypeField(),
              this._getSubjectTypeField(),
              this._getSolarSystemMainSubjectField(),
              this._getDataSourceField()
            ]
          },
          {
            templateOptions: { label: this.translate.instant("Data source") },
            fieldGroup: []
          }
        ]
      }
    ];
  }

  private _initBreadcrumb(): void {}
}
