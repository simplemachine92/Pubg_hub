// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

abstract contract NFTContract is ERC721URIStorage {
    function mint(address recipient, uint256 amount) public returns (uint256) {}
}

abstract contract Deployer {
    function deploy(string memory _tokenURI) external returns (address) {}
}

/*
  1. User uploads an image via drag n drop.
  2. The image gets uploaded to ipfs, we get the hash in return.
  3. We call the deploy function from the NFTDeployer contract w/ the hash from ipfs as the tokenURI.
  4. We then mint nfts for each recepient specified by the user.
*/

contract NFTDropper {
    constructor() {}

    function airdrop(
        address _nftDeployerAddress,
        address[] memory _recepients,
        string memory _tokenURI
    ) public returns (address) {
        address deployment = Deployer(_nftDeployerAddress).deploy(_tokenURI);
        NFTContract nftContract = NFTContract(deployment);
        for (uint256 i = 0; i < _recepients.length; i++) {
            nftContract.mint(_recepients[i], 1);
        }
        return deployment;
    }
}
