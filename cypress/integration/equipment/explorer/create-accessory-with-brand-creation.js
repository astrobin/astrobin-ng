import { testBrand, testAccessory } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create accessory with brand process creation", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/accessory");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findAccessories");
      });

      it("should create a brand", () => {
        cy.equipmentItemBrowserCreateBrand(
          "#equipment-item-field-brand",
          "Test brand",
          "https://www.test-brand.com/",
          testBrand
        );
      });

      it("should have prefilled the name", () => {
        cy.get("#equipment-item-field-name").should("have.value", "Test");
      });

      it("should create the item", () => {
        cy.route("post", "**/api/v2/equipment/accessory/", testAccessory).as("createAccessory");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title")
          .contains("Confirm item creation")
          .should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Accessory");

        cy.get("[for=confirm-no-typos]").click();
        cy.get("[for=confirm-no-duplication]").click();
        cy.get("[for=confirm-naming-convention]").click();
        cy.get("[for=confirm-unambiguous]").click();
        cy.get("[for=confirm-english]").click();
        cy.get("[for=confirm-no-personal-information]").click();
        cy.get(".modal-footer .btn")
          .contains("Confirm")
          .click();

        cy.wait("@createAccessory");

        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test brand", "Test accessory");
      });
    });
  });
});
