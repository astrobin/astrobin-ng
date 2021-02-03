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
import { ImageInterface } from "@shared/interfaces/image.interface";
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
    this.model = this.image;
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
              {
                key: "title",
                type: "input",
                templateOptions: {
                  label: this.translate.instant("Title"),
                  required: true
                }
              },
              {
                key: "description",
                type: "textarea",
                templateOptions: {
                  label: this.translate.instant("Description"),
                  description: this.translate.instant("HTML tags are allowed."),
                  required: false,
                  rows: 10
                }
              },
              {
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
              },
              {
                key: "link_to_tiff_fits",
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
              }
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
