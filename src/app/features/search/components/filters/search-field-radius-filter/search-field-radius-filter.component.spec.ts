import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchFieldRadiusFilterComponent } from "./search-field-radius-filter.component";

describe("FieldRadiusSizeFilterComponent", () => {
  let component: SearchFieldRadiusFilterComponent;
  let fixture: ComponentFixture<SearchFieldRadiusFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchFieldRadiusFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchFieldRadiusFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
