import type { ChangeDetectorRef, OnChanges, SimpleChanges, TemplateRef } from "@angular/core";
import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import type { Router } from "@angular/router";
import { LoadRemoteSourceAffiliates } from "@app/store/actions/remote-source-affiliates.actions";
import { selectRemoteSourceAffiliates } from "@app/store/selectors/app/remote-source-affiliates.selectors";
import type { MainState } from "@app/store/state";
import { DataSource, RemoteSource } from "@core/interfaces/image.interface";
import type { ImageInterface } from "@core/interfaces/image.interface";
import type { RemoteSourceAffiliateInterface } from "@core/interfaces/remote-source-affiliate.interface";
import type { CollapseSyncService } from "@core/services/collapse-sync.service";
import type { DeviceService } from "@core/services/device.service";
import type { ImageService } from "@core/services/image/image.service";
import type { ImageViewerService } from "@core/services/image-viewer.service";
import type { SearchService } from "@core/services/search.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import type { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { select } from "@ngrx/store";
import type { Store } from "@ngrx/store";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import type { CookieService } from "ngx-cookie";
import { filter, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-image-viewer-data-source",
  template: `
    <div class="metadata-section">
      <div *ngIf="dataSource && dataSourceIcon" class="metadata-item">
        <div class="metadata-icon">
          <img
            [ngbTooltip]="'Data source' | translate"
            triggers="hover click"
            container="body"
            [src]="'/assets/images/' + dataSourceIcon"
            alt=""
          />
        </div>
        <div (click)="dataSourceClicked($event)" class="metadata-link search">
          <span [class.highlight]="dataSourceIsSearchTerm">{{ dataSource }}</span>
        </div>
      </div>

      <div *ngIf="remoteDataSource" class="metadata-item remote-source">
        <div class="metadata-icon">
          <img
            [ngbTooltip]="'Remote hosting' | translate"
            triggers="hover click"
            container="body"
            src="/assets/images/data-sources/observatory-white.png?v=1"
            alt=""
          />
        </div>
        <div
          (click)="remoteDataSourceClicked($event)"
          [ngClass]="remoteDataSourceIsSponsor ? 'metadata-link metadata-link-sponsor' : 'metadata-label'"
        >
          <span [class.highlight]="remoteDataSourceIsSearchTerm">{{ remoteDataSource }}</span>
        </div>
      </div>

      <div *ngFor="let location of locations" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Location' | translate"
            triggers="hover click"
            container="body"
            icon="map-marker-alt"
          ></fa-icon>
        </div>
        <div class="metadata-label" [innerHTML]="location | highlight : highlightTerms"></div>
      </div>

      <div *ngIf="bortle" class="metadata-item">
        <div class="metadata-icon w-auto">
          <span
            class="bortle"
            [ngbTooltip]="'Weighted average Bortle scale' | translate"
            triggers="hover click"
            container="body"
          >
            Bortle
          </span>
        </div>
        <div class="metadata-label">
          {{ bortle }}
        </div>
      </div>
    </div>

    <ng-template #remoteSourceAffiliateSponsorOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ remoteDataSource }}</h5>
        <button type="button" class="btn-close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body">
        <div class="sponsor-info d-flex flex-column gap-3 align-items-center p-4">
          <a
            *ngIf="remoteDataSourceAffiliate.imageFile"
            [href]="remoteDataSourceAffiliate.url"
            class="no-external-link-icon w-100"
            target="_blank"
          >
            <img [alt]="remoteDataSourceAffiliate.name" [src]="remoteDataSourceAffiliate.imageFile" class="img-fluid" />
          </a>

          <a [href]="remoteDataSourceAffiliate.url" target="_blank">
            {{ "Visit website" | translate }}
          </a>

          <button class="btn btn-primary" (click)="search({ remote_source: this.image.remoteSource })">
            {{ "Browse images" | translate }}
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-data-source.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerDataSourceComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  protected dataSource: string;
  protected dataSourceIcon: string;
  protected dataSourceIsSearchTerm = false;
  protected remoteDataSource: string;
  protected remoteDataSourceAffiliate: RemoteSourceAffiliateInterface;
  protected remoteDataSourceIsSponsor = false;
  protected remoteDataSourceIsSearchTerm = false;
  protected locations: string[];
  protected bortle: number;
  protected highlightTerms: string;

  @ViewChild("remoteSourceAffiliateSponsorOffcanvasTemplate")
  protected remoteSourceAffiliateSponsorOffcanvasTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageService: ImageService,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService
  ) {
    super(
      store$,
      searchService,
      router,
      imageViewerService,
      windowRefService,
      cookieService,
      collapseSyncService,
      changeDetectorRef
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      const image = changes.image.currentValue as ImageInterface;
      this.setDataSource(image);
      this.setRemoteDataSource(image);
      this.setRemoteDataSourceAffiliate(image);
      this.setLocations(image);
      this.setBortle(image);
    }

    if (changes.searchModel && changes.searchModel.currentValue) {
      this.highlightTerms = "";

      if (this.searchModel?.text?.value) {
        this.highlightTerms = this.searchModel.text.value;
      }
    }
  }

  setDataSource(image: ImageInterface) {
    if (image.dataSource !== DataSource.OTHER && image.dataSource !== DataSource.UNKNOWN && image.dataSource !== null) {
      this.dataSourceIcon = this.imageService.getDataSourceIcon(this.image.dataSource, "white");
      this.dataSource = this.imageService.humanizeDataSource(this.image.dataSource);

      if (this.searchModel?.data_source === this.image.dataSource) {
        this.dataSourceIsSearchTerm = true;
      }
    }
  }

  setRemoteDataSource(image: ImageInterface) {
    this.remoteDataSource = RemoteSource[this.image.remoteSource];

    if (this.searchModel?.remote_source === this.image.remoteSource) {
      this.remoteDataSourceIsSearchTerm = true;
    }
  }

  setRemoteDataSourceAffiliate(image: ImageInterface) {
    this.store$
      .pipe(
        select(selectRemoteSourceAffiliates),
        filter(affiliates => !!affiliates),
        takeUntil(this.destroyed$)
      )
      .subscribe(affiliates => {
        const remoteSourceAffiliate = affiliates.find(affiliate => affiliate.code === image.remoteSource);
        if (remoteSourceAffiliate) {
          this.remoteDataSourceAffiliate = remoteSourceAffiliate;
          this.remoteDataSourceIsSponsor = new Date(remoteSourceAffiliate.affiliationExpiration) >= new Date();
          this.changeDetectorRef.markForCheck();
        }
      });

    this.store$.dispatch(new LoadRemoteSourceAffiliates());
  }

  setLocations(image: ImageInterface) {
    this.locations = image.locationObjects.map(location => {
      let locationString = location.name;

      if (location.city) {
        locationString += ", " + location.city;
      }

      if (location.state) {
        locationString += ` (${location.state})`;
      }

      if (location.country) {
        locationString += ", " + location.country;
      }

      return locationString;
    });
  }

  setBortle(image: ImageInterface) {
    this.bortle = this.imageService.getAverageBortleScale(image);
  }

  dataSourceClicked(event: MouseEvent): void {
    event.preventDefault();
    this.search({ data_source: this.image.dataSource });
  }

  remoteDataSourceClicked(event: MouseEvent): void {
    event.preventDefault();

    if (!this.remoteDataSourceIsSponsor) {
      return;
    }

    this.offcanvasService.open(this.remoteSourceAffiliateSponsorOffcanvasTemplate, {
      panelClass: "image-viewer-offcanvas",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
  }
}
