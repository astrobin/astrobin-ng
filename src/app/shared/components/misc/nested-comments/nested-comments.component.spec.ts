import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { ContentTypeGenerator } from "@shared/generators/content-type.generator";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { NestedCommentsComponent } from "./nested-comments.component";

describe("NestedCommentsComponent", () => {
  let component: NestedCommentsComponent;
  let fixture: ComponentFixture<NestedCommentsComponent>;

  beforeEach(async () => {
    await MockBuilder(NestedCommentsComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      provideMockActions(() => new ReplaySubject<any>()),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            fragment: ""
          }
        }
      }
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestedCommentsComponent);
    component = fixture.componentInstance;
    component.contentType = ContentTypeGenerator.contentType();
    component.objectId = 1;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
