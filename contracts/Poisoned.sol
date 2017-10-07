pragma solidity ^0.4.15;

import "./AuctionInterface.sol";

/** @title Poisoned */
contract Poisoned {

	address target;

	/* Constructor */
	function Poisoned() payable {}

	/* Bid function, vulnerable to attack */
	function bid(uint amount) external {
		if ((amount <= this.balance) && (target != address(0))) {
			AuctionInterface _target = AuctionInterface(target);
			_target.bid.value(amount)();
		}
	}

	function setTarget(address auction) external {
		if (auction != address(this)) {
			target = auction;
		}
	}

	function getTarget() constant returns (address) {
		return target;
	}

	function getBalance() constant returns (uint) {
		return this.balance;
	}

	function() {}
}
