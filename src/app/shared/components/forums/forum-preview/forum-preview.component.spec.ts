import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { ForumPreviewComponent } from "./forum-preview.component";

describe("ForumPreviewComponent", () => {
  let component: ForumPreviewComponent;
  let fixture: ComponentFixture<ForumPreviewComponent>;

  beforeEach(async () => {
    await MockBuilder(ForumPreviewComponent, AppModule).provide([provideMockStore({ initialState: initialMainState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumPreviewComponent);
    component = fixture.componentInstance;

    jest
      .spyOn(component.forumApiService, "latestTopics")
      .mockReturnValueOnce(of({ count: 0, next: null, prev: null, results: [] }));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
