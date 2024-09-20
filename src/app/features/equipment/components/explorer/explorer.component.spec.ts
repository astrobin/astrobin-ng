import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExplorerComponent } from "./explorer.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { EMPTY, ReplaySubject } from "rxjs";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";
import { ItemBrowserComponent } from "@shared/components/equipment/item-browser/item-browser.component";
import { ItemEditProposalComponent } from "@features/equipment/components/item-edit-proposal/item-edit-proposal.component";
import { Router } from "@angular/router";

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
