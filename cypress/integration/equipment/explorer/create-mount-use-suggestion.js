import { testBrand, testMount } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create mount and use suggestion", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/mount");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findMounts");
      });

      it("should select suggestion", () => {
        cy.route("GET", "**/api/v2/equipment/mount/find-similar-in-brand/*", [testMount]);

        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test brand", testBrand);
        cy.get("#equipment-item-field-name").should("have.value", "Test");
        cy.get("astrobin-similar-items-suggestion").should("be.visible");
        cy.get("astrobin-similar-items-suggestion .btn").click();
        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test brand", "Test mount");
      });
    });
  });
});
