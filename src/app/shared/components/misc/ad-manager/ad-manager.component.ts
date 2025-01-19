import { Component, ElementRef, EventEmitter, Inject, Input, OnChanges, Output, PLATFORM_ID, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { AdManagerService } from "@shared/services/ad-manager.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-ad-manager",
  template: `
    <div
      *ngIf="isBrowser"
      [id]="divId"
      [style.height.px]="adHeight"
      class="ad-container"
      [class.ad-rendered]="adRendered"
    >
      <astrobin-loading-indicator *ngIf="!adRendered"></astrobin-loading-indicator>
    </div>
    <button
      *ngIf="adRendered"
      (click)="removeAds()"
      class="btn btn-link btn-no-block remove-ads"
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
          translate="There are only astronomy ads on AstroBin, that are published after careful review and approval. Nothing fishy, nothing off-topic, and nothing that will use any of your private information."
        ></p>

        <p
          translate="If you are on AstroBin Premium or AstroBin Ultimate, you can remove ads in your settings. If you are not, please consider supporting AstroBin by subscribing!"></p>

        <p translate="Thank you!"></p>
      </div>
    </ng-template>
  `,
  styleUrls: ["./ad-manager.component.scss"]
})
export class AdManagerComponent implements OnChanges {
  @Input() configName: string;

  @Output() adDisplayed = new EventEmitter<void>();

  @ViewChild("removeAdsOffcanvasTemplate") removeAdsOffcanvasTemplate: TemplateRef<any>;

  protected readonly isBrowser: boolean;
  protected adUnitPath: string;
  protected divId: string;
  protected adSize: any[];
  protected adHeight: number;
  protected adRendered = false;

  private _loadingAd = true;

  constructor(
    public readonly adManagerService: AdManagerService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    @Inject(PLATFORM_ID) platformId: Object,
    public readonly elementRef: ElementRef,
    public readonly utilsService: UtilsService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (this.isBrowser) {
      const config = this.adManagerService.getAdConfig(this.configName);
      if (config) {
        this.adUnitPath = config.adUnitPath;
        this.divId = config.divId;
        this.adSize = config.adSize;

        // First destroy any existing slot
        await this.adManagerService.destroyAdSlot(this.divId);

        const containerWidth = this.elementRef.nativeElement.parentElement.offsetWidth;

        // Calculate the ad height by scaling the width proportionally to the container width
        const adSizes = {
          rectangular: {
            width: 920,
            height: 640
          },
          wide: {
            width: 2280,
            height: 280
          }
        };
        this.adHeight = (adSizes[this.configName].height * containerWidth) / adSizes[this.configName].width;

        // Only define new slot after previous one is destroyed
        this.adManagerService.defineAdSlot(this.configName, this.adUnitPath, this.adSize, this.divId);

        this.adManagerService.displayAd(this.divId).then((displayed) => {
          this._onAdResult(displayed);
        });
      } else {
        console.error(`No ad configuration found for ${this.configName}`);
      }
    }
  }

  refreshAd(): void {
    if (this._loadingAd) {
      return;
    }

    this._loadingAd = true;
    this.adManagerService.refreshAd(this.divId).then((displayed) => {
      this._onAdResult(displayed);
    });
  }

  removeAds(): void {
    this.offcanvasService.open(this.removeAdsOffcanvasTemplate, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  destroyAd(): Promise<void> {
    return this.adManagerService.destroyAdSlot(this.divId);
  }

  private _onAdResult(displayed: boolean): void {
    if (displayed) {
      this.utilsService.delay(100).subscribe(() => {
        requestAnimationFrame(() => {
          this.adRendered = displayed;
          this.adDisplayed.emit();
          this._loadingAd = false;
        });
      });
    } else {
      this.adRendered = false;
      this._loadingAd = false;
    }
  }
}
