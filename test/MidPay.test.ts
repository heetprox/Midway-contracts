import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  MidPayClient, 
  MidPayCore, 
  ExternalRouter, 
  FakeUSDC,
  MockLayerZeroEndpoint
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { parseEther, parseUnits } from "ethers";

// Mock LayerZero Endpoint Contract
const MockLayerZeroEndpointABI = [
  "function send(uint16 _dstChainId, bytes calldata _destination, bytes calldata _payload, address payable _refundAddress, address _zroPaymentAddress, bytes calldata _adapterParams) external payable",
  "function estimateFees(uint16 _dstChainId, address _userApplication, bytes calldata _payload, bool _payInZRO, bytes calldata _adapterParam) external pure returns (uint256 nativeFee, uint256 zroFee)",
  "function triggerReceive(address _receiver, uint16 _srcChainId, bytes calldata _srcAddress, uint64 _nonce, bytes calldata _payload) external",
  "function storedPayloads(uint16, address, uint64) external view returns (bytes memory)",
  "function nonces(uint16, address) external view returns (uint64)"
];

const MockLayerZeroEndpointBytecode = "0x608060405234801561001057600080fd5b50610c6c806100206000396000f3fe608060405260043610610095575f3560e01c8063857749b011610063578063857749b0146101b35780639f38369a146101d3578063b353aaa7146101f3578063c44618341461021d578063d1deba1f14610230575f80fd5b8063040a7bb1146100995780631c37a822146100d25780633d8b38f6146101055780636fc1b31e1461014057806366ad5c8a14610193575b5f80fd5b3480156100a4575f80fd5b506100b86100b3366004610890565b610250565b60405190151581526020015b60405180910390f35b3480156100dd575f80fd5b506100f16100ec36600461092a565b610257565b6040516100c9989796959493929190610a2b565b348015610110575f80fd5b5061013261011f366004610ab1565b5f6611c37937e080009150915091565b6040516100c9929190610aea565b34801561014b575f80fd5b5061017b61015a366004610b03565b5f60209081526001909152604090205473ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016100c9565b34801561019e575f80fd5b506100b86101ad366004610890565b50600190565b3480156101be575f80fd5b506100b86101cd366004610890565b50600190565b3480156101de575f80fd5b506100b86101ed366004610890565b50600190565b3480156101fe575f80fd5b50610207600181565b60405161ffff90911681526020016100c9565b61013261022b366004610b57565b505050565b34801561023b575f80fd5b5061024f61024a366004610c20565b505050565b005b5f92915050565b5f80546001600160a01b038716602090815260408083208a845290915290812080546001810182559081018290559091906001820155600281018990556003810188905560048101805473ffffffffffffffffffffffffffffffffffffffff8089166001600160a01b0319928316179091556005820180549188169190921617905560068101805460ff19169415159490941790935560078401869055600984019490945550600a90910184905560029050865f5b8181101561037b578060200285013561033957829150505b8260010192508160010191508260200285013561035557829150505b826001019250816001019150856020028501358261037257600195505b50600101610302565b5090999850975050505050505050565b5f8083601f8401126103a0578182fd5b50813567ffffffffffffffff8111156103b7578182fd5b6020830191508360208285010111156103ce578182fd5b9250929050565b803561ffff811681146103e6575f80fd5b919050565b803573ffffffffffffffffffffffffffffffffffffffff811681146103e6575f80fd5b80356001600160401b03811681146103e6575f80fd5b5f805f805f805f8060a0898b031215610442578384fd5b883567ffffffffffffffff80821115610459578586fd5b6104658c838d0161038f565b909a50985060208b0135915080821115610477578586fd5b6104838c838d0161038f565b909850965060408b013591508082111561049b578586fd5b506104a88b828c0161038f565b90955093506104bb905060608a01610409565b91506104c960808a016103eb565b90509295985092959890939650565b5f80604083850312156104e9578182fd5b6104f2836103d5565b91506105006020840161040e565b90509250929050565b5f8060408385031215610520578182fd5b50508035926020909101359150565b5f8060208385031215610540578182fd5b823567ffffffffffffffff811115610556578283fd5b6105628582860161038f565b90969095509350505050565b5f805f8060608587031215610581578182fd5b61058a856103d5565b9350602085013567ffffffffffffffff8111156105a5578283fd5b6105b18782880161038f565b90945092506105c490506040860161040e565b905092959194509250565b5f8060208385031215610540578182fd5b634e487b7160e01b5f52604160045260245ffd5b5f8082840360a08112156105ff578283fd5b6106088461040e565b925060807fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0820112610638578283fd5b604051608081018181106001600160401b038211171561065a5761065a6105e0565b60405260208501356001600160801b0381168114610676578384fd5b8152604085013567ffffffffffffffff81168114610692578384fd5b602082015260608501356040820152608085013560608201528091505092509250565b5f602082840312156106c5578081fd5b6106ce826103eb565b9392505050565b5f80604083850312156106e6578182fd5b6106ef836103d5565b9150610500602084016103eb565b60ff81168114610707575f80fd5b50565b5f805f6040848603121561071c578081fd5b833567ffffffffffffffff811115610732578182fd5b61073e8682870161038f565b9094509250506020840135610752816106fe565b809150509250925092565b600181811c9082168061077157607f821691505b60208210810361078f57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561024f575f81815260208120601f850160051c810160208610156107bb5750805b601f850160051c820191505b818110156107da578281556001016107c7565b505050505050565b67ffffffffffffffff8311156107fa576107fa6105e0565b61080e836108088354610760565b83610795565b5f601f84116001811461083f575f85156108285750838201355b5f19600387901b1c1916600186901b178355610897565b5f83815260209020601f19861690835b8281101561086f5786850135825560209485019460019092019101610852565b508682101561088b575f1960f88860031b161c19848701351681555b505060018560011b0183555b505050505050565b5f602082840312156108a1578081fd5b6106ce826103d5565b5f80604083850312156108bc578182fd5b6108c5836103d5565b91506020830135610752816106fe565b5f80604083850312156108e6578182fd5b6106ef836103eb565b5f805f80608085870312156108fe57610906565b5050823594602084013594506040840135936060013592509050565b5f805f60608486031215610930578081fd5b610939846103d5565b925060208401359150604084013567ffffffffffffffff811115610954578182fd5b8401601f81018613610964578182fd5b803567ffffffffffffffff81111561097e5761097e6105e0565b604051601f8201601f19908116603f011681019082821181831017156109a6576109a66105e0565b6040528181528382016020018810156109bd578384fd5b816020840160208301375f602083830101528093505050509250925092565b5f815180845260208085019450602084015f5b83811015610a1c576001600160401b038716825295820195908201906001016109f1565b509495945050505050565b600195909552602084019290925260408301526001600160801b03166060820152608081019190915260a0810191909152151560c082015260e0810191909152610100810191909152610120810191909152610140810191909152610160810191909152610180810191909152919050565b5f5b83811015610aaa578181015183820152602001610a92565b50505f910152565b5f5b83811015610acc578181015183820152602001610ab4565b838111156103ce575f838301525b50919050565b5f8082845f5b85811015610afc57610af68284610ab0565b83810191506020840193506001810190610ae6565b5050509392505050565b5f60208284031215610b16578081fd5b6106ce826103d5565b5f5b83811015610b39578181015183820152602001610b21565b50505f910152565b5f825161052081865f610b1f565b5f5b83811015610b69578181015183820152602001610b51565b838111156103ce575f838301525b5050919050565b73ffffffffffffffffffffffffffffffffffffffff8716815260ff8616602082015284604082015283606082015260c0608082015260018060a01b0385511660a082015260208501516001600160401b031660c082015260408501516001600160801b031660e08201526060850151610100820152608085015161012082015260a085015115156101408201525f60c08501516101608201525f60e08501516101808201525f6101008501516101a08201525f6101208501516101c0820152939793965050505050565b5f5b83811015610c3e578181015183820152602001610c26565b838111156103ce575f838301525b50919050565b73ffffffffffffffffffffffffffffffffffffffff8b168152602081018a905261ffff891660408201526001600160401b03881660608201526001600160801b0387166080820152151560a0820152835160c0820152602084015160e08201526040840151610100820152606084015161012082015260808401516101408201526101208401516101608201526101408401516101808201526101608401516101a08201526101808401516101c08201526101a08401516101e08201526101c084015161020082015260018060a01b03841661022082015260ff831661024082015250929b9a9950505050505050505050565b5f825161052081865f5b83811015610d3e578181015183820152602001610d26565b838111156103ce575f838301525b50919050565b5f5b83811015610d65578181015183820152602001610d4d565b50505f910152565b634e487b7160e01b5f52603260045260245ffd5b5f5b83811015610d9b578181015183820152602001610d83565b838111156103ce575f838301525b50919050565b5f5b83811015610dc8578181015183820152602001610db0565b838111156103ce575f838301525b50919050565b5f5b83811015610df5578181015183820152602001610ddd565b838111156103ce575f838301525b50919050565b8f835260e060208401525f610e2060e0840183610a1c565b82810360408401526104a88482610a1c565b600195909552602084019290925260408301526001600160801b03166060820152608081019190915260a0810191909152151560c082015260e0810191909152610100810191909152610120810191909152610140810191909152610160810191909152610180810191909152919050565b5f5f19603f8301168460051b8601505050565b600160028110610eb857634e487b7160e01b5f52602160045260245ffd5b9052565b805182526020810151602083015260408101516040830152606081015160608301526080810151608083015260a081015160a083015260c081015160c083015260e081015160e083015261010081015161010083015261012081015161012083015261014081015161014083015261016081015161016083015261018081015161018083015250565b600160028110610f4e57634e487b7160e01b5f52602160045260245ffd5b9052565b5f610200820190508251825260208301516020830152604083015160408301526060830151606083015260808301516080830152610f9260a0840184610ebc565b806101a08401525092915050565b5f5f19603f8301168460051b86019050505050565b600160028110610fc457634e487b7160e01b5f52602160045260245ffd5b9052565b5f61022082019050825182526020830151602083015260408301516040830152606083015160608301526080830151608083015261100760a0840184610f3e565b806101a08401525092915050565b5f5f19603f8301168460051b86019050505050565b600160028110611039576110396101df565b9052565b5f610240820190508251825260208301516020830152604083015160408301526060830151606083015260808301516080830152608083015160a083015260a083015160c083015260c083015160e08301526110a260e0840184611029565b806101c08401525092915050565b5f5f19603f8301168460051b86019050505050565b6001600160a01b03811681146110d8575f80fd5b50565b5f6101a082840312156110ec578081fd5b60405161020081018181106001600160401b0382111715611113576111136105e0565b60405261111f836103d5565b815260208301356001600160801b0381168114611140578182fd5b6020820152604083013567ffffffffffffffff81168114611160578182fd5b60408201526060830135606082015260808301356080820152611185606084016103eb565b60a082015260c0830135801515811461119c578182fd5b60c082015260e083013560e082015261010083013561010082015261012083013561012082015261014083013561014082015261016083013561016082015261018083013566ffffffffffffff811681146111f4578182fd5b6101808201529392505050565b5f5f19603f8301168460051b86019050505050565b600160028110611226576112266105e0565b9052565b5f61028082019050825182526020830151602083015260408301516040830152606083015160608301526080830151608083015260a083015160a083015260c083015160c083015260e083015160e08301526101008301516101008301526101208301516101208301526101408301516101408301526101608301516101608301526101808301516101808301526101a08301516101a08301526101c08301516101c08301526101e08301516101e083015261020083015161020083015261022083015166ffffffffffffff8116610240840152506111056101808401612216565b5f5f19603f8301168460051b86019050505050565b600160028110611329576113296105e0565b9052565b5f6102a082019050825182526020830151602083015260408301516040830152606083015160608301526080830151608083015260a083015160a083015260c083015160c083015260e083015160e08301526101008301516101008301526101208301516101208301526101408301516101408301526101608301516101608301526101808301516101808301526101a08301516101a08301526101c08301516101c08301526101e08301516101e083015261020083015161020083015261022083015166ffffffffffffff8116610240840152506108046101a0840184611319565b5f5f19603f8301168460051b86019050505050565b60016002811061142b5761142b6105e0565b9052565b5f6102c082019050825182526020830151602083015260408301516040830152606083015160608301526080830151608083015260a083015160a083015260c083015160c083015260e083015160e08301526101008301516101008301526101208301516101208301526101408301516101408301526101608301516101608301526101808301516101808301526101a08301516101a08301526101c08301516101c08301526101e08301516101e083015261020083015161020083015261022083015166ffffffffffffff8116610240840152506108226101c084018461141b565b5f5f19603f8301168460051b86019050505050565b600160028110611541576115416105e0565b9052565b5f6102e082019050825182526020830151602083015260408301516040830152606083015160608301526080830151608083015260a083015160a083015260c083015160c083015260e083015160e08301526101008301516101008301526101208301516101208301526101408301516101408301526101608301516101608301526101808301516101808301526101a08301516101a08301526101c08301516101c08301526101e08301516101e083015261020083015161020083015261022083015166ffffffffffffff8116610240840152506108406101e0840184611531565b5f5f19603f8301168460051b86019050505050565b600160028110611657576116576105e0565b9052565b5f610300820190508251825260208301516020830152604083015160408301526060830151606083015260808301516080830152600980830180515182526020015160208201526040015160408201526060015160608201526080015160808201525060a083015160a083015260c083015160c083015260e083015160e08301526101008301516101008301526101208301516101208301526101408301516101408301526101608301516101608301526101808301516101808301526101a08301516101a08301526101c08301516101c08301526101e08301516101e083015261020083015161020083015261022083015166ffffffffffffff8116610240840152506109476102008401846116476105e0565b5f5f19603f8301168460051b86019050505050565b600160028110611778576117786105e0565b9052565b5f610320820190508251825260208301516020830152604083015160408301526060830151606083015260808301516080830152600980830180515182526020015160208201526040015160408201526060015160608201526080015160808201525060a083015160a083015260c083015160c083015260e083015160e08301526101008301516101008301526101208301516101208301526101408301516101408301526101608301516101608301526101808301516101808301526101a08301516101a08301526101c08301516101c08301526101e08301516101e083015261020083015161020083015261022083015166ffffffffffffff8116610240840152506109656102208401846116476105e0565b5f5f19603f8301168460051b86019050505050565b600160028110611898576118986105e0565b9052565b5f610340820190508251825260208301516020830152604083015160408301526060830151606083015260808301516080830152600980830180515182526020015160208201526040015160408201526060015160608201526080015160808201525060a083015160a083015260c083015160c083015260e083015160e08301526101008301516101008301526101208301516101208301526101408301516101408301526101608301516101608301526101808301516101808301526101a08301516101a08301526101c08301516101c08301526101e08301516101e083015261020083015161020083015261022083015166ffffffffffffff8116610240840152506109836102408401846116476105e0565b5f5f19603f8301168460051b86019050505050565b5f1980603f830116846005848601900150505056fea264697066735822122074eb2d77af79d7ed9a04b3e1b9a4a0e77c0ad0e6bd3e0e5b6b1c8b6e3a1b4d5b64736f6c63430008170033";

