pragma solidity ^0.4.15;

/** @title AuctionInterface */
contract AuctionInterface {
	address highestBidder;
	uint highestBid;
	function bid() payable external returns (bool);
	function getHighestBidder() constant returns (address) {
		return highestBidder;
	}
	function getHighestBid() constant returns (uint) {
		return highestBid;
	}
}
