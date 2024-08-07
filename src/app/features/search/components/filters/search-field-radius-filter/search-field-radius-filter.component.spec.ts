import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchFieldRadiusFilterComponent } from "./search-field-radius-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
