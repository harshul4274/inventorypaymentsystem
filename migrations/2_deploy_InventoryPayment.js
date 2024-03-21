const InventoryPayment = artifacts.require("InventoryPayment");

module.exports = function (deployer) {
  deployer.deploy(InventoryPayment);
};
