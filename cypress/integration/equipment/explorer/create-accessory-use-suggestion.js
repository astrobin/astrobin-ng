import { testBrand, testAccessory } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create accessory and use suggestion", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/accessory");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findAccessories");
      });

      it("should select suggestion", () => {
        cy.route("get", "**/api/v2/equipment/accessory/find-similar-in-brand/*", [testAccessory]);

        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test brand", testBrand);
        cy.get("#equipment-item-field-name").should("have.value", "Test");
        cy.get("astrobin-similar-items-suggestion").should("be.visible");
        cy.get("astrobin-similar-items-suggestion .btn").click();
        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test brand", "Test accessory");
      });
    });
  });
});
