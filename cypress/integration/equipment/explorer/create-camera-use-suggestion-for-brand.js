import { testBrand, testCamera } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();

    cy.route("GET", "**/api/v2/equipment/camera/?q=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findCameras");

    cy.route("GET", "**/api/v2/equipment/camera/", {
      count: 1,
      next: null,
      previous: null,
      results: [testCamera]
    }).as("getCameras");

    cy.route("GET", "**/api/v2/equipment/camera/?name=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findCamerasByName");

    cy.route("GET", "**/api/v2/equipment/brand/?q=*", {
      count: 0,
      next: null,
      previous: null,
      results: []
    }).as("findBrands");

    cy.route("GET", "**/api/v2/equipment/brand/?name=*", {
      count: 0,
      next: null,
      previous: null,
      results: []
    }).as("findBrandsByName");
  });

  context("Explorer", () => {
    context("Create camera and use brand suggestion", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findCameras");
      });

      it("should select brand suggestion", () => {
        cy.equipmentItemBrowserCreateBrandUsingSuggestion("#equipment-item-field-brand", "Test brand", testBrand);
      });
    });
  });
});
