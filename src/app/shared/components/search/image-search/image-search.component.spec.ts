import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ImageSearchComponent } from "./image-search.component";

describe("ImageSearchComponent", () => {
  let component: ImageSearchComponent;
  let fixture: ComponentFixture<ImageSearchComponent>;

  beforeEach(async () => {
    await MockBuilder(ImageSearchComponent, AppModule).provide([
      WindowRefService,
      provideMockStore({ initialState: initialMainState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
