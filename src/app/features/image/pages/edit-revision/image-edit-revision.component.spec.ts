import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";
import { ImageEditRevisionPageComponent } from "./image-edit-revision-page.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { ImageEditSettingsFieldsService } from "@features/image/services/image-edit-settings-fields.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { FINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";

describe("ImageEditRevisionComponent", () => {
  let component: ImageEditRevisionPageComponent;
  let fixture: ComponentFixture<ImageEditRevisionPageComponent>;
  let store: MockStore;
  const image = ImageGenerator.image();
  image.thumbnails = [
    {
      id: 1,
      alias: ImageAlias.GALLERY,
      revision: FINAL_REVISION_LABEL,
      url: "/media/images/generated.jpg"
    }
  ];
  image.revisions = [
    {
      pk: 1,
      uploaded: new Date().toISOString(),
      image: image.pk,
      imageFile: null,
      videoFile: null,
      encodedVideoFile: null,
      loopVideo: null,
      title: null,
      description: null,
      skipNotifications: false,
      label: "B",
      isFinal: false,
      w: 1000,
      h: 1000,
      uploaderInProgress: false,
      solution: null,
      constellation: null,
      thumbnails: [
        {
          id: 2,
          revision: "B",
          alias: ImageAlias.HD,
          url: "/media/images/generated.jpg"
        }
      ],
      mouseHoverImage: null,
      squareCropping: "0,0,1000,1000"
    }
  ]

  beforeEach(async () => {
    await MockBuilder(ImageEditRevisionPageComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      ImageEditService,
      ImageEditSettingsFieldsService,
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: {
              image
            },
            params: {
              revisionLabel: "B"
            }
          },
          fragment: of("1")
        }
      }
    ]);

    store = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageEditRevisionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
