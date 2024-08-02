import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchMountWeightFilterComponent } from "./search-mount-weight-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
