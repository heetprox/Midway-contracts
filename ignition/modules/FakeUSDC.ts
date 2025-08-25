import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FakeUSDCModule = buildModule("FakeUSDCModule", (m) => {
  const fakeUSDC = m.contract("FakeUSDC", []);

  return { fakeUSDC };
});

export default FakeUSDCModule;