import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CountrySelectionModalComponent } from "./country-selection-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("CountrySelectionModalComponent", () => {
  let component: CountrySelectionModalComponent;
  let fixture: ComponentFixture<CountrySelectionModalComponent>;

  beforeEach(async () => {
    await MockBuilder(CountrySelectionModalComponent, AppModule).provide([
      provideMockStore({ initialState })
    ]);

    fixture = TestBed.createComponent(CountrySelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
