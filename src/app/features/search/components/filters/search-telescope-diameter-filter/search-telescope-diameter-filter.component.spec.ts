import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchTelescopeDiameterFilterComponent } from "./search-telescope-diameter-filter.component";

describe("TelescopeDiameterFilterComponent", () => {
  let component: SearchTelescopeDiameterFilterComponent;
  let fixture: ComponentFixture<SearchTelescopeDiameterFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchTelescopeDiameterFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchTelescopeDiameterFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
