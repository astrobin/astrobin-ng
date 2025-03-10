import { ChangeDetectionStrategy, Component, Inject, NgModule, OnInit, PLATFORM_ID, TemplateRef, ViewChild } from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { MobilePageMenuOffcanvasService } from "@core/services/mobile-page-menu-offcanvas.service";
import { MobilePageMenuService } from "@core/services/mobile-page-menu.service";
import { TranslateModule } from "@ngx-translate/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { ModalService } from "@core/services/modal.service";
import { DescriptionModalWrapperComponent } from "../description-modal-wrapper/description-modal-wrapper.component";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "astrobin-mobile-page-menu-offcanvas",
  template: `
    <ng-template #pageMenuOffcanvas let-offcanvas>
      <ng-container *ngIf="pageMenuConfig$ | async as config">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">
            <ng-container *ngIf="config.titleTemplate" [ngTemplateOutlet]="config.titleTemplate"></ng-container>
          </h5>
          <div class="header-actions">
            <!-- Icons from the template if available -->
            <ng-container *ngIf="config.iconsTemplate">
              <ng-container [ngTemplateOutlet]="config.iconsTemplate"></ng-container>
            </ng-container>

            <!-- Info/description button if available -->
            <ng-container *ngIf="config.descriptionTemplate">
              <button
                type="button"
                class="btn btn-link btn-no-block text-white p-1 me-2"
                (click)="openPageMenuDescription($event)"
              >
                <fa-icon icon="info-circle"></fa-icon>
              </button>
            </ng-container>

            <!-- Close button -->
            <button type="button" class="btn-close text-reset" (click)="offcanvas.dismiss()"></button>
          </div>
        </div>
        <div class="offcanvas-body">
          <!-- Main content template -->
          <ng-container
            *ngIf="config.template"
            [ngTemplateOutlet]="config.template"
            [ngTemplateOutletContext]="config.templateContext"
          ></ng-container>
        </div>
      </ng-container>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobilePageMenuOffcanvasComponent implements OnInit {
  @ViewChild("pageMenuOffcanvas", { static: true }) pageMenuOffcanvasTemplate: TemplateRef<any>;

  pageMenuConfig$ = this.mobilePageMenuService.getMenuConfig();
  
  // Flag to check if we're in a browser environment
  private readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly mobilePageMenuOffcanvasService: MobilePageMenuOffcanvasService,
    private readonly mobilePageMenuService: MobilePageMenuService,
    private readonly modalService: ModalService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Only register the template if we're in a browser environment
    if (this.isBrowser) {
      // Register the template with the service
      this.mobilePageMenuOffcanvasService.registerPageMenuTemplate(this.pageMenuOffcanvasTemplate);
    }
  }

  /**
   * Open the description panel as a modal for the page menu
   */
  openPageMenuDescription(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Only open modals in browser environment
    if (!this.isBrowser) {
      return;
    }

    this.pageMenuConfig$.pipe(
      filter(() => this.isBrowser),
      take(1)
    ).subscribe(config => {
      if (!config || !config.descriptionTemplate) {
        return;
      }

      this.modalService.open(DescriptionModalWrapperComponent, {
        componentParams: {
          contentTemplate: config.descriptionTemplate,
          context: config.templateContext
        },
        size: "lg",
        centered: true
      });
    });
  }
}

@NgModule({
  declarations: [MobilePageMenuOffcanvasComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FontAwesomeModule,
    NgbModalModule
  ],
  exports: [MobilePageMenuOffcanvasComponent]
})
export class MobilePageMenuOffcanvasModule {
}
