import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchMountFilterComponent } from "./search-mount-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SearchTelescopeFilterComponent", () => {
  let component: SearchMountFilterComponent;
  let fixture: ComponentFixture<SearchMountFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchMountFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchMountFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
