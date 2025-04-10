import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ForumPostSearchComponent } from "./forum-post-search.component";

describe("ForumPostSearchComponent", () => {
  let component: ForumPostSearchComponent;
  let fixture: ComponentFixture<ForumPostSearchComponent>;

  beforeEach(async () => {
    await MockBuilder(ForumPostSearchComponent, AppModule).provide([
      WindowRefService,
      provideMockStore({ initialState: initialMainState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumPostSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
