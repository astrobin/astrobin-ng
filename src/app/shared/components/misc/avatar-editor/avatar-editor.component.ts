import type { ChangeDetectorRef } from "@angular/core";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { NgbActiveOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-avatar-editor",
  templateUrl: "./avatar-editor.component.html",
  styleUrls: ["./avatar-editor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarEditorComponent extends BaseComponentDirective {
  @Input()
  user: UserInterface;

  @Output()
  avatarUpdated = new EventEmitter<string>();

  isUploading = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly activeOffcanvas: NgbActiveOffcanvas,
    public readonly translateService: TranslateService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  onAvatarUpdated(newAvatarUrl: string): void {
    this.avatarUpdated.emit(newAvatarUrl);
    // Close the offcanvas when avatar is updated
    // Allow a small delay to ensure the loading state is properly updated
    setTimeout(() => {
      this.close();
    }, 100);
  }

  onLoadingChanged(loading: boolean): void {
    this.isUploading = loading;
    this.changeDetectorRef.markForCheck();
  }

  close(): void {
    // Only allow closing if not currently uploading
    if (!this.isUploading) {
      this.activeOffcanvas.dismiss();
      this.changeDetectorRef.markForCheck();
    }
  }

  /**
   * Used by the offcanvas service to determine if dismissal is allowed
   * @returns boolean True if dismissal is allowed, false otherwise
   */
  beforeDismiss(): boolean {
    // Same logic as close() - only allow dismissal if not uploading
    return !this.isUploading;
  }
}
