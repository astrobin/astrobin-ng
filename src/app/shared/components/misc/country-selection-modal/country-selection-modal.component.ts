import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import type { CountryService } from "@core/services/country.service";
import type { LoadingService } from "@core/services/loading.service";
import type { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-country-selection-modal",
  templateUrl: "./country-selection-modal.component.html",
  styleUrls: ["./country-selection-modal.component.scss"]
})
export class CountrySelectionModalComponent extends BaseComponentDirective implements OnInit {
  form = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  countries: any[] = [];
  selectedCountry: any = null;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly countryService: CountryService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.fields = [
      {
        key: "country",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        props: {
          required: true,
          label: this.translateService.instant("Country"),
          placeholder: this.translateService.instant("Select a country"),
          options: this.countryService
            .getCountries(this.translateService.currentLang)
            .map(country => ({
              value: country.code,
              label: country.name
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
        }
      }
    ];
  }
}
