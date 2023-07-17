import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { formlyConfig } from "@app/formly.config";
import { ObjectsInFieldComponent } from "@app/shared/components/misc/objects-in-field/objects-in-field.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModalConfig,
  NgbModalModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTooltipModule
} from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { FORMLY_CONFIG, FormlyModule } from "@ngx-formly/core";
import { FormlySelectModule } from "@ngx-formly/core/select";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { BreadcrumbComponent } from "@shared/components/misc/breadcrumb/breadcrumb.component";
import { CameraComponent } from "@shared/components/misc/camera/camera.component";
import { FormlyFieldChunkedFileComponent } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file.component";
import { FormlyFieldImageCropperComponent } from "@shared/components/misc/formly-field-image-cropper/formly-field-image-cropper.component";
import { FormlyFieldNgSelectComponent } from "@shared/components/misc/formly-field-ng-select/formly-field-ng-select.component";
import { FormlyFieldStepperComponent } from "@shared/components/misc/formly-field-stepper/formly-field-stepper.component";
import { FullscreenImageViewerComponent } from "@shared/components/misc/fullscreen-image-viewer/fullscreen-image-viewer.component";
import { ImageComponent } from "@shared/components/misc/image/image.component";
import { LoadingIndicatorComponent } from "@shared/components/misc/loading-indicator/loading-indicator.component";
import { RefreshButtonComponent } from "@shared/components/misc/refresh-button/refresh-button.component";
import { TelescopeComponent } from "@shared/components/misc/telescope/telescope.component";
import { TextLoadingIndicatorComponent } from "@shared/components/misc/text-loading-indicator/text-loading-indicator.component";
import { PipesModule } from "@shared/pipes/pipes.module";
import { NgxFilesizeModule } from "ngx-filesize";
import { ImageCropperModule } from "ngx-image-cropper";
import { NgxImageZoomModule } from "ngx-image-zoom";
import { UploadxModule } from "ngx-uploadx";
import { LoginFormComponent } from "./auth/login-form/login-form.component";
import { LoginModalComponent } from "./auth/login-modal/login-modal.component";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { EmptyListComponent } from "./misc/empty-list/empty-list.component";
import { ReadOnlyModeComponent } from "./misc/read-only-mode/read-only-mode.component";
import { UsernameComponent } from "./misc/username/username.component";
import { FormlyWrapperComponent } from "@shared/components/misc/formly-wrapper/formly-wrapper.component";
import { FormlyFieldGoogleMapComponent } from "@shared/components/misc/formly-field-google-map/formly-field-google-map.component";
import { ToggleButtonComponent } from "@shared/components/misc/toggle-button/toggle-button.component";
import { NgToggleModule } from "ng-toggle-button";
import { FormlyFieldCKEditorComponent } from "@shared/components/misc/formly-field-ckeditor/formly-field-ckeditor.component";
import { FileValueAccessorDirective } from "@shared/components/misc/formly-field-file/file-value-accessor.directive";
import { FormlyFieldFileComponent } from "@shared/components/misc/formly-field-file/formly-field-file.component";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { NothingHereComponent } from "@shared/components/misc/nothing-here/nothing-here.component";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { NestedCommentsComponent } from "@shared/components/misc/nested-comments/nested-comments.component";
import { NestedCommentComponent } from "@shared/components/misc/nested-comments/nested-comment.component";
import { TimeagoModule } from "ngx-timeago";
import { ItemBrowserComponent } from "@shared/components/equipment/item-browser/item-browser.component";
import { ItemSummaryComponent } from "@shared/components/equipment/summaries/item-summary/item-summary.component";
import { BrandSummaryComponent } from "@shared/components/equipment/summaries/brand-summary/brand-summary.component";
import { CameraEditorComponent } from "@shared/components/equipment/editors/camera-editor/camera-editor.component";
import { SensorEditorComponent } from "@shared/components/equipment/editors/sensor-editor/sensor-editor.component";
import { TelescopeEditorComponent } from "@shared/components/equipment/editors/telescope-editor/telescope-editor.component";
import { MountEditorComponent } from "@shared/components/equipment/editors/mount-editor/mount-editor.component";
import { FilterEditorComponent } from "@shared/components/equipment/editors/filter-editor/filter-editor.component";
import { SoftwareEditorComponent } from "@shared/components/equipment/editors/software-editor/software-editor.component";
import { BaseItemEditorComponent } from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { BrandEditorCardComponent } from "@shared/components/equipment/editors/brand-editor-card/brand-editor-card.component";
import { BrandEditorFormComponent } from "@shared/components/equipment/editors/brand-editor-form/brand-editor-form.component";
import { AccessoryEditorComponent } from "@shared/components/equipment/editors/accessory-editor/accessory-editor.component";
import { SimilarItemsSuggestionComponent } from "@shared/components/equipment/similar-items-suggestion/similar-items-suggestion.component";
import { ConfirmItemCreationModalComponent } from "@shared/components/equipment/editors/confirm-item-creation-modal/confirm-item-creation-modal.component";
import { OthersInBrandComponent } from "@shared/components/equipment/editors/others-in-brand/others-in-brand.component";
import { CustomToastComponent } from "@shared/components/misc/custom-toast/custom-toast.component";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import { NestedCommentsCountComponent } from "@shared/components/misc/nested-comments-count/nested-comments-count.component";
import { CountDownComponent } from "@shared/components/misc/count-down/count-down.component";
import { ScrollToTopComponent } from "@shared/components/misc/scroll-to-top/scroll-to-top.component";
import { FormlyFieldEquipmentItemBrowserComponent } from "@shared/components/misc/formly-field-equipment-item-browser/formly-field-equipment-item-browser.component";
import { FormlyEquipmentItemBrowserWrapperComponent } from "@shared/components/misc/formly-equipment-item-browser-wrapper/formly-equipment-item-browser-wrapper.component";
import { ItemSummaryModalComponent } from "@shared/components/equipment/summaries/item-summary-modal/item-summary-modal.component";
import { EquipmentItemDisplayNameComponent } from "@shared/components/equipment/equipment-item-display-name/equipment-item-display-name.component";
import { DirectivesModule } from "@shared/directives/directives.module";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { ItemUnapprovedInfoModalComponent } from "@shared/components/equipment/item-unapproved-info-modal/item-unapproved-info-modal.component";
import { VariantSelectorModalComponent } from "@shared/components/equipment/item-browser/variant-selector-modal/variant-selector-modal.component";
import { AvatarComponent } from "@shared/components/misc/avatar/avatar.component";
import { DataDoesNotUpdateInRealTimeComponent } from "@shared/components/misc/data-does-not-update-in-real-time/data-does-not-update-in-real-time.component";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { InformationDialogComponent } from "@shared/components/misc/information-dialog/information-dialog.component";
import { AssignItemModalComponent } from "@shared/components/equipment/summaries/assign-item-modal/assign-item-modal.component";
import { AssignEditProposalModalComponent } from "@shared/components/equipment/summaries/assign-edit-proposal-modal/assign-edit-proposal-modal.component";
import { ForumPreviewComponent } from "@shared/components/forums/forum-preview/forum-preview.component";
import { ImageSearchComponent } from "@shared/components/search/image-search/image-search.component";
import { MostOftenUsedWithModalComponent } from "@shared/components/equipment/summaries/item/summary/most-often-used-with-modal/most-often-used-with-modal.component";
import { RemoveAdsDialogComponent } from "@shared/components/misc/remove-ads-dialog/remove-ads-dialog.component";
import { ItemBrowserByPropertiesComponent } from "@shared/components/equipment/item-browser-by-properties/item-browser-by-properties.component";
import { HrComponent } from "@shared/components/misc/hr/hr.component";
import { NgWizardModule } from "@kronscht/ng-wizard";
import { FormlyFieldTableComponent } from "@shared/components/misc/formly-field-table/formly-field-table.component";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { FormlyFieldButtonComponent } from "@shared/components/misc/formly-field-button/formly-field-button.component";
import { FormlyCardWrapperComponent } from "@shared/components/misc/formly-card-wrapper/formly-card-wrapper.component";
import { TogglePropertyComponent } from "@shared/components/misc/toggle-property/toggle-property.component";
import { MoreRelatedItemsModalComponent } from "@shared/components/equipment/summaries/item/summary/more-related-items-modal/more-related-items-modal.component";
import { StockStatusComponent } from "@shared/components/equipment/stock-status/stock-status.component";
import { BetaBannerComponent } from "@shared/components/misc/beta-banner/beta-banner.component";

