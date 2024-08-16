import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";
import { ImagePageComponent } from "./image-page.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { ImageComponent } from "@shared/components/misc/image/image.component";

describe("ImageComponent", () => {
  let component: ImagePageComponent;
  let fixture: ComponentFixture<ImagePageComponent>;
  let store: MockStore;
  const image = ImageGenerator.image();

  beforeEach(async () => {
    await MockBuilder(ImageComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: {
              image
            }
          },
          fragment: of("1")
        }
      }
    ]);

    store = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
