// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FakeUSDC is ERC20, Ownable {
    mapping(address => bool) public minted;

    constructor() ERC20("Fake USD Coin", "fUSDC") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function mintOnce(address to) external {
        require(!minted[to], "FakeUSDC: already minted");
        minted[to] = true;
        _mint(to, 100e18);
    }
}