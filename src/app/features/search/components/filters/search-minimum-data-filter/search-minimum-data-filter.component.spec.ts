import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchMinimumDataFilterComponent } from "./search-minimum-data-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("MinimumDataFilterComponent", () => {
  let component: SearchMinimumDataFilterComponent;
  let fixture: ComponentFixture<SearchMinimumDataFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchMinimumDataFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchMinimumDataFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
