import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { NgbActiveOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

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

  constructor(
    public readonly store$: Store<MainState>,
    public readonly activeOffcanvas: NgbActiveOffcanvas,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  onAvatarUpdated(newAvatarUrl: string): void {
    this.avatarUpdated.emit(newAvatarUrl);
  }

  close(): void {
    this.activeOffcanvas.dismiss();
  }
}