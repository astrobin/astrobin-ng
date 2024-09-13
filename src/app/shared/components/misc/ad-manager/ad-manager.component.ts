import { AfterViewInit, Component, EventEmitter, Inject, Input, OnChanges, Output, PLATFORM_ID, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { AdManagerService } from "@shared/services/ad-manager.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";

@Component({
  selector: "astrobin-ad-manager",
  template: `
    <div *ngIf="isBrowser" [id]="divId" class="ad-container"></div>
    <button
      (click)="removeAds()"
      class="btn btn-link remove-ads"
    >
      {{ "Remove ads" | translate }}
    </button>

    <ng-template #removeAdsOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">
          {{ "Remove ads" | translate }}
        </h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>

      <div class="offcanvas-body">
        <p translate="We know, we're all used to the fact that ads on the Internet are annoying."></p>
        <p translate="However, please let us offer you a good reason to allow ads on AstroBin:"></p>
        <p
          class="alert alert-dark my-4"
          translate="There are only astronomy ads on AstroBin, that are published after carefuly review and approval. Nothing fishy, nothing off-topic, and nothing that will use any of your private information."
        ></p>

        <p translate="If you are on AstroBin Premium or AstroBin Ultimate, you can remove ads in your settings. If you are not, please consider supporting AstroBin by subscribing!"></p>

        <p translate="Thank you!"></p>
      </div>
    </ng-template>
  `,
  styleUrls: ["./ad-manager.component.scss"]
})
export class AdManagerComponent implements OnChanges, AfterViewInit {
  @Input() configName: string;

  @Output() adDisplayed = new EventEmitter<void>();

  @ViewChild("removeAdsOffcanvasTemplate") removeAdsOffcanvasTemplate: TemplateRef<any>;

  protected readonly isBrowser: boolean;
  protected adUnitPath: string;
  protected divId: string;
  protected adSize: any[];

  constructor(
    public readonly adManagerService: AdManagerService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isBrowser) {
      const config = this.adManagerService.getAdConfig(this.configName);
      if (config) {
        this.adUnitPath = config.adUnitPath;
        this.divId = config.divId;
        this.adSize = config.adSize;

        this.adManagerService.defineAdSlot(this.configName, this.adUnitPath, this.adSize, this.divId);
      } else {
        console.error(`No ad configuration found for ${this.configName}`);
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.adManagerService.displayAd(this.divId, () => {
        this.adDisplayed.emit();
      });
    }
  }

  refreshAd(): void {
    this.adManagerService.refreshAd(this.divId, () => {
      this.adDisplayed.emit();
    });
  }

  removeAds(): void {
    this.offcanvasService.open(this.removeAdsOffcanvasTemplate, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  destroyAd(): void {
    this.adManagerService.destroyAdSlot(this.divId);
  }
}
