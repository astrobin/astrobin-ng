import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BrandExplorerPageComponent } from "./brand-explorer-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";
import { ActivatedRoute, Router } from "@angular/router";
import { EMPTY, ReplaySubject } from "rxjs";
import { provideMockActions } from "@ngrx/effects/testing";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("BrandExplorerPageComponent", () => {
  let component: BrandExplorerPageComponent;
  let fixture: ComponentFixture<BrandExplorerPageComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandExplorerPageComponent, EquipmentModule)
      .mock(AppModule, { export: true })
      .provide([
        WindowRefService,
        provideMockStore({ initialState }),
        provideMockActions(() => new ReplaySubject<any>()),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                has: jest.fn(),
                get: jest.fn(),
                getAll: jest.fn(),
                keys: []
              },
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
      ])
      .mock(ItemTypeNavComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandExplorerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
