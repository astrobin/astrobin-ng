import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ImageSearchCardComponent } from "./image-search-card.component";

describe("ImageSearchComponent", () => {
  let component: ImageSearchCardComponent;
  let fixture: ComponentFixture<ImageSearchCardComponent>;

  beforeEach(async () => {
    await MockBuilder(ImageSearchCardComponent, AppModule).provide([
      WindowRefService,
      provideMockStore({ initialState: initialMainState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageSearchCardComponent);
    component = fixture.componentInstance;
    component.model = {};
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
