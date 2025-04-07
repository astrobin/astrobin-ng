import { Component, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@core/services/loading.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle, faFileAlt } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "astrobin-confirmation-dialog",
  templateUrl: "./information-dialog.component.html",
  styleUrls: ["./information-dialog.component.scss"]
})
export class InformationDialogComponent extends BaseComponentDirective {
  @Input()
  message: string;
  
  @Input()
  title: string = "Please note";
  
  @Input()
  messageClass: string;
  
  @Input()
  iconName: string = "info-circle";
  
  // Map for common icons
  private readonly iconMap: { [key: string]: IconDefinition } = {
    "info-circle": faInfoCircle,
    "file-alt": faFileAlt
  };
  
  // Get the icon definition based on the provided name
  get icon(): IconDefinition {
    return this.iconMap[this.iconName] || faInfoCircle;
  }

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }
}
