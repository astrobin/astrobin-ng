import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { NgbModalRef, NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { TranslateService } from "@ngx-translate/core";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { NestedCommentsModalComponent } from "./nested-comments-modal.component";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";

describe("NestedCommentsModalComponent", () => {
  let component: NestedCommentsModalComponent;
  let fixture: ComponentFixture<NestedCommentsModalComponent>;
  let mockModalService: jest.Mocked<Partial<NgbModal>>;
  let mockActiveModal: jest.Mocked<Partial<NgbActiveModal>>;
  let mockModalRef: Partial<NgbModalRef>;
  let translateService: jest.Mocked<Partial<TranslateService>>;

  // Create a mock ContentTypeInterface
  const mockContentType: ContentTypeInterface = {
    id: 1,
    appLabel: "test_app",
    model: "test_model"
  };

  beforeEach(async () => {
    mockModalRef = {
      componentInstance: {},
      closed: of(true),
      dismissed: of(false)
    };

    mockModalService = {
      open: jest.fn().mockReturnValue(mockModalRef)
    };

    mockActiveModal = {
      dismiss: jest.fn(),
      close: jest.fn()
    };

    translateService = {
      instant: jest.fn(key => key)
    };

    await MockBuilder(NestedCommentsModalComponent, AppModule)
      .provide({
        provide: NgbActiveModal,
        useValue: mockActiveModal
      })
      .provide({
        provide: NgbModal,
        useValue: mockModalService
      })
      .provide({
        provide: TranslateService,
        useValue: translateService
      })
      .provide(provideMockStore());
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestedCommentsModalComponent);
    component = fixture.componentInstance;

    // Setup minimal required inputs
    component.contentType = mockContentType;
    component.objectId = 123;

    // Mock the NestedCommentsComponent
    component.nestedCommentsComponent = {
      isDirty: jest.fn().mockReturnValue(false)
    } as any;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("isDirty", () => {
    it("should return false when no forms are dirty", () => {
      component.isFormDirty = false;
      jest.spyOn(component.nestedCommentsComponent, "isDirty").mockReturnValue(false);

      expect(component.isDirty()).toBe(false);
    });

    it("should return true when top level form is dirty", () => {
      component.isFormDirty = true;
      jest.spyOn(component.nestedCommentsComponent, "isDirty").mockReturnValue(false);

      expect(component.isDirty()).toBe(true);
    });

    it("should return true when a nested comment form is dirty", () => {
      component.isFormDirty = false;
      jest.spyOn(component.nestedCommentsComponent, "isDirty").mockReturnValue(true);

      expect(component.isDirty()).toBe(true);
    });
  });

  describe("handleClose", () => {
    it("should call modal.dismiss", () => {
      component.handleClose();
      expect(mockActiveModal.dismiss).toHaveBeenCalled();
    });
  });

  describe("confirmDismissIfDirty", () => {
    it("should return true immediately if not dirty", async () => {
      jest.spyOn(component, "isDirty").mockReturnValue(false);

      const result = await component.confirmDismissIfDirty();

      expect(result).toBe(true);
      expect(mockModalService.open).not.toHaveBeenCalled();
    });

    it("should open confirmation dialog if dirty", async () => {
      jest.spyOn(component, "isDirty").mockReturnValue(true);

      await component.confirmDismissIfDirty();

      expect(mockModalService.open).toHaveBeenCalledWith(ConfirmationDialogComponent);
    });
  });

  describe("static open method", () => {
    it("should open modal with correct options", () => {
      // Use the unknown type assertion to bypass TypeScript's type checking
      const modalRef = NestedCommentsModalComponent.open(mockModalService as unknown as NgbModal, {
        contentType: mockContentType,
        objectId: 123
      });

      expect(mockModalService.open).toHaveBeenCalled();

      // Verify component instance properties are set
      expect(modalRef.componentInstance.contentType).toBe(mockContentType);
      expect(modalRef.componentInstance.objectId).toBe(123);
    });

    it("should use custom size if provided", () => {
      NestedCommentsModalComponent.open(mockModalService as unknown as NgbModal, {
        contentType: mockContentType,
        objectId: 123,
        size: "xxl"
      });

      // Get the options passed to the open method
      const options = mockModalService.open.mock.calls[0][1];
      expect(options.size).toBe("xxl");
    });

    it("should use default size if not provided", () => {
      NestedCommentsModalComponent.open(mockModalService as unknown as NgbModal, {
        contentType: mockContentType,
        objectId: 123
      });

      // Get the options passed to the open method
      const options = mockModalService.open.mock.calls[0][1];
      expect(options.size).toBe("lg");
    });

    it("should add beforeDismiss handler", () => {
      NestedCommentsModalComponent.open(mockModalService as unknown as NgbModal, {
        contentType: mockContentType,
        objectId: 123
      });

      // Get the options passed to the open method
      const options = mockModalService.open.mock.calls[0][1];
      expect(typeof options.beforeDismiss).toBe("function");
    });
  });
});
