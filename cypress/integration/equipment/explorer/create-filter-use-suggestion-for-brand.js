import { testBrand } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create filter and use brand suggestion", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/filter");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findFilters");
      });

      it("should select brand suggestion", () => {
        cy.equipmentItemBrowserCreateBrandUsingSuggestion("#equipment-item-field-brand", "Test brand", testBrand);
      });
    });
  });
});
