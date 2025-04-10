import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { ItemEditProposalComponent } from "@features/equipment/components/item-edit-proposal/item-edit-proposal.component";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { ItemBrowserComponent } from "@shared/components/equipment/item-browser/item-browser.component";
import { MockBuilder } from "ng-mocks";
import { EMPTY, ReplaySubject } from "rxjs";

import { ExplorerComponent } from "./explorer.component";

describe("ExplorerComponent", () => {
  let component: ExplorerComponent;
  let fixture: ComponentFixture<ExplorerComponent>;

  beforeEach(async () => {
    await MockBuilder(ExplorerComponent, AppModule)
      .provide([
        provideMockStore({ initialState: initialMainState }),
        provideMockActions(() => new ReplaySubject<any>()),
        {
          provide: Router,
          useValue: {
            events: EMPTY
          }
        }
      ])
      .mock(ItemTypeNavComponent, { export: true })
      .mock(ItemBrowserComponent)
      .mock(ItemEditProposalComponent, { export: true });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
