# Attack the Auction
Welcome to the Blockchain for Developers DeCal's third assignment. You'll be getting acclimated with external calls, inheritance, and smart contract security.

## Homework Instructions
Your task is to complete both `BadAuction.sol` and `GoodAuction.sol` such that they are each, respectively, vulnerable and protected from a push/pull reentrancy attack. Notice that both contracts inherit from `AuctionInterface.sol`.

`Poisoned.sol` and `NotPoisoned.sol` are both players in an adversarial system. Both can conduct external calls to the auctions in order to place bids. While `NotPoisoned.sol` will act as expected, `Poisoned.sol` will attempt to take advantage of `BadAuction.sol`'s push-based paradigm. **Do not make changes to these contracts**

Implement both auctions in order to demonstrate your understanding of what makes smart contracts vulnerable and how to secure them.

**All work should be done in _contracts/BadAuction.sol_ and _contracts/GoodAuction.sol_**

## Rules
* In any situation, a bidder with a lower or the same bid than the current highest bidder should have no effect on the contract
	* The contract should return `false` in this situation
	* The bidder should still be able to get their money back
* A bidder with a higher bid should:
	* Be able to displace the previous highest bidder if the previous highest bidder were not poisoned
		* The contract should return `true` in this situation
	* Be able to displace the previous highest bidder if bidding at a good auction
		* The contract should return `false` in this situation
	* Not be able to displace the previous highest bidder if bidding on a bad auction and the previous highest bidder was poisoned
		* The bidder should still be able to get their money back
* A previous highest bidder should only get back an amount equivalent to what their bet (the previous highest bet) was; no more, no less

## Minimum Requirements
* All fifteen tests should pass
* Each auction file should follow the requirements set by the skeleton code (as well as the `AuctionInterface.sol`)
* Do not change any files except for `BadAuction.sol` and `GoodAuction.sol`

## Testing 
You can verify that your smart contract is implemented correctly with `truffle test`. Be sure to have a testrpc server running in a separate terminal.

Refreshed: in an empty terminal, run `testrpc` to initialize a default testrpc server. If you get errors, read the [_testrpc_ documentation](https://github.com/ethereumjs/testrpc)

### Truffle Console
If you're having trouble passing the tests and would like to play around with the contracts manually:
1. Run `truffle migrate`
2. Run `truffle console`, This will open up a Node JavaScript console that is connected to your testrpc server

## Submission Instructions
Please fork this repo and push your code up to your fork. Please fill out this Google Form to let us know where you've got your answers: https://goo.gl/forms/TmXtCfx3TRPS2DbF2.

Please feel free to reach out to the staff via Piazza should you run into any trouble.
