pragma solidity 0.4.19;

import "./AuctionInterface.sol";

/** @title BadAuction */
contract BadAuction is AuctionInterface {


	/* Bid function, vulnerable to reentrency attack.
	 * Must return true on successful send and/or bid,
	 * bidder reassignment
	 * Must return false on failure and send people
	 * their funds back
	 */
	function bid() payable external returns (bool) {
		// YOUR CODE HERE
	}


/* 	Reduce bid function. Vulnerable to attack.
	Allows current highest bidder to reduce 
	their bid by 1. Do NOT make changes here.
	Instead notice the vulnerabilities, and
	implement the function properly in GoodAuction.sol  */
	
	function reduceBid() external {
	    if (highestBid >= 0) {
	        highestBid = highestBid - 1;
	        require(highestBidder.send(1));
	    } else {
	    	revert();
	    }
	}


	/* 	Remember. This fallback function
		gets invoked if somebody calls a
		function that does not exist in this
		contract. How do we send people 
		their money back?  */

	function () payable {
		// YOUR CODE HERE
	}

}
