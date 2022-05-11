import { testBrand, testCamera, testSensor } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create camera without brand/sensor process", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findCameras");
      });

      it("should select a brand", () => {
        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test brand", testBrand);
      });

      it("should have prefilled the name", () => {
        cy.get("#equipment-item-field-name").should("have.value", "Test");
      });

      it("should display error if name contains prohibited word", () => {
        cy.get("#equipment-item-field-name")
          .clear()
          .type("Test modded");
        cy.get("#equipment-item-field-name")
          .should("have.class", "is-invalid")
          .closest(".form-group")
          .should("have.class", "has-error")
          .find(".invalid-feedback")
          .should("be.visible");
        cy.get("#equipment-item-field-name")
          .clear()
          .type("Test");
        cy.get("#equipment-item-field-name").should("not.have.class", "is-invalid");
      });

      it("should fill the type", () => {
        cy.ngSelectOpen("#camera-field-type");
        cy.ngSelectOptionClick("#camera-field-type", 1);
        cy.ngSelectValueShouldContain("#camera-field-type", "Dedicated deep-sky camera");
      });

      it("should select a sensor", () => {
        cy.equipmentItemBrowserSelectFirstSensor("#camera-field-sensor", "Test sensor", testSensor);
      });

      it("should show 'Max cooling' only if 'Cooled'", () => {
        cy.get("#camera-field-max-cooling").should("not.be.visible");
        cy.get("label[for=camera-field-cooled]").click();
        cy.get("#camera-field-max-cooling").should("be.visible");
        cy.get("#camera-field-max-cooling").type("20");
      });

      it("should input the 'Back focus'", () => {
        cy.get("#camera-field-back-focus").type("20");
      });

      it("should create the item", () => {
        cy.route("POST", "**/api/v2/equipment/camera/", testCamera).as("createCamera");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title")
          .contains("Confirm item creation")
          .should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Camera");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Type", "Dedicated deep-sky camera");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Cooled", "Yes");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Max. cooling", "20 °C");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Back focus", "20 mm");

        cy.get("[for=confirm-no-typos]").click();
        cy.get("[for=confirm-no-duplication]").click();
        cy.get("[for=confirm-naming-convention]").click();
        cy.get("[for=confirm-no-personal-information]").click();
        cy.get(".modal-footer .btn")
          .contains("Confirm")
          .click();

        cy.wait("@createCamera");

        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test brand", "Test camera");
      });

      it("should update the URL with ID and slug", () => {
        cy.url().should("include", `/equipment/explorer/camera/${testCamera.id}/test-brand-test`);
      });
    });
  });
});
