import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchVideoFilterComponent } from "./search-video-filter.component";

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
