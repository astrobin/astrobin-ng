import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ForumPostSearchComponent } from "./forum-post-search.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("ForumPostSearchComponent", () => {
  let component: ForumPostSearchComponent;
  let fixture: ComponentFixture<ForumPostSearchComponent>;

  beforeEach(async () => {
    await MockBuilder(ForumPostSearchComponent, AppModule).provide([WindowRefService, provideMockStore({ initialState: initialMainState })]);
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
