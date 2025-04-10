import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { CountrySelectionModalComponent } from "./country-selection-modal.component";

describe("CountrySelectionModalComponent", () => {
  let component: CountrySelectionModalComponent;
  let fixture: ComponentFixture<CountrySelectionModalComponent>;

  beforeEach(async () => {
    await MockBuilder(CountrySelectionModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      NgbActiveModal
    ]);

    fixture = TestBed.createComponent(CountrySelectionModalComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.translateService, "currentLang", "get").mockReturnValue("en");
    jest.spyOn(component.countryService, "getCountries").mockReturnValue([{ code: "US", name: "United States" }]);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
