import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchPixelScaleFilterComponent } from "./search-pixel-scale-filter.component";

describe("PixelScaleFilterComponent", () => {
  let component: SearchPixelScaleFilterComponent;
  let fixture: ComponentFixture<SearchPixelScaleFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchPixelScaleFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchPixelScaleFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
