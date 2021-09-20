import { testBrand, testCamera } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
  });

  context("Explorer", () => {
    context("Select existing", () => {
      it("should select existing item", () => {
        cy.visitPage("/equipment/explorer");

        cy.route("GET", "**/api/v2/equipment/camera/?q=*", {
          count: 1,
          next: null,
          previous: null,
          results: [testCamera]
        }).as("findCameras");

        cy.route("GET", "**/api/v2/equipment/camera/", {
          count: 1,
          next: null,
          previous: null,
          results: [testCamera]
        }).as("getCameras");

        cy.route("GET", "**/api/v2/equipment/brand/1/", testBrand).as("getBrand");

        cy.ngSelectType("#equipment-item-field", "Test");
        cy.wait("@findCameras");
        cy.wait("@getBrand");

        cy.ngSelectShouldHaveOptionsCount("#equipment-item-field", 1);
        cy.ngSelectOptionNumberSelectorShouldContain(
          "#equipment-item-field",
          1,
          "astrobin-equipment-item-summary .label strong",
          "Test brand"
        );
        cy.ngSelectOptionNumberSelectorShouldContain(
          "#equipment-item-field",
          1,
          "astrobin-equipment-item-summary .label",
          "Test"
        );

        cy.ngSelectOptionClick("#equipment-item-field", 1);
        cy.ngSelectValueShouldContain("#equipment-item-field", "Test brand Test");
      });

      it("should update the URL with ID and slug", () => {
        cy.url().should("include", `/equipment/explorer/camera/${testCamera.id}/test-brand-test`);
      });

      it("should show the item", () => {
        cy.get(".card astrobin-equipment-item-summary .label strong")
          .contains("Test brand")
          .should("be.visible");
        cy.get(".card astrobin-equipment-item-summary .label")
          .contains("Test")
          .should("be.visible");
      });
    });
  });
});
