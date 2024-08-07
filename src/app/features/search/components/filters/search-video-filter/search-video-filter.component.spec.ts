import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchVideoFilterComponent } from "./search-video-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("VideoFilterComponent", () => {
  let component: SearchVideoFilterComponent;
  let fixture: ComponentFixture<SearchVideoFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchVideoFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchVideoFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
