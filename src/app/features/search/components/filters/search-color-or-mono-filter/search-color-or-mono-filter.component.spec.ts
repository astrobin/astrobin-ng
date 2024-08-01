import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchColorOrMonoFilterComponent } from "./search-color-or-mono-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("ColorOrMonoFilterComponent", () => {
  let component: SearchColorOrMonoFilterComponent;
  let fixture: ComponentFixture<SearchColorOrMonoFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchColorOrMonoFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchColorOrMonoFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
