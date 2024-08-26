import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchAccessoryFilterComponent } from "./search-accessory-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SearchTelescopeFilterComponent", () => {
  let component: SearchAccessoryFilterComponent;
  let fixture: ComponentFixture<SearchAccessoryFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchAccessoryFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchAccessoryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
