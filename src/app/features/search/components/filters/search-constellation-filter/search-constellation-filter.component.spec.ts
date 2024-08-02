import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchConstellationFilterComponent } from "./search-constellation-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { ConstellationsService } from "@features/explore/services/constellations.service";

describe("ConstellationFilterComponent", () => {
  let component: SearchConstellationFilterComponent;
  let fixture: ComponentFixture<SearchConstellationFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchConstellationFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      {
        provide: ConstellationsService,
        useValue: {
          getConstellations: () => []
        }
      }
    ]);

    fixture = TestBed.createComponent(SearchConstellationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
