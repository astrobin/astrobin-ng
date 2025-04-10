import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { EMPTY, ReplaySubject } from "rxjs";

import { BrandExplorerPageComponent } from "./brand-explorer-page.component";

describe("BrandExplorerPageComponent", () => {
  let component: BrandExplorerPageComponent;
  let fixture: ComponentFixture<BrandExplorerPageComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandExplorerPageComponent, EquipmentModule)
      .mock(AppModule, { export: true })
      .provide([
        WindowRefService,
        provideMockStore({ initialState: initialMainState }),
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
