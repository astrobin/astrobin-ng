import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { skip, take, takeUntil } from "rxjs/operators";
import { DeleteAvatar, LoadUser, UploadAvatar } from "@features/account/store/auth.actions";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@core/services/window-ref.service";
import { UtilsService } from "@core/services/utils/utils.service";

@Component({
  selector: "astrobin-avatar-manager",
  templateUrl: "./avatar-manager.component.html",
  styleUrls: ["./avatar-manager.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarManagerComponent extends BaseComponentDirective implements OnInit {
  @Input()
  userId: UserInterface["id"];

  @Input()
  user: UserInterface;

  @Output()
  avatarUpdated = new EventEmitter<string>();
  
  @Output()
  loadingChanged = new EventEmitter<boolean>();

  protected avatarUrl: string;
  protected _loading = false;
  protected selectedFile: File = null;
  protected previewUrl: string | ArrayBuffer = null;
  protected readonly isBrowser: boolean;
  protected circleDiameter = 0;
  private previewContainer: HTMLElement = null;
  
  get loading(): boolean {
    return this._loading;
  }
  
  set loading(value: boolean) {
    if (this._loading !== value) {
      this._loading = value;
      this.loadingChanged.emit(value);
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.isBrowser && this.previewUrl && this.previewContainer) {
      // Recalculate circle diameter on window resize
      this.utilsService.delay(100).subscribe(() => {
        this.onImageLoad(this.previewContainer);
      });
    }
  }

  // Image transformation properties
  protected rotation = 0;
  protected flipHorizontal = false;
  protected flipVertical = false;
  protected originalImageData: HTMLImageElement = null;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly commonApiService: CommonApiService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.userId && !this.user) {
      this.loadUser();
    } else if (this.user) {
      this.setAvatar();
    }
  }

  loadUser() {
    this.loading = true;
    this.store$.dispatch(new LoadUser({ id: this.userId }));
    this.currentUser$
      .pipe(
        take(1),
        takeUntil(this.destroyed$)
      )
      .subscribe(user => {
        this.user = user;
        this.setAvatar();
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  setAvatar() {
    if (
      this.user.hasOwnProperty("largeAvatar") &&
      typeof this.user.largeAvatar === "string" &&
      this.user.largeAvatar.indexOf("default-avatar") > -1
    ) {
      this.avatarUrl = "/assets/images/default-avatar.jpeg?v=2";
    } else {
      this.avatarUrl = this.user.largeAvatar;
    }
  }

  onFileSelected(event: Event) {
    if (!this.isBrowser) {
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];

      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (validImageTypes.indexOf(this.selectedFile.type) === -1) {
        console.warn('Invalid file type selected:', this.selectedFile.type);
        this.popNotificationsService.error(
          this.translateService.instant("Please select a valid image file (JPEG, PNG, or GIF)")
        );
        this.selectedFile = null;
        input.value = '';
        return;
      }

      // Reset transformation properties
      this.rotation = 0;
      this.flipHorizontal = false;
      this.flipVertical = false;
      this.originalImageData = null;

      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
        // Ensure change detection runs after the preview is loaded
        this.changeDetectorRef.markForCheck();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  /**
   * Reset selection and preview state
   */
  cancelSelection(): void {
    this.previewUrl = null;
    this.selectedFile = null;
    this.rotation = 0;
    this.flipHorizontal = false;
    this.flipVertical = false;
    this.previewContainer = null;
    this.changeDetectorRef.markForCheck();
  }

  uploadAvatar() {
    if (!this.isBrowser) {
      return;
    }

    if (!this.selectedFile) {
      this.popNotificationsService.error(
        this.translateService.instant("Please select an image file to upload")
      );
      return;
    }

    this.loading = true;

    // Store the current avatar URL to detect changes
    const currentAvatarUrl = this.avatarUrl;

    // Dispatch the upload avatar action to NGRX
    this.store$.dispatch(new UploadAvatar({ avatarFile: this.selectedFile }));

    // Create a one-time subscription to the user profile state after dispatch
    // This ensures we capture the updated avatar state once the effects complete
    this.store$.select(state => state.auth.user)
      .pipe(
        // Skip the initial emission immediately after subscribing
        skip(1),
        // Take only the next emission (after the state has updated)
        take(1),
        // Ensure cleanup on component destruction
        takeUntil(this.destroyed$)
      )
      .subscribe(user => {
        if (user) {
          // Use the updated avatar from the user in the store
          this.avatarUrl = user.largeAvatar || '/assets/images/default-avatar.jpeg?v=2';

          // Reset UI state to return to upload button view
          this.selectedFile = null;
          this.previewUrl = null;  // This will trigger the template to show the upload button view
          this.loading = false;
          
          // Emit the avatar updated event after loading is set to false
          this.avatarUpdated.emit(this.avatarUrl);

          // Make sure view is updated
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  deleteAvatar() {
    if (!this.isBrowser) {
      return;
    }

    this.loading = true;

    // Store the current avatar URL to detect changes
    const currentAvatarUrl = this.avatarUrl;
    const defaultAvatarUrl = "/assets/images/default-avatar.jpeg?v=2";

    // Dispatch the delete avatar action to NGRX
    this.store$.dispatch(new DeleteAvatar());

    // Create a one-time subscription to the user profile state after dispatch
    // This ensures we capture the updated avatar state once the effects complete
    this.store$.select(state => state.auth.user)
      .pipe(
        // Skip the initial emission immediately after subscribing
        skip(1),
        // Take only the next emission (after the state has updated)
        take(1),
        // Ensure cleanup on component destruction
        takeUntil(this.destroyed$)
      )
      .subscribe(user => {
        if (user) {
          // Always set to default avatar on successful deletion
          this.avatarUrl = defaultAvatarUrl;
          this.avatarUpdated.emit(defaultAvatarUrl);

          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }

  /**
   * Rotate the image 90 degrees clockwise
   */
  rotateImage(): void {
    if (!this.isBrowser || !this.previewUrl) {
      return;
    }

    // Increment rotation (0, 90, 180, 270, back to 0)
    this.rotation = (this.rotation + 90) % 360;
    this.applyTransformations();
  }

  /**
   * Flip the image horizontally
   */
  flipImageHorizontal(): void {
    if (!this.isBrowser || !this.previewUrl) {
      return;
    }

    this.flipHorizontal = !this.flipHorizontal;
    this.applyTransformations();
  }

  /**
   * Flip the image vertically
   */
  flipImageVertical(): void {
    if (!this.isBrowser || !this.previewUrl) {
      return;
    }

    this.flipVertical = !this.flipVertical;
    this.applyTransformations();
  }

  /**
   * Apply all transformations to the image and update the preview
   */
  private applyTransformations(): void {
    if (!this.originalImageData) {
      // Store the original image for the first transformation
      const img = new Image();
      img.src = this.previewUrl as string;
      this.originalImageData = img;

      // Wait for the image to load before continuing
      img.onload = () => this.drawTransformedImage();
    } else {
      this.drawTransformedImage();
    }
  }

  /**
   * Calculate the circle size based on the container and image dimensions
   * This is called when the image loads and when window resizes
   */
  onImageLoad(containerElement: HTMLElement): void {
    if (!containerElement || !this.isBrowser) {
      this.circleDiameter = 200; // Fallback size
      return;
    }

    // Store container element reference for resize handling
    this.previewContainer = containerElement;
    
    // Wait a short time to ensure the element is fully rendered and has dimensions
    this.utilsService.delay(100).subscribe(() => {
      // Get container dimensions
      const containerWidth = containerElement.offsetWidth;
      const containerHeight = containerElement.offsetHeight;

      // Get the image element within the container
      const imageElement = containerElement.querySelector('.preview-image') as HTMLImageElement;

      if (!containerWidth || !containerHeight || !imageElement) {
        this.circleDiameter = 200; // Fallback size
      } else {
        // Wait for image to be fully loaded
        if (imageElement.complete) {
          this.calculateCircleDiameter(imageElement);
        } else {
          // If image is not loaded yet, wait for it
          imageElement.onload = () => this.calculateCircleDiameter(imageElement);
        }
      }
    });
  }

  /**
   * Calculate the optimal circle diameter based on the container and image
   * accounting for letterboxing with object-fit: contain
   */
  private calculateCircleDiameter(imageElement: HTMLImageElement): void {
    // Get container dimensions
    const containerWidth = imageElement.parentElement.offsetWidth;
    const containerHeight = imageElement.parentElement.offsetHeight;
    
    // Get natural image dimensions
    const naturalWidth = imageElement.naturalWidth;
    const naturalHeight = imageElement.naturalHeight;
    
    // Calculate aspect ratios
    const containerRatio = containerWidth / containerHeight;
    const imageRatio = naturalWidth / naturalHeight;
    
    let actualWidth, actualHeight;
    
    // Calculate the actual display dimensions based on aspect ratios
    if (imageRatio > containerRatio) {
      // Image is wider than container (horizontal letterboxing)
      actualWidth = containerWidth;
      actualHeight = containerWidth / imageRatio;
    } else {
      // Image is taller than container (vertical letterboxing)
      actualHeight = containerHeight;
      actualWidth = containerHeight * imageRatio;
    }
    
    // Use the smallest dimension for the circle diameter
    this.circleDiameter = Math.min(actualWidth, actualHeight);
    
    // Make sure the circle isn't too large for the container
    this.circleDiameter = Math.min(this.circleDiameter, containerWidth, containerHeight);
    
    this.changeDetectorRef.markForCheck();
  }

  private drawTransformedImage(): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions based on rotation
    let width = this.originalImageData.width;
    let height = this.originalImageData.height;

    // Swap dimensions if rotated 90 or 270 degrees
    if (this.rotation === 90 || this.rotation === 270) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move to the center of the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Rotate the canvas by the current rotation angle
    ctx.rotate((this.rotation * Math.PI) / 180);

    // Apply horizontal flip if enabled
    if (this.flipHorizontal) {
      ctx.scale(-1, 1);
    }

    // Apply vertical flip if enabled
    if (this.flipVertical) {
      ctx.scale(1, -1);
    }

    // Draw the image centered on the canvas
    ctx.drawImage(
      this.originalImageData,
      -width / 2,
      -height / 2,
      width,
      height
    );

    // Update the preview URL with the transformed image
    this.previewUrl = canvas.toDataURL('image/jpeg', 0.92); // Use JPEG for better compression

    // Create a new file from the canvas data for upload (using a callback)
    canvas.toBlob(blob => {
      if (blob) {
        // Create a new file with the same name but as a JPEG
        const fileName = this.selectedFile.name.replace(/\.[^/.]+$/, "") + ".jpg";
        this.selectedFile = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
      }

      // Give the UI time to update with the new image
      this.utilsService.delay(50).subscribe(() => {
        // Wait for the image to load before recalculating circle
        const img = new Image();
        img.onload = () => {
          // Force circle size recalculation after image has loaded
          this.utilsService.delay(50).subscribe(() => {
            const container = document.querySelector('.preview-image-container') as HTMLElement;
            if (container) {
              this.onImageLoad(container);
            }
            // Ensure UI updates
            this.changeDetectorRef.markForCheck();
          });
        };
        img.src = this.previewUrl as string;
      });
    }, 'image/jpeg', .92); // JPEG with 92% quality is usually a good balance
  }

}
