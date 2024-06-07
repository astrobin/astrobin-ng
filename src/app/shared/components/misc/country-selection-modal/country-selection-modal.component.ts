import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CountryService } from "@shared/services/country.service";

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
    public readonly store$: Store<State>,
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
          options: this.countryService.getCountries(this.translateService.currentLang).map(country => ({
            value: country.code,
            label: country.name
          }))
        }
      }
    ];
  }
}
