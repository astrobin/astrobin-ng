import { Component, OnInit } from "@angular/core";

@Component({
  selector: "astrobin-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit {

  constructor() {
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  ngOnInit() {
  }
}
