import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchTelescopeDiameterFilterComponent } from "./search-telescope-diameter-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
