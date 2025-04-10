import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { CountryService } from "@core/services/country.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchCountryFilterComponent } from "./search-country-filter.component";

describe("CountryFilterComponent", () => {
  let component: SearchCountryFilterComponent;
  let fixture: ComponentFixture<SearchCountryFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchCountryFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      {
        provide: CountryService,
        useValue: {
          getCountries: jest.fn().mockReturnValue([{ code: "US", name: "United States" }])
        }
      }
    ]);

    fixture = TestBed.createComponent(SearchCountryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
