// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ILayerZeroEndpoint} from "@layerzerolabs/solidity-examples/contracts/lzApp/interfaces/ILayerZeroEndpoint.sol";
import {ILayerZeroReceiver} from "@layerzerolabs/solidity-examples/contracts/lzApp/interfaces/ILayerZeroReceiver.sol";
import {IExternalRouter} from "./interfaces/IExternalRouter.sol";

contract MidPayCore is Ownable, ILayerZeroReceiver {
    event LzCall(
        uint16 srcChainId,
        bytes srcAddress,
        uint64 nonce,
        bytes payload
    );
    event HashAlreadyProcessed();
    event InvalidEndpoint();
    event LookupNotTrusted();
    event Deposited(address user, uint256 amount);
    event Withdrawn(address user, uint256 amount);
    event NotEnoughBalance();

    mapping(address => uint256) public balances;
    mapping(uint16 => bytes) public trustedRemoteLookup;
    mapping(bytes32 => bool) public processed;

    IExternalRouter public externalRouter;
    ILayerZeroEndpoint public layerZeroEndpoint;
    IERC20 public usdc;

    constructor(address _usdc, address _layerZeroEndpoint) {
        usdc = IERC20(_usdc);
        layerZeroEndpoint = ILayerZeroEndpoint(_layerZeroEndpoint);
    }
}
