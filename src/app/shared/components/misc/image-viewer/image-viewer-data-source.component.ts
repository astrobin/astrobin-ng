import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { DataSource, ImageInterface, RemoteSource } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { WindowRefService } from "@shared/services/window-ref.service";

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
        <div (click)="dataSourceClicked($event)" class="metadata-link">
          {{ dataSource }}
        </div>
      </div>

      <div *ngIf="remoteDataSource" class="metadata-item">
        <div class="metadata-icon">
          <img
            [ngbTooltip]="'Remote hosting' | translate"
            triggers="hover click"
            container="body"
            src="/assets/images/data-sources/observatory-white.png?v=1"
            alt=""
          />
        </div>
        <div (click)="remoteDataSourceClicked($event)" class="metadata-link">
          {{ remoteDataSource }}
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
        <div class="metadata-label">
          {{ location }}
        </div>
      </div>

      <div *ngIf="bortle" class="metadata-item">
        <div class="metadata-label">
          Bortle: {{ bortle }}
        </div>
      </div>
    </div>
  `,
  styles: [`
  `]
})
export class ImageViewerDataSourceComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  dataSource: string;
  dataSourceIcon: string;
  remoteDataSource: string;
  locations: string[];
  bortle: number;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageService: ImageService,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      this.setDataSource(changes.image.currentValue);
      this.setRemoteDataSource(changes.image.currentValue);
      this.setLocations(changes.image.currentValue);
      this.setBortle(changes.image.currentValue);
    }
  }

  setDataSource(image: ImageInterface) {
    if (
      image.dataSource !== DataSource.OTHER &&
      image.dataSource !== DataSource.UNKNOWN &&
      image.dataSource !== null
    ) {
      this.dataSourceIcon = this.imageService.getDataSourceIcon(this.image.dataSource, "white");
      this.dataSource = this.imageService.humanizeDataSource(this.image.dataSource);
    }
  }

  setRemoteDataSource(image: ImageInterface) {
    this.remoteDataSource = RemoteSource[this.image.remoteSource];
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
    this.search({ remote_source: this.image.remoteSource });
  }
}