describe("MidPay Contracts", function () {
  // Contracts
  let clientEth: MidPayClient;
  let clientMode: MidPayClient;
  let core: MidPayCore;
  let router: ExternalRouter;
  let usdc: FakeUSDC;
  let lzEndpointEth: any;
  let lzEndpointOptimism: any;

  // Chain IDs
  const ETH_CHAIN_ID = 101;
  const OPTIMISM_CHAIN_ID = 111;
  const MODE_CHAIN_ID = 919;

  // Users
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy USDC token
    const FakeUSDCFactory = await ethers.getContractFactory("FakeUSDC");
    usdc = await FakeUSDCFactory.deploy();

    // Deploy mock LayerZero endpoints using raw deployment
    const MockLZFactory = new ethers.ContractFactory(
      MockLayerZeroEndpointABI,
      MockLayerZeroEndpointBytecode,
      owner
    );
    lzEndpointEth = await MockLZFactory.deploy();
    lzEndpointOptimism = await MockLZFactory.deploy();

    // Deploy core contract on Optimism
    const MidPayCoreFactory = await ethers.getContractFactory("MidPayCore");
    core = await MidPayCoreFactory.deploy(
      await usdc.getAddress(),
      await lzEndpointOptimism.getAddress()
    );

    // Deploy external router
    const ExternalRouterFactory = await ethers.getContractFactory("ExternalRouter");
    router = await ExternalRouterFactory.deploy(
      await core.getAddress(),
      OPTIMISM_CHAIN_ID
    );

    // Deploy client contracts
    const MidPayClientFactory = await ethers.getContractFactory("MidPayClient");
    clientEth = await MidPayClientFactory.deploy(
      await usdc.getAddress(),
      await lzEndpointEth.getAddress(),
      await core.getAddress(),
      OPTIMISM_CHAIN_ID
    );

    clientMode = await MidPayClientFactory.deploy(
      await usdc.getAddress(),
      await lzEndpointEth.getAddress(), // Using same endpoint for simplicity
      await core.getAddress(),
      OPTIMISM_CHAIN_ID
    );

    // Set up trusted remotes
    const coreAddressBytes = ethers.solidityPacked(["address"], [await core.getAddress()]);
    await clientEth.setTrustedRemoteLookup(OPTIMISM_CHAIN_ID, coreAddressBytes);
    await clientMode.setTrustedRemoteLookup(OPTIMISM_CHAIN_ID, coreAddressBytes);

    const clientEthBytes = ethers.solidityPacked(["address"], [await clientEth.getAddress()]);
    const clientModeBytes = ethers.solidityPacked(["address"], [await clientMode.getAddress()]);
    await core.setTrustedRemoteLookup(ETH_CHAIN_ID, clientEthBytes);
    await core.setTrustedRemoteLookup(MODE_CHAIN_ID, clientModeBytes);

    // Set external router in core
    await core.setExternalRouter(await router.getAddress());

    // Mint USDC to users
    await usdc.mint(user1.address, parseUnits("1000", 18));
    await usdc.mint(user2.address, parseUnits("1000", 18));
  });

  describe("FakeUSDC", function () {
    it("Should mint tokens to owner", async function () {
      await usdc.mint(user1.address, parseUnits("500", 18));
      expect(await usdc.balanceOf(user1.address)).to.equal(parseUnits("1500", 18)); // 1000 from setup + 500 from mint
    });

    it("Should allow one-time minting", async function () {
      await usdc.connect(user2).mintOnce(user2.address);
      expect(await usdc.balanceOf(user2.address)).to.equal(parseUnits("1100", 18)); // 1000 + 100
      expect(await usdc.minted(user2.address)).to.be.true;

      // Should revert on second mint
      await expect(usdc.connect(user2).mintOnce(user2.address))
        .to.be.revertedWith("FakeUSDC: already minted");
    });

    it("Should only allow owner to mint", async function () {
      await expect(usdc.connect(user1).mint(user1.address, parseUnits("100", 18)))
        .to.be.reverted;
    });
  });

  describe("MidPayCore Direct Operations", function () {
    it("Should allow direct deposit", async function () {
      const amount = parseUnits("100", 18);

      await usdc.connect(user1).approve(await core.getAddress(), amount);
      await core.connect(user1).deposit(amount);

      expect(await core.balances(user1.address)).to.equal(amount);
      expect(await usdc.balanceOf(await core.getAddress())).to.equal(amount);
    });

    it("Should allow direct withdrawal", async function () {
      const amount = parseUnits("100", 18);

      // First deposit
      await usdc.connect(user1).approve(await core.getAddress(), amount);
      await core.connect(user1).deposit(amount);

      // Then withdraw
      await core.connect(user1).withdraw(amount);

      expect(await core.balances(user1.address)).to.equal(0);
      expect(await usdc.balanceOf(user1.address)).to.equal(parseUnits("1000", 18)); // Back to original balance
    });

    it("Should revert on insufficient balance withdrawal", async function () {
      await expect(core.connect(user1).withdraw(parseUnits("100", 18)))
        .to.be.reverted; // Should revert due to underflow
    });
  });

  describe("MidPayClient Operations", function () {
    it("Should handle deposit request", async function () {
      const amount = parseUnits("100", 18);

      await usdc.connect(user1).approve(await clientEth.getAddress(), amount);

      // Fund the client with ETH for LZ fees and make deposit
      await clientEth.connect(user1).deposit(amount, { value: parseEther("0.001") });

      // Check that USDC was transferred to client
      expect(await usdc.balanceOf(await clientEth.getAddress())).to.equal(amount);
      expect(await usdc.balanceOf(user1.address)).to.equal(parseUnits("900", 18));
    });

    it("Should handle withdrawal request", async function () {
      const amount = parseUnits("100", 18);

      // Make withdrawal request
      await clientEth.connect(user1).withdraw(amount, { value: parseEther("0.001") });

      // This should send a cross-chain message but not immediately transfer tokens
      expect(await usdc.balanceOf(user1.address)).to.equal(parseUnits("1000", 18)); // No immediate change
    });
  });

  describe("Cross-Chain Flow", function () {
    it("Should handle full deposit flow", async function () {
      const amount = parseUnits("100", 18);

      // 1. User deposits on client chain
      await usdc.connect(user1).approve(await clientEth.getAddress(), amount);
      await clientEth.connect(user1).deposit(amount, { value: parseEther("0.001") });

      // 2. Simulate cross-chain message delivery
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, amount, true]
      );
      const srcAddress = ethers.solidityPacked(["address"], [await clientEth.getAddress()]);

      await lzEndpointOptimism.triggerReceive(
        await core.getAddress(),
        ETH_CHAIN_ID,
        srcAddress,
        1,
        payload
      );

      // 3. Check that balance is updated on core
      expect(await core.balances(user1.address)).to.equal(amount);
    });

    it("Should handle full withdrawal flow", async function () {
      const depositAmount = parseUnits("200", 18);
      const withdrawAmount = parseUnits("100", 18);

      // 1. First, user needs balance on core (direct deposit for simplicity)
      await usdc.connect(user1).approve(await core.getAddress(), depositAmount);
      await core.connect(user1).deposit(depositAmount);

      // 2. User requests withdrawal from client
      await clientEth.connect(user1).withdraw(withdrawAmount, { value: parseEther("0.001") });

      // 3. Simulate cross-chain message delivery for withdrawal request
      const withdrawPayload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, withdrawAmount, false]
      );
      const srcAddress = ethers.solidityPacked(["address"], [await clientEth.getAddress()]);

      await lzEndpointOptimism.triggerReceive(
        await core.getAddress(),
        ETH_CHAIN_ID,
        srcAddress,
        1,
        withdrawPayload
      );

      // 4. Check that balance is reduced on core
      expect(await core.balances(user1.address)).to.equal(depositAmount - withdrawAmount);

      // 5. Simulate return message to client
      const returnPayload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, withdrawAmount]
      );
      const coreAddressBytes = ethers.solidityPacked(["address"], [await core.getAddress()]);

      await lzEndpointEth.triggerReceive(
        await clientEth.getAddress(),
        OPTIMISM_CHAIN_ID,
        coreAddressBytes,
        1,
        returnPayload
      );

      // 6. Check that user received tokens
      expect(await usdc.balanceOf(user1.address)).to.equal(parseUnits("1000", 18) + withdrawAmount); // Original + withdrawn
    });
  });

  describe("ExternalRouter", function () {
    it("Should queue messages", async function () {
      const destination = ethers.solidityPacked(
        ["address", "address"],
        [await clientEth.getAddress(), await core.getAddress()]
      );
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, parseUnits("100", 18), true]
      );

      await router.connect(core).send(
        ETH_CHAIN_ID,
        destination,
        payload,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        "0x"
      );

      expect(await router.queueLength()).to.equal(1);
    });

    it("Should only allow MidPay to send", async function () {
      const destination = ethers.solidityPacked(
        ["address", "address"],
        [await clientEth.getAddress(), await core.getAddress()]
      );
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, parseUnits("100", 18), true]
      );

      await expect(
        router.connect(user1).send(
          ETH_CHAIN_ID,
          destination,
          payload,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          "0x"
        )
      ).to.be.revertedWith("ExternalRouter: Only MidPay can call this function");
    });

    it("Should allow owner to pop messages", async function () {
      const destination = ethers.solidityPacked(
        ["address", "address"],
        [await clientEth.getAddress(), await core.getAddress()]
      );
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, parseUnits("100", 18), true]
      );

      // Add a message
      await router.connect(core).send(
        ETH_CHAIN_ID,
        destination,
        payload,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        "0x"
      );

      expect(await router.queueLength()).to.equal(1);

      // Pop the message
      await router.connect(owner).pop();

      expect(await router.queueLength()).to.equal(0);
    });

    it("Should revert when popping empty queue", async function () {
      await expect(router.connect(owner).pop())
        .to.be.revertedWith("ExternalRouter: No messages in queue");
    });
  });

  describe("Access Control", function () {
    it("Should restrict MidPayCore setter functions to owner", async function () {
      const newEndpoint = ethers.Wallet.createRandom().address;
      const newRouter = ethers.Wallet.createRandom().address;
      const newUsdc = ethers.Wallet.createRandom().address;

      // Test that non-owner cannot call setter functions
      await expect(core.connect(user1).setLayerZeroEndpoint(newEndpoint)).to.be.reverted;
      await expect(core.connect(user1).setExternalRouter(newRouter)).to.be.reverted;
      await expect(core.connect(user1).setUsdc(newUsdc)).to.be.reverted;

      // Test that owner can call setter functions
      await core.connect(owner).setLayerZeroEndpoint(newEndpoint);
      await core.connect(owner).setExternalRouter(newRouter);
      await core.connect(owner).setUsdc(newUsdc);
    });

    it("Should restrict MidPayClient setter functions to owner", async function () {
      const newEndpoint = ethers.Wallet.createRandom().address;
      const newCore = ethers.Wallet.createRandom().address;
      const newUsdc = ethers.Wallet.createRandom().address;

      await expect(clientEth.connect(user1).setLayerZeroEndpoint(newEndpoint)).to.be.reverted;
      await expect(clientEth.connect(user1).setCoreAddress(newCore)).to.be.reverted;
      await expect(clientEth.connect(user1).setCoreChainId(123)).to.be.reverted;
      await expect(clientEth.connect(user1).setUsdc(newUsdc)).to.be.reverted;
    });
  });

  describe("Error Handling", function () {
    it("Should handle invalid endpoint", async function () {
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, parseUnits("100", 18), true]
      );
      const srcAddress = ethers.solidityPacked(["address"], [await clientEth.getAddress()]);

      // Call from invalid endpoint (user1 instead of lzEndpoint)
      await expect(
        core.connect(user1).lzReceive(ETH_CHAIN_ID, srcAddress, 1, payload)
      ).to.not.be.reverted; // Should not revert but should emit InvalidEndpoint event

      // Balance should not be updated
      expect(await core.balances(user1.address)).to.equal(0);
    });

    it("Should handle untrusted remote", async function () {
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, parseUnits("100", 18), true]
      );
      const srcAddress = ethers.solidityPacked(["address"], [ethers.Wallet.createRandom().address]);

      await lzEndpointOptimism.triggerReceive(
        await core.getAddress(),
        ETH_CHAIN_ID,
        srcAddress,
        1,
        payload
      );

      // Should emit LookupNotTrusted event and return early
      expect(await core.balances(user1.address)).to.equal(0);
    });

    it("Should handle duplicate hash", async function () {
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, parseUnits("100", 18), true]
      );
      const srcAddress = ethers.solidityPacked(["address"], [await clientEth.getAddress()]);

      // First call should succeed
      await lzEndpointOptimism.triggerReceive(
        await core.getAddress(),
        ETH_CHAIN_ID,
        srcAddress,
        1,
        payload
      );
      expect(await core.balances(user1.address)).to.equal(parseUnits("100", 18));

      // Second call with same parameters should be ignored
      await lzEndpointOptimism.triggerReceive(
        await core.getAddress(),
        ETH_CHAIN_ID,
        srcAddress,
        1,
        payload
      );
      expect(await core.balances(user1.address)).to.equal(parseUnits("100", 18)); // No change
    });

    it("Should handle withdrawal with insufficient balance", async function () {
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, parseUnits("100", 18), false] // withdraw 100
      );
      const srcAddress = ethers.solidityPacked(["address"], [await clientEth.getAddress()]);

      // User has 0 balance, should emit NotEnoughBalance
      await lzEndpointOptimism.triggerReceive(
        await core.getAddress(),
        ETH_CHAIN_ID,
        srcAddress,
        1,
        payload
      );

      expect(await core.balances(user1.address)).to.equal(0);
    });
  });

  describe("ETH Withdrawal", function () {
    it("Should allow owner to withdraw ETH from core", async function () {
      // Send some ETH to the core contract
      await owner.sendTransaction({
        to: await core.getAddress(),
        value: parseEther("1")
      });

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await core.connect(owner).withdrawEth();

      expect(await ethers.provider.getBalance(await core.getAddress())).to.equal(0);
      // Note: Can't check exact balance due to gas costs
    });

    it("Should allow owner to withdraw ETH from client", async function () {
      // Send some ETH to the client contract
      await owner.sendTransaction({
        to: await clientEth.getAddress(),
        value: parseEther("1")
      });

      await clientEth.connect(owner).withdrawEth();

      expect(await ethers.provider.getBalance(await clientEth.getAddress())).to.equal(0);
    });

    it("Should allow owner to withdraw ETH from router", async function () {
      // Send some ETH to the router contract
      await owner.sendTransaction({
        to: await router.getAddress(),
        value: parseEther("1")
      });

      await router.connect(owner).withdraw();

      expect(await ethers.provider.getBalance(await router.getAddress())).to.equal(0);
    });
  });

  describe("Integration Test", function () {
    it("Should handle full deposit and withdrawal cycle", async function () {
      const amount = parseUnits("150", 18);

      // 1. User approves and deposits on client
      await usdc.connect(user1).approve(await clientEth.getAddress(), amount);
      await clientEth.connect(user1).deposit(amount, { value: parseEther("0.001") });

      // 2. Simulate cross-chain deposit message
      const depositPayload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, amount, true]
      );
      const srcAddress = ethers.solidityPacked(["address"], [await clientEth.getAddress()]);

      await lzEndpointOptimism.triggerReceive(
        await core.getAddress(),
        ETH_CHAIN_ID,
        srcAddress,
        1,
        depositPayload
      );

      // Verify deposit
      expect(await core.balances(user1.address)).to.equal(amount);
      expect(await usdc.balanceOf(await clientEth.getAddress())).to.equal(amount);

      // 3. User requests withdrawal
      await clientEth.connect(user1).withdraw(amount, { value: parseEther("0.001") });

      // 4. Simulate cross-chain withdrawal message
      const withdrawPayload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool"],
        [user1.address, amount, false]
      );

      await lzEndpointOptimism.triggerReceive(
        await core.getAddress(),
        ETH_CHAIN_ID,
        srcAddress,
        2,
        withdrawPayload
      );

      // Verify withdrawal
      expect(await core.balances(user1.address)).to.equal(0);

      // 5. Simulate return message to complete withdrawal
      const returnPayload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, amount]
      );
      const coreAddressBytes = ethers.solidityPacked(["address"], [await core.getAddress()]);

      await lzEndpointEth.triggerReceive(
        await clientEth.getAddress(),
        OPTIMISM_CHAIN_ID,
        coreAddressBytes,
        1,
        returnPayload
      );

      // Final verification
      expect(await usdc.balanceOf(user1.address)).to.equal(parseUnits("1000", 18)); // Back to original
      expect(await usdc.balanceOf(await clientEth.getAddress())).to.equal(0); // Client has no tokens
    });
  });
});
