var BadAuction = artifacts.require("./BadAuction.sol");
var GoodAuction = artifacts.require("./GoodAuction.sol");
var Poisoned = artifacts.require("./Poisoned.sol");
var NotPoisoned = artifacts.require("./NotPoisoned");

module.exports = function(deployer) {
    deployer.deploy(BadAuction);
    deployer.deploy(GoodAuction);
    deployer.deploy(Poisoned);
    deployer.deploy(NotPoisoned);
};
