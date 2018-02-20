# Attack the Auction
Welcome to lab03. In this assignment you'll be getting acclimated with external calls, inheritance, and smart contract security.

## Homework Instructions
Your task is to complete both `BadAuction.sol` and `GoodAuction.sol` such that they are each, respectively, vulnerable and protected from three specific security vulnerabilities. Notice that both contracts inherit from `AuctionInterface.sol`.

The contracts `Poisoned.sol` and `NotPoisoned.sol` are players in an adversarial system. Both can conduct external calls to the auctions in order to place bids and lower their bid if they are the current highest bidder. While `NotPoisoned.sol` will act as expected, `Poisoned.sol` will attempt to take advantage of one of `BadAuction.sol`'s security vulnerabilities. **You Should NOT Change These Contracts**

Implement both auctions in order to demonstrate your understanding of what makes smart contracts vulnerable and how to secure them.

**All work should be done in _contracts/BadAuction.sol_ and _contracts/GoodAuction.sol_**

## Baisc Rules
* In any situation, a bidder with a lower or the same bid than the current highest bidder should have no effect on the contract
* A bidder with a higher bid should:
	* Be able to displace the previous highest bidder if the previous highest bidder were not poisoned
	* Be able to displace the previous highest bidder if bidding at a good auction
	* Not be able to displace the previous highest bidder if bidding on a bad auction and the previous highest bidder was poisoned
* A previous highest bidder should only get back an amount equivalent to what their bet (the previous highest bet) was; no more, no less
* In GoodAuction the current highest bidder should be able reduce their current bid by 1 using the reduceBid function. In BadAuction, anybody should be able to reduce the highest bidder's current bid.
* In GoodAuction the process of reducing a bid should be protected against underflow. 

## Minimum Requirements
* All tests should pass
* Each auction file should follow the requirements set by the skeleton code (as well as the `AuctionInterface.sol`)
* Do not change any files except for `BadAuction.sol` and `GoodAuction.sol`

## Testing 
To test your contracts open a second terminal window and type `ganache-cli` to start a local test server. In the other window cd into the assignment root directory and run
1) `truffle compile`
2) `truffle migrate`
3) `truffle test`

### Truffle Console
If you're having trouble passing the tests and would like to play around with the contracts manually:
1. Run `truffle migrate`
2. Run `truffle console`, This will open up a Node JavaScript console that is connected to your local server

## Submission Instructions
PLEASE FORK THIS REPO and push your code up to your fork. 

Don't hesitate to reach out to the staff via Piazza should you run into any trouble.
