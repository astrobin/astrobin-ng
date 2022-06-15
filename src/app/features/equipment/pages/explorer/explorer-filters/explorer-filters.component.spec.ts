import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExplorerFiltersComponent } from "./explorer-filters.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ExplorerFiltersComponent", () => {
  let component: ExplorerFiltersComponent;
  let fixture: ComponentFixture<ExplorerFiltersComponent>;

  beforeEach(async () => {
    await MockBuilder(ExplorerFiltersComponent, AppModule).provide([provideMockStore({ initialState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorerFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
