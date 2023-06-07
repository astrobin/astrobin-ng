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
          "Test Brand",
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

      it("should input the 'Weight'", () => {
        cy.get("#mount-field-weight").type("50");
      });

      it("should input the 'Max. payload'", () => {
        cy.get("#mount-field-max-payload").type("80");
      });

      it("should create the item", () => {
        cy.route("post", "**/api/v2/equipment/mount/", testMount).as("createMount");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title").contains("Confirm item creation").should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test Brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Mount");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Type", "Alt-Az (altazimuth)");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Weight", "50 kg");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Max. payload", "80 kg");

        cy.get("[for=confirm-no-typos]").click();
        cy.get("[for=confirm-no-duplication]").click();
        cy.get("[for=confirm-naming-convention]").click();
        cy.get("[for=confirm-unambiguous]").click();
        cy.get("[for=confirm-english]").click();
        cy.get("[for=confirm-no-personal-information]").click();
        cy.get(".modal-footer .btn").contains("Confirm").click();

        cy.wait("@createMount");

        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test Brand", "Test mount");
      });
    });
  });
});
