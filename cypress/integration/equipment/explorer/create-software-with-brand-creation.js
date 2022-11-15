import { testBrand, testSoftware } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create software with brand process creation", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/software");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findSoftwareItems");
      });

      it("should create a brand", () => {
        cy.equipmentItemBrowserCreateBrand(
          "#equipment-item-field-brand",
          "Test Brand",
          "https://www.test-brand.com/",
          testBrand
        );
      });

      it("should have prefilled the name", () => {
        cy.get("#equipment-item-field-name").should("have.value", "Test");
      });

      it("should create the item", () => {
        cy.route("post", "**/api/v2/equipment/software/", testSoftware).as("createSoftware");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title").contains("Confirm item creation").should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test Brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Software");

        cy.get("[for=confirm-no-typos]").click();
        cy.get("[for=confirm-no-duplication]").click();
        cy.get("[for=confirm-naming-convention]").click();
        cy.get("[for=confirm-unambiguous]").click();
        cy.get("[for=confirm-english]").click();
        cy.get("[for=confirm-no-personal-information]").click();
        cy.get(".modal-footer .btn").contains("Confirm").click();

        cy.wait("@createSoftware");

        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test Brand", "Test software");
      });
    });
  });
});
