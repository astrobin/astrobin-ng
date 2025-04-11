import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";
import { ImageEditBasicFieldsService } from "@features/image/services/image-edit-basic-fields.service";
import { ImageEditContentFieldsService } from "@features/image/services/image-edit-content-fields.service";
import { ImageEditEquipmentFieldsService } from "@features/image/services/image-edit-equipment-fields.service";
import { ImageEditSettingsFieldsService } from "@features/image/services/image-edit-settings-fields.service";
import { ImageEditThumbnailFieldsService } from "@features/image/services/image-edit-thumbnail-fields.service";
import { ImageEditWatermarkFieldsService } from "@features/image/services/image-edit-watermark-fields.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { ImageEditPageComponent } from "./image-edit-page.component";

describe("EditComponent", () => {
  let component: ImageEditPageComponent;
  let fixture: ComponentFixture<ImageEditPageComponent>;
  let store: MockStore;
  const image = ImageGenerator.image();

  beforeEach(async () => {
    await MockBuilder(ImageEditPageComponent, AppModule).provide([
      ImageEditService,
      ImageEditBasicFieldsService,
      ImageEditContentFieldsService,
      ImageEditThumbnailFieldsService,
      ImageEditWatermarkFieldsService,
      ImageEditEquipmentFieldsService,
      ImageEditAcquisitionFieldsService,
      ImageEditSettingsFieldsService,
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
      },
      {
        provide: Router,
        useValue: {
          events: of()
        }
      }
    ]);

    store = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize data", () => {
    expect(component.imageEditService.model).toEqual({
      ...image,
      overrideAcquisitionForm: null
    });
  });
});
