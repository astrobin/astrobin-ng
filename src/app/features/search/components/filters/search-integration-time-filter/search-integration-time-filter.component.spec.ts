import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchIntegrationTimeFilterComponent } from "./search-integration-time-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("IntegrationTimeSizeFilterComponent", () => {
  let component: SearchIntegrationTimeFilterComponent;
  let fixture: ComponentFixture<SearchIntegrationTimeFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchIntegrationTimeFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchIntegrationTimeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
