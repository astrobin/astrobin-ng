import { testBrand, testMount } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create mount with brand process creation", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/mount");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findMounts");
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

      it("should fill the type", () => {
        cy.ngSelectOpen("#mount-field-type");
        cy.ngSelectOptionClick("#mount-field-type", 1);
        cy.ngSelectValueShouldContain("#mount-field-type", "Alt-Az (altazimuth)");
      });

      it("should input the 'Max. payload'", () => {
        cy.get("#mount-field-max-payload").type("80");
      });

      it("should create the item", () => {
        cy.route("POST", "**/api/v2/equipment/mount/", testMount).as("createMount");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title")
          .contains("Confirm item creation")
          .should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Mount");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Type", "Alt-Az (altazimuth)");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Max. payload", "80 kg");

        cy.get(".modal-footer .btn-danger").click();

        cy.wait("@createMount");

        cy.ngSelectValueShouldContain("#equipment-item-field", "Test brand Test");
      });
    });
  });
});
