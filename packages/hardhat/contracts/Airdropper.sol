// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./SimpleNFT.sol";

contract Airdropper {
    SimpleNFT nftContract;
    string public constant imgURI = "https://i.imgur.com/JMOto3M.png";

    constructor(address _nftContractAddress) {
        nftContract = SimpleNFT(_nftContractAddress);
    }

    function airdrop(address _to) public {
        nftContract.mint(_to, imgURI);
    }

    function airdropToMultiple(address[] memory _recepients, string memory _tokenURI) public {
        for (uint i = 0; i < _recepients.length; i++) {
            nftContract.mint(_recepients[i], _tokenURI);
        }
    }
}
