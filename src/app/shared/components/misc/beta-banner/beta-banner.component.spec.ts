import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BetaBannerComponent } from "./beta-banner.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { WindowRefService } from "@core/services/window-ref.service";

describe("BetaBannerComponent", () => {
  let component: BetaBannerComponent;
  let fixture: ComponentFixture<BetaBannerComponent>;

  beforeEach(async () => {
    await MockBuilder(BetaBannerComponent, AppModule).provide([WindowRefService, provideMockStore({ initialState: initialMainState })]);

    fixture = TestBed.createComponent(BetaBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
