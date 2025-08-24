// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ILayerZeroEndpoint} from "@layerzerolabs/solidity-examples/contracts/lzApp/interfaces/ILayerZeroEndpoint.sol";
import {IExternalRouter} from "../interfaces/IExternalRouter.sol";

contract ExternalRouter is IExternalRouter, Ownable {
    struct Message {
        uint16 chainId;
        bytes addressCombination;
        bytes payload;
    }

    event MessageSent(Message message);

    Message[] public messageQueue;
    uint16 public currentChainId;
    mapping(bytes => uint64) public lastNonces;
    ILayerZeroReceiver public omniPay;

    constructor(address _midPay, uint16 _currentChainId) {
        midPay = ILayerZeroReceiver(_midPay);
        currentChainId = _currentChainId;
    }

    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable,
        address,
        bytes calldata
    ) external override {
        require(
            msg.sender == address(omniPay),
            "ExternalRouter: Only OmniPay can call this function"
        );

        Message memory message = Message(_dstChainId, _destination, _payload);
        messageQueue.push(message);

        emit MessageSent(message);
    }

    function estimateFees(
        uint16,
        address,
        bytes calldata,
        bool,
        bytes calldata
    ) external pure returns (uint256, uint256) {
        return (0, 0);
    }
}
