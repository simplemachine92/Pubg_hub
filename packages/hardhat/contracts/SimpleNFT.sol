// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// To read more about NFTs, checkout the ERC721 standard:
// https://eips.ethereum.org/EIPS/eip-721 

/**
NOTE: THIS WILL NOT BE AUTOMATICALLY COMPILED.
If you want it to compile, either import it into contract.sol or copy and paste the contract directly into there!
**/

contract SimpleNFT is ERC721URIStorage, Ownable {
		uint256 public tokenCounter = 0;
		string public userTokenURI = 'https://ipfs.io/ipfs/QmYPfVtNZUPbj2PNvDVCskgR7DBn8SQZbUvaqsoYL2Tiut';
		string public setUserTokenURI;

    constructor() ERC721("MINTLER", "MINTR") {
			
    }

    function mint(address recipient) public returns (uint256) {
			
        _mint(recipient, tokenCounter);

        _setTokenURI(tokenCounter, userTokenURI);

        tokenCounter = tokenCounter + 1;

        return tokenCounter;
    }

	

	function getURI() public view returns (string memory) {
		return userTokenURI;
	}
}