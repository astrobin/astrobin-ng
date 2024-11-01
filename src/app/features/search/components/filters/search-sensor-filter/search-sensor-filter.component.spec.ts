import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchSensorFilterComponent } from "./search-sensor-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SearchSensorFilterComponent", () => {
  let component: SearchSensorFilterComponent;
  let fixture: ComponentFixture<SearchSensorFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchSensorFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchSensorFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
