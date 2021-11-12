import { testBrand } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create mount and use brand suggestion", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/mount");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findMounts");
      });

      it("should select brand suggestion", () => {
        cy.equipmentItemBrowserCreateBrandUsingSuggestion("#equipment-item-field-brand", "Test brand", testBrand);
      });
    });
  });
});
