import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExplorerPageComponent } from "./explorer-page.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";
import { ActivatedRoute, Router } from "@angular/router";
import { EMPTY, of, ReplaySubject } from "rxjs";
import { provideMockActions } from "@ngrx/effects/testing";
import { ExplorerComponent } from "@features/equipment/components/explorer/explorer.component";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";
import { UtilsService } from "@shared/services/utils/utils.service";

describe("ExplorerComponent", () => {
  let component: ExplorerPageComponent;
  let fixture: ComponentFixture<ExplorerPageComponent>;

  beforeEach(async () => {
    await MockBuilder(ExplorerPageComponent, AppModule)
      .mock(ItemTypeNavComponent)
      .mock(ExplorerComponent)
      .provide([
        provideMockStore({ initialState }),
        provideMockActions(() => new ReplaySubject<any>()),
        UtilsService,
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
    fixture = TestBed.createComponent(ExplorerPageComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.equipmentApiService, "findAllEquipmentItems").mockReturnValue(
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
