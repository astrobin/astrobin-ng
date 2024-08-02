import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchPixelScaleFilterComponent } from "./search-pixel-scale-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
