import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchMountWeightFilterComponent } from "./search-mount-weight-filter.component";

describe("MountWeightFilterComponent", () => {
  let component: SearchMountWeightFilterComponent;
  let fixture: ComponentFixture<SearchMountWeightFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchMountWeightFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchMountWeightFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
