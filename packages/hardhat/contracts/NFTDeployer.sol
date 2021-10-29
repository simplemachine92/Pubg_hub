// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

interface ISimpleNFT {
    // Returns the address of the token distributed by this contract.
    //function token() external view returns (address);

    function mint(address recipient) external returns (uint256);

    function getURI() external view returns (string memory);

    // Initialize the SimpleNFT contract with user URI
    function initializeSimpleNFT(string memory _tokenURI) external;
}

contract NFTDeployer {

  address public implementation;

  event Deployed(address indexed _address, string _tokenURI);

  constructor(address _implementation) {
    implementation = _implementation;
  }

  function deploy(string memory _tokenURI) public returns (address) {

    // clone deterministically
    address deployment = Clones.cloneDeterministic(implementation, keccak256(abi.encodePacked("1", _tokenURI)));

    ISimpleNFT(deployment).initializeSimpleNFT(_tokenURI);

    emit Deployed(deployment, _tokenURI);

    return deployment;

  }
}