const modules = [
  CommonModule,
  DirectivesModule,
  FontAwesomeModule,
  FormsModule,
  FormlySelectModule,
  ImageCropperModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTooltipModule,
  NgSelectModule,
  NgToggleModule,
  NgxFilesizeModule,
  NgxDatatableModule,
  NgxImageZoomModule,
  NgWizardModule,
  PipesModule,
  ReactiveFormsModule,
  RouterModule,
  TimeagoModule,
  TranslateModule,
  FormlyModule,
  UploadxModule
];

const components = [
  AvatarComponent,
  BetaBannerComponent,
  BreadcrumbComponent,
  CameraComponent,
  ConfirmationDialogComponent,
  CountDownComponent,
  CustomToastComponent,
  DataDoesNotUpdateInRealTimeComponent,
  EmptyListComponent,
  FileValueAccessorDirective,
  FooterComponent,
  FormlyCardWrapperComponent,
  FormlyEquipmentItemBrowserWrapperComponent,
  FormlyFieldButtonComponent,
  FormlyFieldCKEditorComponent,
  FormlyFieldChunkedFileComponent,
  FormlyFieldEquipmentItemBrowserComponent,
  FormlyFieldFileComponent,
  FormlyFieldGoogleMapComponent,
  FormlyFieldImageCropperComponent,
  FormlyFieldNgSelectComponent,
  FormlyFieldStepperComponent,
  FormlyFieldTableComponent,
  FormlyWrapperComponent,
  ForumPreviewComponent,
  FullscreenImageViewerComponent,
  HeaderComponent,
  HrComponent,
  ImageComponent,
  ImageSearchComponent,
  InformationDialogComponent,
  LoadingIndicatorComponent,
  LoginFormComponent,
  LoginModalComponent,
  MoreRelatedItemsModalComponent,
  MostOftenUsedWithModalComponent,
  NestedCommentComponent,
  NestedCommentsComponent,
  NestedCommentsCountComponent,
  NestedCommentsModalComponent,
  NothingHereComponent,
  ObjectsInFieldComponent,
  ReadOnlyModeComponent,
  RefreshButtonComponent,
  RemoveAdsDialogComponent,
  ScrollToTopComponent,
  SubscriptionRequiredModalComponent,
  TelescopeComponent,
  TextLoadingIndicatorComponent,
  ToggleButtonComponent,
  TogglePropertyComponent,
  UsernameComponent,

  // Equipment
  AccessoryEditorComponent,
  AssignEditProposalModalComponent,
  AssignItemModalComponent,
  BaseItemEditorComponent,
  BrandEditorCardComponent,
  BrandEditorFormComponent,
  BrandSummaryComponent,
  CameraEditorComponent,
  ConfirmItemCreationModalComponent,
  EquipmentItemDisplayNameComponent,
  FilterEditorComponent,
  ItemBrowserByPropertiesComponent,
  ItemBrowserComponent,
  ItemSummaryComponent,
  ItemSummaryModalComponent,
  ItemUnapprovedInfoModalComponent,
  MountEditorComponent,
  OthersInBrandComponent,
  SensorEditorComponent,
  SimilarItemsSuggestionComponent,
  SoftwareEditorComponent,
  StockStatusComponent,
  TelescopeEditorComponent,
  VariantSelectorModalComponent
];

const services = [UsernameService];

@NgModule({
  imports: [modules],
  declarations: components,
  exports: components,
  providers: [
    {
      provide: FORMLY_CONFIG,
      useFactory: formlyConfig,
      multi: true,
      deps: [TranslateService, JsonApiService]
    },
    ...services
  ]
})
export class ComponentsModule {
  constructor(public readonly modalConfig: NgbModalConfig) {
    modalConfig.centered = true;
  }
}
