import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MarketplaceFilterComponent } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { MarketplaceNavComponent } from "@features/equipment/components/marketplace-nav/marketplace-nav.component";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceSidebarComponent } from "./marketplace-sidebar.component";

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
