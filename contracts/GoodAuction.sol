pragma solidity 0.4.19;

import "./AuctionInterface.sol";

/** @title GoodAuction */
contract GoodAuction is AuctionInterface {

	/* New data structure, keeps track of refunds owed */
	mapping(address => uint) refunds;


	/* 	Bid function, now shifted to pull paradigm
		Must return true on successful send and/or bid, bidder
		reassignment. Must return false on failure and 
		allow people to retrieve their funds  */
	function bid() payable external returns(bool) {
		// YOUR CODE HERE
	}

	/*  Implement withdraw function to complete new 
	    pull paradigm. Returns true on successful 
	    return of owed funds and false on failure
	    or no funds owed.  */
	function withdrawRefund() external returns(bool) {
		// YOUR CODE HERE
	}

	/*  Allow users to check the amount they are owed
		before calling withdrawRefund(). Function returns
		amount owed.  */
	function getMyBalance() constant external returns(uint) {
		return refunds[msg.sender];
	}


	/* 	Consider implementing this modifier
		and applying it to the reduceBid function 
		you fill in below. Only the highest bidder
		should be able to reduce their bid, right?  */
	modifier canReduce() {
		_;
	}


	function reduceBid() external {}


	/* 	Remember. This fallback function
		gets invoked if somebody calls a
		function that does not exist in this
		contract. How do we send people 
		their money back?  */

	function () payable {
		// YOUR CODE HERE
	}

}
