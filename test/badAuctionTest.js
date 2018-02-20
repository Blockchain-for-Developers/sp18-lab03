'use strict';

const BadAuction = artifacts.require("./BadAuction.sol");
const Poisoned = artifacts.require("./Poisoned.sol");
const NotPoisoned = artifacts.require("./NotPoisoned.sol");

contract('BadAuctionTest', function(accounts) {
	const args = {_bigAmount: 99999999999999, _smallAmount: 200,
		_biggerSmallAmount: 300};
	let bad, notPoisoned, poisoned;

	beforeEach(async function() {
		/* Deploy a new BadAuction to attack */
		bad = await BadAuction.new();
		/* Deploy NotPoisoned as a test control */
		notPoisoned = await NotPoisoned.new({value: args._bigAmount});
		await notPoisoned.setTarget(bad.address);
	});

	describe('~BadAuction Works~', function() {
		it("The clean contract should lock on to the auction",
			async function() {
				let cleanBalance = await notPoisoned.getBalance.call();
				/* Why do you think `.valueOf()` is necessary? */
				assert.equal(cleanBalance.valueOf(), args._bigAmount,
					"value set correctly");
				/* Why do you think `.call(...)` is used? */
				let target = await notPoisoned.getTarget.call();
				assert.equal(target, bad.address,
					"target locked correctly");
		});
		it("The clean contract should send value to the auction",
			async function() {
				await notPoisoned.bid(args._smallAmount);
				let cleanBalance = await notPoisoned.getBalance.call();
				assert.isBelow(cleanBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let highestBid = await bad.getHighestBid.call();
				let highestBidder = await bad.getHighestBidder.call();
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
				await anotherNotPoisoned.setTarget(bad.address);
				await anotherNotPoisoned.bid(args._smallAmount);
				cleanBalance = await notPoisoned.getBalance.call();
				let anotherCleanBalance = await anotherNotPoisoned.getBalance.call();
				/* Optimized for Truffle, for now */
				assert.equal(anotherCleanBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let highestBid = await bad.getHighestBid.call();
				let highestBidder = await bad.getHighestBidder.call();
				assert.equal(highestBid.valueOf(), args._smallAmount,
					"same highest bid as before");
				assert.equal(highestBidder, notPoisoned.address,
					"same highest bidder as before");
		});
		it("Another clean contract with a higher bid should be able to " +
			"displace the highest bidder", async function() {
				await notPoisoned.bid(args._smallAmount);
				let cleanBalance = await notPoisoned.getBalance.call();
				assert.isBelow(cleanBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let anotherNotPoisoned = await NotPoisoned
					.new({value: args._bigAmount});
				await anotherNotPoisoned.setTarget(bad.address);
				await anotherNotPoisoned.bid(args._biggerSmallAmount);
				cleanBalance = await notPoisoned.getBalance.call();
				assert.equal(cleanBalance.valueOf(), args._bigAmount,
					"some balance has been returned");
				let anotherCleanBalance = await anotherNotPoisoned.getBalance.call();
				assert.isBelow(anotherCleanBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let highestBid = await bad.getHighestBid.call();
				let highestBidder = await bad.getHighestBidder.call();
				assert.equal(highestBid.valueOf(), args._biggerSmallAmount,
					"new highest bid set");
				assert.equal(highestBidder, anotherNotPoisoned.address,
					"new highest bidder set");
		});
	});

	describe('~Push/Pull Attack Vector~', function() {
		beforeEach(async function() {
			/* Deploy Poisoned to carry out attack */
			poisoned = await Poisoned.new({value: args._bigAmount});
			await poisoned.setTarget(bad.address);
		});

		it("The poisoned contract should lock on to the auction",
			async function() {
				let poisonedBalance = await poisoned.getBalance.call();
				assert.equal(poisonedBalance.valueOf(), args._bigAmount,
					"value set correctly");
				let target = await poisoned.getTarget.call();
				assert.equal(target, bad.address,
					"target locked correctly");
		});
		it("The poisoned contract should send value to the auction",
			async function() {
				await poisoned.bid(args._smallAmount);
				let poisonedBalance = await poisoned.getBalance.call();
				assert.isBelow(poisonedBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				let highestBid = await bad.getHighestBid.call();
				let highestBidder = await bad.getHighestBidder.call();
				assert.equal(highestBid.valueOf(), args._smallAmount,
					"new highest bid set");
				assert.equal(highestBidder, poisoned.address,
					"new highest bidder set")
		});
		it("The bad auction should not be able to accept a new highest bidder",
			async function() {
				await poisoned.bid(args._smallAmount);
				await notPoisoned.bid(args._biggerSmallAmount);
				let poisonedBalance = await poisoned.getBalance.call();
				let notPoisonedBalance = await notPoisoned.getBalance.call();
				let highestBid = await bad.getHighestBid.call();
				let highestBidder = await bad.getHighestBidder.call();
				assert.isBelow(poisonedBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				/* Optimized for Truffle, for now */
				assert.equal(notPoisonedBalance.valueOf(), args._bigAmount,
					"some balance has been spent");
				assert.equal(highestBid.valueOf(), args._smallAmount,
					"same highest bid as before");
				assert.equal(highestBidder, poisoned.address,
					"same highest bidder as before");
		});
	});

	describe('~Modifiers and Overflow Attack Surface~', function() {

		beforeEach(async function() {
			poisoned = await Poisoned.new({value: args._bigAmount});
			await poisoned.setTarget(bad.address);
		});

		it("The bad auction should let anybody decrement the standing bid",
			async function() {
				await notPoisoned.bid(args._smallAmount);
				await poisoned.reduceBid();
				let highestBid = await bad.getHighestBid.call();
				assert.equal((args._smallAmount - 1), highestBid.valueOf());
		});
		it("The bad auction should refund highest bidder when they reduce their bid",
			async function() {
				await notPoisoned.bid(args._smallAmount);
				await poisoned.reduceBid();
				let notPoisonedBalance = await notPoisoned.getBalance.call();
				assert.equal((args._bigAmount - args._smallAmount + 1), notPoisonedBalance.valueOf());
		});
		it("The bad auction should let overflow occur",
			async function() {
				let value = 0;
				await notPoisoned.bid(value);
				try {
					await poisoned.reduceBid();
					let highestBid = await bad.getHighestBid.call();
					assert.equal(-1, highestBid);
				}
				catch(err) {
					let highestBid = await bad.getHighestBid.call();
					assert.equal(0, highestBid.valueOf());
				}
		});
	});
});
