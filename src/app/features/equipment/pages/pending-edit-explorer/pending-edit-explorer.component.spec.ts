import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PendingEditExplorerComponent } from "./pending-edit-explorer.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";
import { ActivatedRoute, Router } from "@angular/router";
import { EMPTY, of, ReplaySubject } from "rxjs";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";
import { ItemBrowserComponent } from "@shared/components/equipment/item-browser/item-browser.component";
import { provideMockActions } from "@ngrx/effects/testing";

describe("EditProposalExplorerComponent", () => {
  let component: PendingEditExplorerComponent;
  let fixture: ComponentFixture<PendingEditExplorerComponent>;

  beforeEach(async () => {
    await MockBuilder(PendingEditExplorerComponent, AppModule)
      .mock(ItemTypeNavComponent, { export: true })
      .mock(ItemBrowserComponent)
      .provide([
        provideMockStore({ initialState }),
        provideMockActions(() => new ReplaySubject<any>()),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: key => "camera" },
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
    fixture = TestBed.createComponent(PendingEditExplorerComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.equipmentApiService, "getAllEquipmentItemsPendingEdit").mockReturnValue(
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
