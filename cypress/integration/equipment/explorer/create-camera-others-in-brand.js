import { testBrand, testCamera } from "./test-data";

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

    cy.route("GET", "**/api/v2/equipment/camera/?name=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findCamerasByName");
  });

  context("Explorer", () => {
    context("Create camera and see that 'others in brand' works", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findCameras");
      });

      it("should see 'others in brand' info", () => {
        cy.route("GET", "**/api/v2/equipment/camera/others-in-brand/*", [testCamera]);

        cy.equipmentItemBrowserSelectNthBrand("#equipment-item-field-brand", "Test brand", testBrand);

        cy.get("astrobin-equipment-others-in-brand").should("be.visible");
        cy.get("astrobin-equipment-others-in-brand .item")
          .contains("Test")
          .should("be.visible");
      });
    });
  });
});
