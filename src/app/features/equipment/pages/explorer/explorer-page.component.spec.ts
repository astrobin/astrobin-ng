import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExplorerPageComponent } from "./explorer-page.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";
import { ActivatedRoute, Router } from "@angular/router";
import { EMPTY, ReplaySubject } from "rxjs";
import { provideMockActions } from "@ngrx/effects/testing";
import { ExplorerComponent } from "@features/equipment/components/explorer/explorer.component";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";

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
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: key => "camera" }
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
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
