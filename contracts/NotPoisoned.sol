pragma solidity 0.4.19;

import "./AuctionInterface.sol";

/** @title NotPoisoned */
contract NotPoisoned {

	address target;

	/* Constructor */
	function NotPoisoned() payable {}

	/* Bid function */
	function bid(uint amount) external {
		if ((amount <= this.balance) && (target != address(0))) {
			AuctionInterface _target = AuctionInterface(target);
			_target.bid.value(amount)();
		}
	}

	function reduceBid() external {
		if (target != address(0)) {
			AuctionInterface _target = AuctionInterface(target);
			_target.reduceBid();
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

	function() payable {}
}
