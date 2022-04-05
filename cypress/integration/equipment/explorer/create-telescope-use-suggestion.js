import { testBrand, testTelescope } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create telescope and use suggestion", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/telescope");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findTelescopes");
      });

      it("should select suggestion", () => {
        cy.route("GET", "**/api/v2/equipment/telescope/find-similar-in-brand/*", [testTelescope]);

        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test brand", testBrand);
        cy.get("#equipment-item-field-name").should("have.value", "Test");
        cy.get("astrobin-similar-items-suggestion").should("be.visible");
        cy.get("astrobin-similar-items-suggestion .btn").click();
        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test brand", "Test telescope");
      });
    });
  });
});
