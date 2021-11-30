import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";
import { ImageEditPageComponent } from "./image-edit-page.component";
import { WatermarkPositionOptions, WatermarkSizeOptions } from "@shared/interfaces/image.interface";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { ImageEditBasicFieldsService } from "@features/image/services/image-edit-basic-fields.service";
import { ImageEditContentFieldsService } from "@features/image/services/image-edit-content-fields.service";
import { ImageEditWatermarkFieldsService } from "@features/image/services/image-edit-watermark-fields.service";
import { ImageEditThumbnailFieldsService } from "@features/image/services/image-edit-thumbnail-fields.service";
import { ImageEditSettingsFieldsService } from "@features/image/services/image-edit-settings-fields.service";
import { ImageEditEquipmentFieldsService } from "@features/image/services/image-edit-equipment-fields.service";

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
      ImageEditSettingsFieldsService,
      provideMockStore({ initialState }),
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
    fixture = TestBed.createComponent(ImageEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize data", () => {
    expect(component.imageEditService.image).toEqual(image);
    expect(component.imageEditService.model).toEqual(image);
  });

  it("should initialize watermark settings from profile defaults if empty", () => {
    image.watermark = false;
    image.watermarkText = null;
    image.watermarkPosition = WatermarkPositionOptions.CENTER;
    image.watermarkSize = WatermarkSizeOptions.MEDIUM;
    image.watermarkOpacity = 10;

    store.setState({
      ...initialState,
      ...{
        auth: {
          ...initialState.auth,
          ...{
            userProfile: {
              ...initialState.auth.userProfile,
              ...{
                defaultWatermark: true,
                defaultWatermarkText: "My watermark",
                defaultWatermarkPosition: WatermarkPositionOptions.TOP_RIGHT,
                defaultWatermarkSize: WatermarkSizeOptions.SMALL,
                defaultWatermarkOpacity: 20
              }
            }
          }
        }
      }
    });

    component.ngOnInit();

    expect(component.imageEditService.model.watermark).toBe(true);
    expect(component.imageEditService.model.watermarkText).toEqual("My watermark");
    expect(component.imageEditService.model.watermarkPosition).toEqual(WatermarkPositionOptions.TOP_RIGHT);
    expect(component.imageEditService.model.watermarkSize).toEqual(WatermarkSizeOptions.SMALL);
    expect(component.imageEditService.model.watermarkOpacity).toEqual(20);
  });
});
