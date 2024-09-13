import { AfterViewInit, Component, Inject, Input, OnInit, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { AdManagerService } from "@shared/services/ad-manager.service";

@Component({
  selector: "astrobin-ad-manager",
  template: `
    <div *ngIf="isBrowser" [id]="divId" class="ad-container"></div>
  `,
  styleUrls: ["./ad-manager.component.scss"]
})
export class AdManagerComponent implements OnInit, AfterViewInit {
  @Input() configName: string;

  protected readonly isBrowser: boolean;
  protected adUnitPath: string;
  protected divId: string;
  protected adSize: any[];

  constructor(
    public readonly adManagerService: AdManagerService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const config = this.adManagerService.getAdConfig(this.configName);
      if (config) {
        this.adUnitPath = config.adUnitPath;
        this.divId = config.divId;
        this.adSize = config.adSize;

        this.adManagerService.defineAdSlot(this.adUnitPath, this.adSize, this.divId);
      } else {
        console.error(`No ad configuration found for ${this.configName}`);
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.adManagerService.displayAd(this.divId);
    }
  }
}
