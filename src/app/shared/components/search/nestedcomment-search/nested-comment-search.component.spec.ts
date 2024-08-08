import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NestedCommentSearchComponent } from "./nested-comment-search.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("ForumPostSearchComponent", () => {
  let component: NestedCommentSearchComponent;
  let fixture: ComponentFixture<NestedCommentSearchComponent>;

  beforeEach(async () => {
    await MockBuilder(NestedCommentSearchComponent, AppModule).provide([WindowRefService, provideMockStore({ initialState: initialMainState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestedCommentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
