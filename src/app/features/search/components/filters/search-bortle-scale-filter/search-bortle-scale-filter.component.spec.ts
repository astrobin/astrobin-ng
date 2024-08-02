import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchBortleScaleFilterComponent } from "./search-bortle-scale-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("BortleScaleFilterComponent", () => {
  let component: SearchBortleScaleFilterComponent;
  let fixture: ComponentFixture<SearchBortleScaleFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchBortleScaleFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchBortleScaleFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
