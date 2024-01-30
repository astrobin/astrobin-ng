import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceMoreFromUserComponent } from "./marketplace-more-from-user.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceMmoreFromUserComponent", () => {
  let component: MarketplaceMoreFromUserComponent;
  let fixture: ComponentFixture<MarketplaceMoreFromUserComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceMoreFromUserComponent, AppModule).provide([
      provideMockStore({ initialState })
    ]);

    fixture = TestBed.createComponent(MarketplaceMoreFromUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
