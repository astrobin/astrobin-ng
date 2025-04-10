import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { NestedCommentSearchComponent } from "./nested-comment-search.component";

describe("ForumPostSearchComponent", () => {
  let component: NestedCommentSearchComponent;
  let fixture: ComponentFixture<NestedCommentSearchComponent>;

  beforeEach(async () => {
    await MockBuilder(NestedCommentSearchComponent, AppModule).provide([
      WindowRefService,
      provideMockStore({ initialState: initialMainState })
    ]);
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
