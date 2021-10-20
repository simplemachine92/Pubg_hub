// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// import "./SimpleNFT.sol";

abstract contract NFTContract is ERC721URIStorage {
  function mint(address recipient, string memory tokenURI)
    public
    returns (uint256)
  {}
}

contract Airdropper {
  constructor() {}

  function airdrop(
    address _nftContractAddress,
    address[] memory _recepients,
    string memory _tokenURI
  ) public {
    NFTContract nftContract = NFTContract(_nftContractAddress);
    for (uint256 i = 0; i < _recepients.length; i++) {
      nftContract.mint(_recepients[i], _tokenURI);
    }
  }
}
