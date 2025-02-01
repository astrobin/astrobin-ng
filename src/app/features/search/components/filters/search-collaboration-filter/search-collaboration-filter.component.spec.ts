import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchCollaborationFilterComponent } from "./search-collaboration-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("CollaborationFilterComponent", () => {
  let component: SearchCollaborationFilterComponent;
  let fixture: ComponentFixture<SearchCollaborationFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchCollaborationFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchCollaborationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
