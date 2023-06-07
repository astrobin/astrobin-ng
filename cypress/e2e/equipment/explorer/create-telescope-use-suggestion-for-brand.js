import { testBrand } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create telescope and use brand suggestion", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/telescope");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findTelescopes");
      });

      it("should select brand suggestion", () => {
        cy.equipmentItemBrowserCreateBrandUsingSuggestion("#equipment-item-field-brand", "Test Brand", testBrand);
      });
    });
  });
});
