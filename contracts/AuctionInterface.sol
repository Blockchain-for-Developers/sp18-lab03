pragma solidity 0.4.19;

/** @title AuctionInterface */
contract AuctionInterface {
	address highestBidder;
	uint highestBid;
	function bid() payable external returns (bool);
	function reduceBid() external;
	function getHighestBidder() constant returns (address) {
		return highestBidder;
	}
	function getHighestBid() constant returns (uint) {
		return highestBid;
	}
}
