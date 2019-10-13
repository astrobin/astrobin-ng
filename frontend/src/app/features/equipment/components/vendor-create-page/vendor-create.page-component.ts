import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { URL_REGEX } from "@shared/regexes";
import { ValidationLoader } from "@lib/services/validation-loader.service";
import { VendorApiService } from "@feats/equipment/services/api/vendor-api.service";
import { AuthService } from "@lib/services/auth.service";
import { forkJoin, Observable, of } from "rxjs";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";
import { SessionService } from "@lib/services/session.service";
import { Router } from "@angular/router";
import { VendorCheckSimilarPageComponent } from "@feats/equipment/components/vendor-check-similar-page/vendor-check-similar.page-component";
import { catchError, map } from "rxjs/operators";
import { VendorService } from "@feats/equipment/services/vendor.service";

@Component({
  selector: "astrobin-vendor-form-page",
  templateUrl: "./vendor-create.page-component.html",
  styleUrls: ["./vendor-create.page-component.scss"],
})
export class VendorCreatePageComponent {
  public form = new FormGroup({});
  public model: VendorInterface = {} as VendorInterface;
  public fields: FormlyFieldConfig[];
  public loading = false;
  private;

  constructor(
    public readonly translate: TranslateService,
    public readonly validationLoader: ValidationLoader,
    public readonly vendorService: VendorService,
    public readonly vendorApi: VendorApiService,
    public readonly auth: AuthService,
    public readonly session: SessionService,
    public readonly router: Router) {
    this._initModel();
    this._initFields();
  }

  public submit(model: VendorInterface) {
    if (!this.form.valid) {
      return;
    }

    this.loading = true;

    this._checkSimilar(model.name).subscribe(results => {
      const exact: VendorInterface[] = results[0];
      const similar: VendorInterface[] = results[1];

      exact.forEach(match => {
        if (similar.map(vendor => vendor.id).indexOf(match.id) === -1) {
          similar.push(match);
        }
      });

      if (similar.length === 0) {
        this.vendorService.create(model).subscribe();
      } else {
        this.session.put(VendorCheckSimilarPageComponent.SESSION_KEY, { similar, model });
        this.router.navigate(["/equipment/vendors/create/check-similar"]);
      }
    });
  }

  _checkSimilar(name: string): Observable<any> {
    return forkJoin([
      this.vendorApi.retrieveByName(name),
      this.vendorApi.findSimilar(name),
    ]);
  }

  private _initModel(): void {
    this.model.createdBy = this.auth.userId();
    this.model.updatedBy = this.auth.userId();
  }

  private _initFields(): void {
    this.fields = [
      {
        key: "name",
        type: "input",
        templateOptions: {
          label: this.translate.instant("Name"),
          placeholder: "XYZ Inc.",
          required: true,
        },
        asyncValidators: {
          unique: {
            expression: (control: FormControl) => {
              return new Promise((resolve, reject) => {
                this.vendorService.isNameTaken(control.value).pipe(
                  map(isTaken => resolve(!isTaken)),
                  catchError(() => of(true)),
                ).subscribe();
              });
            },
            message: this.translate.instant("This property is already associated to an existing item, but it must be unique"),
          },
        },
      },
      {
        key: "website",
        type: "input",
        templateOptions: {
          label: this.translate.instant("Website"),
          placeholder: "https://www.xyz.com/",
          required: true,
          pattern: URL_REGEX,
        },
        validation: {
          messages: {
            pattern: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" is not a valid website`,
          },
        },
        asyncValidators: {
          unique: {
            expression: (control: FormControl) => {
              return new Promise((resolve, reject) => {
                this.vendorService.isWebsiteTaken(control.value).pipe(
                  map(isTaken => resolve(!isTaken)),
                  catchError(() => of(true)),
                ).subscribe();
              });
            },
            message: this.translate.instant("This property is already associated to an existing item, but it must be unique"),
          },
        },
      },
      {
        key: "description",
        type: "textarea",
        templateOptions: {
          label: this.translate.instant("Description"),
          required: true,
          minLength: 100,
          rows: 4,
        },
      },
      {
        key: "createdBy",
        type: "input",
        hide: true,
      },
    ];

    this.validationLoader.init();
  }
}
