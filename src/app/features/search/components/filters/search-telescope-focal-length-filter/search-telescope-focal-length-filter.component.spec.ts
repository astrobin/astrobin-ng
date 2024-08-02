import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchTelescopeFocalLengthFilterComponent } from "./search-telescope-focal-length-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("TelescopeFocalLengthFilterComponent", () => {
  let component: SearchTelescopeFocalLengthFilterComponent;
  let fixture: ComponentFixture<SearchTelescopeFocalLengthFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchTelescopeFocalLengthFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchTelescopeFocalLengthFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
