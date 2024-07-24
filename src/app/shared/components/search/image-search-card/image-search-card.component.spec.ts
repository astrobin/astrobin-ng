import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ImageSearchCardComponent } from "./image-search-card.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("ImageSearchComponent", () => {
  let component: ImageSearchCardComponent;
  let fixture: ComponentFixture<ImageSearchCardComponent>;

  beforeEach(async () => {
    await MockBuilder(ImageSearchCardComponent, AppModule).provide([WindowRefService, provideMockStore({ initialState: initialMainState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageSearchCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
