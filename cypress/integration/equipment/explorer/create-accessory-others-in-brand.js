import { testBrand, testAccessory } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create accessory and see that 'others in brand' works", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/accessory");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findAccessories");
      });

      it("should see 'others in brand' info", () => {
        cy.route("GET", "**/api/v2/equipment/accessory/others-in-brand/*", [testAccessory]);

        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test brand", testBrand);

        cy.get("astrobin-equipment-others-in-brand").should("be.visible");
        cy.get("astrobin-equipment-others-in-brand .item")
          .contains("Test")
          .should("be.visible");
      });
    });
  });
});
