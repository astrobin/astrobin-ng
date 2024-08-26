import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchSoftwareFilterComponent } from "./search-software-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SearchTelescopeFilterComponent", () => {
  let component: SearchSoftwareFilterComponent;
  let fixture: ComponentFixture<SearchSoftwareFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchSoftwareFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchSoftwareFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
