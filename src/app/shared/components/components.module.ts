import { CommonModule, NgOptimizedImage } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbAccordionModule, NgbCarouselModule, NgbCollapseModule, NgbDropdownModule, NgbModalConfig, NgbModalModule, NgbNavModule, NgbOffcanvasModule, NgbPaginationModule, NgbPopoverModule, NgbProgressbarModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormlyModule } from "@ngx-formly/core";
import { FormlySelectModule } from "@ngx-formly/core/select";
import { TranslateModule } from "@ngx-translate/core";
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
import { ImageSearchBrandListingMessagePipe, ImageSearchComponent, ImageSearchItemListingMessagePipe } from "@shared/components/search/image-search/image-search.component";
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
import { StockStatusComponent } from "@shared/components/equipment/stock-status/stock-status.component";
import { FormlyFieldToggleComponent } from "@shared/components/misc/formly-field-toggle/formly-field-toggle.component";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";
import { FormlyFieldArrayComponent } from "@shared/components/misc/formly-field-array/formly-field-array.component";
import { PrivateInformationComponent } from "@shared/components/misc/private-information/private-information.component";
import { FormlyFieldCustomNumberComponent } from "@shared/components/misc/formly-field-custom-number/formly-field-custom-number.component";
import { CountrySelectionModalComponent } from "@shared/components/misc/country-selection-modal/country-selection-modal.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { FormlyFieldCustomRadioComponent } from "@shared/components/misc/formly-field-custom-radio/formly-field-custom-radio.component";
import { ImageSearchCardComponent } from "@shared/components/search/image-search-card/image-search-card.component";
import { FormlyFieldSliderComponent } from "@shared/components/misc/formly-field-slider/formly-field-slider.component";
import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { ForumPostSearchComponent } from "@shared/components/search/forum-post-search/forum-post-search.component";
import { NestedCommentSearchComponent } from "@shared/components/search/nestedcomment-search/nested-comment-search.component";
import { MobileMenuComponent } from "@shared/components/mobile-menu/mobile-menu.component";
import { ImageViewerComponent } from "@shared/components/misc/image-viewer/image-viewer.component";
import { ImageViewerTitleComponent } from "@shared/components/misc/image-viewer/image-viewer-title.component";
import { ImageViewerPhotographersComponent } from "@shared/components/misc/image-viewer/image-viewer-photographers.component";
import { ImageViewerDataSourceComponent } from "@shared/components/misc/image-viewer/image-viewer-data-source.component";
import { ImageViewerAcquisitionComponent } from "@shared/components/misc/image-viewer/image-viewer-acquisition.component";
import { ImageViewerAcquisitionDatesComponent } from "@shared/components/misc/image-viewer/image-viewer-acquisition-dates.component";
import { ImageViewerAcquisitionCsvExportComponent } from "@shared/components/misc/image-viewer/image-viewer-acquisition-csv-export.component";
import { ImageViewerAstrometryComponent } from "@shared/components/misc/image-viewer/image-viewer-astrometry.component";
import { ImageViewerEquipmentComponent } from "@shared/components/misc/image-viewer/image-viewer-equipment.component";
import { ImageViewerRevisionsComponent } from "@shared/components/misc/image-viewer/image-viewer-revisions.component";
import { HammerModule } from "@angular/platform-browser";
import { LightboxModule } from "ngx-lightbox";
import { ImageViewerWipBannerComponent } from "@shared/components/misc/image-viewer/image-viewer-wip-banner.component";
import { ImageViewerMenuComponent } from "@shared/components/misc/image-viewer/image-viewer-menu.component";
import { LoadingDialogComponent } from "@shared/components/misc/loading-dialog/loading-dialog.component";
import { ImageViewerGroupsAndCollectionsComponent } from "@shared/components/misc/image-viewer/image-viewer-groups-and-collections.component";
import { ImageViewerCustomMessageBannerComponent } from "@shared/components/misc/image-viewer/image-viewer-custom-message-banner.component";
import { ImageViewerPlateSolvingBannerComponent } from "@shared/components/misc/image-viewer/image-viewer-plate-solving-banner.component";
import { ImageViewerCloseButtonComponent } from "@shared/components/misc/image-viewer/image-viewer-close-button.component";
import { ImageViewerAdditionalButtonComponent } from "@shared/components/misc/image-viewer/image-viewer-additional-buttons.component";
import { ImageViewerAdjustmentsEditorComponent } from "@shared/components/misc/image-viewer/image-viewer-adjustments-editor.component";
import { AdManagerComponent } from "@shared/components/misc/ad-manager/ad-manager.component";
import { AutoSizeInputModule } from "ngx-autosize-input";
import { ImageViewerObjectsComponent } from "@shared/components/misc/image-viewer/image-viewer-objects.component";
import { UserSearchComponent } from "@shared/components/search/user-search/user-search.component";
import { ImageViewerRevisionSummaryComponent } from "@shared/components/misc/image-viewer/image-viewer-revision-summary.component";
import { ImageViewerSocialButtonsComponent } from "@shared/components/misc/image-viewer/image-viewer-social-buttons.component";
import { ImageViewerFloatingTitleComponent } from "@shared/components/misc/image-viewer/image-viewer-floating-title.component";
import { ImageViewerShareButtonComponent } from "@shared/components/misc/image-viewer/image-viewer-share-button.component";
import { ImageViewerIotdBannerComponent } from "@shared/components/misc/image-viewer/image-viewer-iotd-banner.component";
import { ImageViewerSlideshowComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow.component";
import { ImageViewerSlideshowContextComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow-context.component";
import { ImageLoadingIndicatorComponent } from "@shared/components/misc/image-loading-indicator/image-loading-indicator.component";
import { MarketplaceListingCardComponent } from "@shared/components/equipment/marketplace-listing-card/marketplace-listing-card.component";
import { MarketplaceListingCardsComponent } from "@shared/components/equipment/marketplace-listing-cards/marketplace-listing-cards.component";
import { EquipmentPresetComponent } from "@shared/components/equipment/preset/equipment-preset.component";
import { EquipmentPresetEditorComponent } from "@shared/components/equipment/preset-editor/equipment-preset-editor.component";
import { EquipmentPresetSummaryComponent } from "@shared/components/equipment/preset-summary/equipment-preset-summary.component";
import { ImageIconsComponent } from "@shared/components/misc/image-icons/image-icons.component";
import { ImageHoverComponent } from "@shared/components/misc/image-hover/image-hover.component";
import { ImageViewerIotdTpStatsComponent } from "@shared/components/misc/image-viewer/image-viewer-iotd-tp-stats.component";
import { MasonryLayoutComponent } from "@shared/components/masonry-layout/masonry-layout.component";
import { ImageGalleryLoadingComponent } from "@shared/components/image-gallery-loading-indicator/image-gallery-loading.component";
import { IconsModule } from "@shared/icons.module";
import { ImageViewerGuidingEquipmentComponent } from "@shared/components/misc/image-viewer/image-viewer-guiding-equipment.component";
import { ImageViewerEquipmentItemsComponent } from "@shared/components/misc/image-viewer/image-viewer-equipment-items.component";
import { NotificationsListComponent } from "@shared/components/misc/notifications-list/notifications-list.component";
import { DragDropAreaComponent } from "@shared/components/misc/formly-field-chunked-file/drag-drop-area.component";
import { AvatarManagerComponent } from "@shared/components/misc/avatar-manager/avatar-manager.component";
import { AvatarEditorComponent } from "@shared/components/misc/avatar-editor/avatar-editor.component";

const modules = [
  CommonModule,
  DirectivesModule,
  DragDropModule,
  FormsModule,
  FormlyBootstrapModule,
  FormlySelectModule,
  HammerModule,
  ImageCropperModule,
  LightboxModule,
  NgbAccordionModule,
  NgbCarouselModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbModalModule,
  NgbOffcanvasModule,
  NgbPaginationModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTooltipModule,
  NgSelectModule,
  NgToggleModule,
  NgxFilesizeModule,
  NgxDatatableModule,
  NgxImageZoomModule,
  NgxSliderModule,
  NgWizardModule,
  PipesModule,
  ReactiveFormsModule,
  RouterModule,
  TimeagoModule,
  TranslateModule,
  FormlyModule,
  UploadxModule,
  AutoSizeInputModule,
  NgOptimizedImage,
  IconsModule
];

const components = [
  AdManagerComponent,
  AvatarComponent,
  AvatarEditorComponent,
  AvatarManagerComponent,
  CameraComponent,
  ConfirmationDialogComponent,
  CountDownComponent,
  CountrySelectionModalComponent,
  CustomToastComponent,
  DataDoesNotUpdateInRealTimeComponent,
  DragDropAreaComponent,
  EmptyListComponent,
  FileValueAccessorDirective,
  FormlyCardWrapperComponent,
  FormlyEquipmentItemBrowserWrapperComponent,
  FormlyFieldArrayComponent,
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
  FormlyFieldToggleComponent,
  FormlyFieldCustomNumberComponent,
  FormlyFieldCustomRadioComponent,
  FormlyFieldSliderComponent,
  FormlyWrapperComponent,
  ForumPreviewComponent,
  FullscreenImageViewerComponent,
  HrComponent,
  ImageComponent,
  ImageHoverComponent,
  ImageIconsComponent,
  ImageGalleryLoadingComponent,
  ImageLoadingIndicatorComponent,
  ImageSearchCardComponent,
  ImageSearchComponent,
  ImageSearchItemListingMessagePipe,
  ImageSearchBrandListingMessagePipe,
  ImageViewerSlideshowComponent,
  ImageViewerSlideshowContextComponent,
  ImageViewerComponent,
  ImageViewerMenuComponent,
  ImageViewerCustomMessageBannerComponent,
  ImageViewerWipBannerComponent,
  ImageViewerTitleComponent,
  ImageViewerFloatingTitleComponent,
  ImageViewerPhotographersComponent,
  ImageViewerSocialButtonsComponent,
  ImageViewerShareButtonComponent,
  ImageViewerDataSourceComponent,
  ImageViewerAcquisitionComponent,
  ImageViewerAcquisitionDatesComponent,
  ImageViewerAcquisitionCsvExportComponent,
  ImageViewerAstrometryComponent,
  ImageViewerObjectsComponent,
  ImageViewerEquipmentComponent,
  ImageViewerGuidingEquipmentComponent,
  ImageViewerEquipmentItemsComponent,
  ImageViewerRevisionsComponent,
  ImageViewerRevisionSummaryComponent,
  ImageViewerGroupsAndCollectionsComponent,
  ImageViewerPlateSolvingBannerComponent,
  ImageViewerCloseButtonComponent,
  ImageViewerAdditionalButtonComponent,
  ImageViewerAdjustmentsEditorComponent,
  ImageViewerIotdBannerComponent,
  ImageViewerIotdTpStatsComponent,
  ForumPostSearchComponent,
  NestedCommentSearchComponent,
  InformationDialogComponent,
  LoadingDialogComponent,
  LoadingIndicatorComponent,
  LoginFormComponent,
  LoginModalComponent,
  MasonryLayoutComponent,
  MarketplaceListingCardComponent,
  MarketplaceListingCardsComponent,
  MobileMenuComponent,
  MostOftenUsedWithModalComponent,
  NestedCommentComponent,
  NestedCommentsComponent,
  NestedCommentsCountComponent,
  NestedCommentsModalComponent,
  NothingHereComponent,
  NotificationsListComponent,
  PrivateInformationComponent,
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
  UserSearchComponent,

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
  EquipmentPresetComponent,
  EquipmentPresetEditorComponent,
  EquipmentPresetSummaryComponent,
  FilterEditorComponent,
  ItemBrowserByPropertiesComponent,
  ItemBrowserComponent,
  ItemSummaryComponent,
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
    ...services
  ]
})
export class ComponentsModule {
  constructor(public readonly modalConfig: NgbModalConfig) {
    modalConfig.centered = true;
  }
}
