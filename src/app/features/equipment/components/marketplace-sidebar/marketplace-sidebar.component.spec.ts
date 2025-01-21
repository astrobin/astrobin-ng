import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceSidebarComponent } from "./marketplace-sidebar.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { MarketplaceNavComponent } from "@features/equipment/components/marketplace-nav/marketplace-nav.component";
import { MarketplaceFilterComponent } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";

describe("MarketplaceSidebarComponent", () => {
  let component: MarketplaceSidebarComponent;
  let fixture: ComponentFixture<MarketplaceSidebarComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceSidebarComponent, AppModule)
      .mock(MarketplaceNavComponent, { export: true })
      .mock(MarketplaceFilterComponent, { export: true })
      .provide([provideMockStore({ initialState: initialMainState })]);

    fixture = TestBed.createComponent(MarketplaceSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
