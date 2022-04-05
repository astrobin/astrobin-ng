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
          "Test brand",
          "https://www.test-brand.com/",
          testBrand
        );
      });

      it("should have prefilled the name", () => {
        cy.get("#equipment-item-field-name").should("have.value", "Test");
      });

      it("should create the item", () => {
        cy.route("POST", "**/api/v2/equipment/software/", testSoftware).as("createSoftware");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title")
          .contains("Confirm item creation")
          .should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Software");

        cy.get(".modal-footer .btn-danger").click();

        cy.wait("@createSoftware");

        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test brand", "Test software");
      });
    });
  });
});
