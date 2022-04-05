import { testBrand, testCamera, testSensor } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create camera with brand/sensor process creation", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test camera", "@findCameras");
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
        cy.get("#equipment-item-field-name").should("have.value", "Test camera");
      });

      it("should fill the type", () => {
        cy.ngSelectOpen("#camera-field-type");
        cy.ngSelectOptionClick("#camera-field-type", 1);
        cy.ngSelectValueShouldContain("#camera-field-type", "Dedicated deep-sky camera");
      });

      it("should create a sensor", () => {
        cy.equipmentItemBrowserCreate("#camera-field-sensor", "Test sensor", "@findSensors");
        cy.equipmentItemBrowserCreateBrand(
          "#create-new-item #create-new-item #equipment-item-field-brand",
          "Test brand",
          "https://www.test-brand.com/",
          testBrand
        );

        cy.get("#sensor-field-pixel-width").type(2000);
        cy.get("#sensor-field-pixel-height").type(1000);

        cy.get("#create-new-item #create-new-item #equipment-item-field-name").should("have.value", "Test sensor");

        cy.route("POST", "**/api/v2/equipment/sensor/", testSensor).as("createSensor");
        cy.route("GET", "**/api/v2/equipment/sensor/find-similar-in-brand/*", []);
        cy.route("GET", "**/api/v2/equipment/brand/1/", testBrand);

        cy.get("#create-new-item #create-new-item .btn-primary").click();
        cy.get(".modal .btn")
          .contains("Confirm")
          .click();

        cy.wait("@createSensor");

        cy.ngSelectValueShouldContain("#camera-field-sensor", "Test sensor");
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

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test brand", "Test camera");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Camera");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Type", "Dedicated deep-sky camera");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Cooled", "Yes");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Max. cooling", "20 °C");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Back focus", "20 mm");

        cy.get(".modal-footer .btn-danger").click();

        cy.wait("@createCamera");

        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test brand", "Test camera");
      });
    });
  });
});
