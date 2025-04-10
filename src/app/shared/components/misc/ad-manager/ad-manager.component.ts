import { isPlatformBrowser } from "@angular/common";
import type { OnChanges } from "@angular/core";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
  TemplateRef,
  ViewChild
} from "@angular/core";
import { AdManagerService } from "@core/services/ad-manager.service";
import { DeviceService } from "@core/services/device.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { fadeInOut } from "@shared/animations";

@Component({
  selector: "astrobin-ad-manager",
  template: `
    <div
      *ngIf="isBrowser && unitPath && divId && size"
      [id]="divId"
      [style.height.px]="loading || rendered ? height : 0"
      class="ad-container"
      [class.ad-rendered]="rendered"
    ></div>

    <astrobin-loading-indicator *ngIf="loading && !rendered"></astrobin-loading-indicator>

    <img
      *ngIf="!loading && !rendered && !!configName"
      @fadeInOut
      [src]="'/assets/images/ads/' + configName + '/thank-you-for-not-blocking-ads.jpeg?v=1'"
      [alt]="'Thank you for not blocking ads!' | translate"
      class="default-ad"
    />

    <button *ngIf="rendered" (click)="removeAds()" class="btn btn-link btn-no-block remove-ads">
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
          translate="If you are on AstroBin Premium or AstroBin Ultimate, you can remove ads in your settings. If you are not, please consider supporting AstroBin by subscribing!"
        ></p>

        <p translate="Thank you!"></p>
      </div>
    </ng-template>
  `,
  styleUrls: ["./ad-manager.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdManagerComponent implements OnChanges {
  @Input() configName: string;

  @Output() adDisplayed = new EventEmitter<void>();

  @ViewChild("removeAdsOffcanvasTemplate") removeAdsOffcanvasTemplate: TemplateRef<any>;

  protected readonly isBrowser: boolean;
  protected unitPath: string;
  protected divId: string;
  protected size: any[];
  protected height: number;
  protected rendered = false;
  protected loading = true;

  constructor(
    public readonly adManagerService: AdManagerService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    @Inject(PLATFORM_ID) platformId: object,
    public readonly elementRef: ElementRef,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnChanges() {
    if (this.isBrowser) {
      const config = this.adManagerService.getAdConfig(this.configName);
      if (config) {
        this.unitPath = config.adUnitPath;
        this.divId = config.divId;
        this.size = config.adSize;

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
        this.height = (adSizes[this.configName].height * containerWidth) / adSizes[this.configName].width;

        this._defineAndDisplayAd();
      } else {
        console.debug(`Ad configuration "${this.configName}" not found.`);
        this.unitPath = null;
        this.divId = null;
        this.size = null;
      }
    }
  }

  refreshAd(): void {
    if (this.loading) {
      console.debug(`Ad is already loading, skipping refresh.`);
      return;
    }

    this.loading = true;

    this._defineAndDisplayAd();
  }

  removeAds(): void {
    this.offcanvasService.open(this.removeAdsOffcanvasTemplate, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  destroyAd(): Promise<void> {
    console.debug(`Destroying ad slot ${this.divId}`);
    return this.adManagerService.destroyAdSlot(this.divId);
  }

  private _defineAndDisplayAd(): void {
    if (!this.unitPath || !this.divId || !this.size) {
      console.debug(`_defineAndDisplayAd: params are null`);
      return;
    }

    if (this.adManagerService.hasAdSlot(this.divId)) {
      this.adManagerService.refreshAd(this.divId).then(displayed => {
        this._onAdResult(displayed);
        this.changeDetectorRef.markForCheck();
      });
    } else {
      this.adManagerService.defineAdSlot(this.configName, this.unitPath, this.size, this.divId).then(() => {
        this.loading = true;
        this.changeDetectorRef.markForCheck();

        this.adManagerService.displayAd(this.divId).then(displayed => {
          this._onAdResult(displayed);
          this.changeDetectorRef.markForCheck();
        });
      });
    }
  }

  private _onAdResult(displayed: boolean): void {
    if (displayed) {
      this.utilsService.delay(1).subscribe(() => {
        requestAnimationFrame(() => {
          console.debug(`Ad displayed: ${this.divId}`);
          this.rendered = displayed;
          this.adDisplayed.emit();
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        });
      });
    } else {
      console.debug(`Ad not displayed: ${this.divId}`);
      this.rendered = false;
      this.loading = false;
    }
  }
}
