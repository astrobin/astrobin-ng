import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchLicenseFilterComponent } from "./search-license-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("LicenseFilterComponent", () => {
  let component: SearchLicenseFilterComponent;
  let fixture: ComponentFixture<SearchLicenseFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchLicenseFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchLicenseFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
