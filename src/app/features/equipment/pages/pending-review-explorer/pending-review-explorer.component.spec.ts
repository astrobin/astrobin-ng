import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { ItemBrowserComponent } from "@shared/components/equipment/item-browser/item-browser.component";
import { MockBuilder } from "ng-mocks";
import { EMPTY, of, ReplaySubject } from "rxjs";

import { PendingReviewExplorerComponent } from "./pending-review-explorer.component";

describe("EditProposalExplorerComponent", () => {
  let component: PendingReviewExplorerComponent;
  let fixture: ComponentFixture<PendingReviewExplorerComponent>;

  beforeEach(async () => {
    await MockBuilder(PendingReviewExplorerComponent, AppModule)
      .mock(ItemTypeNavComponent, { export: true })
      .mock(ItemBrowserComponent)
      .provide([
        provideMockStore({ initialState: initialMainState }),
        provideMockActions(() => new ReplaySubject<any>()),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => "camera" },
              queryParamMap: {
                has: jest.fn(),
                get: jest.fn(),
                getAll: jest.fn(),
                keys: []
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            events: EMPTY
          }
        }
      ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingReviewExplorerComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.equipmentApiService, "getAllEquipmentItemsPendingReview").mockReturnValue(
      of({
        count: 0,
        next: null,
        prev: null,
        results: []
      })
    );

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
