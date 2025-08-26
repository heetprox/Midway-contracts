const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const FakeUSDCModule = buildModule("FakeUSDCModule", (m) => {
  const fakeUSDC = m.contract("FakeUSDC", []);

  return { fakeUSDC };
});

module.exports = FakeUSDCModule;