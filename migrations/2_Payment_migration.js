const Bank = artifacts.require("Payment");

module.exports = function (deployer) {
  deployer.deploy(Bank);
};
