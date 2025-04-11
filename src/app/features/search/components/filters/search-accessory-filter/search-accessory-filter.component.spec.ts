import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchAccessoryFilterComponent } from "./search-accessory-filter.component";

describe("SearchAccessoryFilterComponent", () => {
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
