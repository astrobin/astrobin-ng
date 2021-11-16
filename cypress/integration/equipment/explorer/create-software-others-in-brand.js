import { testBrand, testSoftware } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create software and see that 'others in brand' works", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/software");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findSoftwareItems");
      });

      it("should see 'others in brand' info", () => {
        cy.route("GET", "**/api/v2/equipment/software/others-in-brand/*", [testSoftware]);

        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test brand", testBrand);

        cy.get("astrobin-equipment-others-in-brand").should("be.visible");
        cy.get("astrobin-equipment-others-in-brand .item")
          .contains("Test")
          .should("be.visible");
      });
    });
  });
});
