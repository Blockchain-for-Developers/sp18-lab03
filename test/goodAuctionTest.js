'use strict';

const GoodAuction = artifacts.require("./GoodAuction.sol");
const Poisoned = artifacts.require("./Poisoned.sol");
const NotPoisoned = artifacts.require("./NotPoisoned.sol");


contract('GoodAuctionTest', function(accounts) {
	const args = {_bigAmount: 99999999999999, _smallAmount: 200,
		_biggerSmallAmount: 300, _zero: 0};
	let good, notPoisoned, poisoned;

	beforeEach(async function() {
		/* Deploy a new GoodAuction to attack */
		good = await GoodAuction.new();
		/* Deploy NotPoisoned as a test control */
		notPoisoned = await NotPoisoned.new({value: args._bigAmount});
		await notPoisoned.setTarget(good.address);
	});

	describe('~GoodAuction Works~', function() {
		it("The clean contract should lock on to the auction",
			async function() {
				let cleanBalance = await notPoisoned.getBalance.call();
				/* Why do you think `.valueOf()` is necessary? */
				assert.equal(cleanBalance.valueOf(), args._bigAmount,
					"value set correctly");
				/* Why do you think `.call(...)` is used? */
				let target = await notPoisoned.getTarget.call();
				assert.equal(target, good.address,
					"target locked correctly");
		});
		it("The clean contract should send value to the auction",
			async function() {
				await notPoisoned.bid(args._smallAmount);
				let cleanBalance = await notPoisoned.getBalance.call();
				assert.isBelow(cleanBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let highestBid = await good.getHighestBid.call();
				let highestBidder = await good.getHighestBidder.call();
				assert.equal(highestBid.valueOf(), args._smallAmount,
					"highest bid set");
				assert.equal(highestBidder, notPoisoned.address,
					"highest bidder set");
		});
		it("Another clean contract with a lower/the same bid should not " +
			"be able to displace the highest bidder", async function() {
				await notPoisoned.bid(args._smallAmount);
				let cleanBalance = await notPoisoned.getBalance.call();
				assert.isBelow(cleanBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let anotherNotPoisoned = await NotPoisoned
					.new({value: args._bigAmount});
				await anotherNotPoisoned.setTarget(good.address);
				await anotherNotPoisoned.bid(args._smallAmount);
				cleanBalance = await notPoisoned.getBalance.call();
				let anotherCleanBalance = await anotherNotPoisoned.getBalance.call();
				/* Optimized for Truffle, for now 
				 * Should be `.equal` but value is not sent back currently
				 */
				assert.isBelow(anotherCleanBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let highestBid = await good.getHighestBid.call();
				let highestBidder = await good.getHighestBidder.call();
				let onContractAnotherCleanBalance = await good.getMyBalance.call(
					{from: anotherNotPoisoned.address});
				assert.equal(highestBid.valueOf(), args._smallAmount,
					"same highest bid as before");
				assert.equal(highestBidder, notPoisoned.address,
					"same highest bidder as before");
				assert.equal(onContractAnotherCleanBalance.valueOf(), args._smallAmount,
					"displaced funds stored in refunds mapping");
		});
		it("Another clean contract with a higher bid should be able to " +
			"displace the highest bidder", async function() {
				await notPoisoned.bid(args._smallAmount);
				let cleanBalance = await notPoisoned.getBalance.call();
				assert.isBelow(cleanBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let anotherNotPoisoned = await NotPoisoned
					.new({value: args._bigAmount});
				await anotherNotPoisoned.setTarget(good.address);
				await anotherNotPoisoned.bid(args._biggerSmallAmount);
				cleanBalance = await notPoisoned.getBalance.call();
				let onContractCleanBalance = await good.getMyBalance.call(
					{from: notPoisoned.address});
				assert.isBelow(cleanBalance.valueOf(), args._bigAmount,
					"no balance has been returned yet");
				assert.equal(onContractCleanBalance.valueOf(), args._smallAmount,
					"displaced funds stored in refunds mapping")
				let anotherCleanBalance = await anotherNotPoisoned.getBalance.call();
				assert.isBelow(anotherCleanBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let highestBid = await good.getHighestBid.call();
				let highestBidder = await good.getHighestBidder.call();
				assert.equal(highestBid.valueOf(), args._biggerSmallAmount,
					"new highest bid set");
				assert.equal(highestBidder, anotherNotPoisoned.address,
					"new highest bidder set");
		});
		it("Displaced higest bidder should be able to withdraw funds",
			async function() {
				/* External account needed as contracts have no private keys */
				let myAccount = accounts[0];
				let accBalance = myAccount.balance;
				await good.bid({from: myAccount, value: args._smallAmount});
				let highestBid = await good.getHighestBid.call();
				let highestBidder = await good.getHighestBidder.call();
				assert.equal(highestBid.valueOf(), args._smallAmount,
					"highest bid set");
				assert.equal(highestBidder, myAccount,
					"highest bidder set");
				let anotherNotPoisoned = await NotPoisoned
					.new({value: args._bigAmount});
				await anotherNotPoisoned.setTarget(good.address);
				await anotherNotPoisoned.bid(args._biggerSmallAmount);
				let onContractAccBalance = await good.getMyBalance.call(
					{from: myAccount});
				assert.equal(onContractAccBalance.valueOf(), args._smallAmount,
					"displaced funds stored in refunds mapping");
				await good.withdrawRefund({from: myAccount});
				onContractAccBalance = await good.getMyBalance.call(
					{from: notPoisoned.address});
				assert.equal(onContractAccBalance.valueOf(), args._zero,
					"on-contract balance set to zero after refund");
		});
	});

	describe('~Push/Pull Attack Vector~', function() {
		beforeEach(async function() {
			/* Deploy Poisoned to carry out attack */
			poisoned = await Poisoned.new({value: args._bigAmount});
			await poisoned.setTarget(good.address);
		});

		it("The poisoned contract should lock on to the auction",
			async function() {
				let poisonedBalance = await poisoned.getBalance.call();
				assert.equal(poisonedBalance.valueOf(), args._bigAmount,
					"value set correctly");
				let target = await poisoned.getTarget.call();
				assert.equal(target, good.address,
					"target locked correctly");
		});
		it("The poisoned contract should send value to the auction",
			async function() {
				await poisoned.bid(args._smallAmount);
				let poisonedBalance = await poisoned.getBalance.call();
				assert.isBelow(poisonedBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let highestBid = await good.getHighestBid.call();
				let highestBidder = await good.getHighestBidder.call();
				assert.equal(highestBid.valueOf(), args._smallAmount,
					"new highest bid set");
				assert.equal(highestBidder, poisoned.address,
					"new highest bidder set")
		});
		it("The good auction should still be able to accept a new highest bidder",
			async function() {
				await poisoned.bid(args._smallAmount);
				await notPoisoned.bid(args._biggerSmallAmount);
				let poisonedBalance = await poisoned.getBalance.call();
				let notPoisonedBalance = await notPoisoned.getBalance.call();
				let highestBid = await good.getHighestBid.call();
				let highestBidder = await good.getHighestBidder.call();
				let onContractPoisonedBalance = await good.getMyBalance.call(
					{from: poisoned.address});
				assert.isBelow(poisonedBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				assert.isBelow(notPoisonedBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				assert.equal(highestBid.valueOf(), args._biggerSmallAmount,
					"same highest bid as before");
				assert.equal(highestBidder, notPoisoned.address,
					"same highest bidder as before");
				assert.equal(onContractPoisonedBalance.valueOf(), args._smallAmount,
					"on-contract balance set to zero after refund");
		});
	});

	describe('~Modifiers and Overflow Attack Surface~', function() {

		beforeEach(async function() {
			poisoned = await Poisoned.new({value: args._bigAmount});
			await poisoned.setTarget(good.address);
		});

		it("The good auction should not let address who is not highest bidder decrement the standing bid",
			async function() {
				await notPoisoned.bid(args._smallAmount);
				await poisoned.reduceBid();
				let highestBid = await good.getHighestBid.call();
				assert.equal(args._smallAmount, highestBid.valueOf());
		});
		it("The good auction should reduce the bid when highest bidder call reduceBid",
			async function() {
				await notPoisoned.bid(args._smallAmount);
				await notPoisoned.reduceBid();
				let highestBid = await good.getHighestBid.call();
				assert.equal((args._smallAmount - 1), highestBid.valueOf());
		});
		it("The good auction should refund highest bidder when they reduce their bid",
			async function() {
				await notPoisoned.bid(args._smallAmount);
				await notPoisoned.reduceBid();
				let notPoisonedBalance = await notPoisoned.getBalance.call();
				assert.equal((args._bigAmount - args._smallAmount + 1), notPoisonedBalance.valueOf());
		});
		it("The good auction should not let overflow occur",
			async function() {
				let value = 0;
				await notPoisoned.bid(value);
				await notPoisoned.reduceBid();
				let highestBid = await good.getHighestBid.call();
				assert.equal(0, highestBid.valueOf());
		});
	});

	/* Need a separate contract to test external calls to non-existent methods */
	// describe('~Fallback Function~', function() {
	// 	it("The auction's fallback function should allow fund retrieval",
	// 		async function() {
	// 			let balance = accounts[0];
	// 			await good.someRandomFunc({value: args._smallAmount,
	// 				from: args._randomAddress});
	// 			let newBalance = accounts[0];
	// 			assert.isBelow(newBalance, balance,
	// 				"some balance has been spent");
	// 	});
	// });


});
