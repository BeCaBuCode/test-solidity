const { expect } = require("chai");
const abi = require('../artifacts/contracts/Contract.sol/SeedToken.json').abi;
const bytecode = require('../artifacts/contracts/Contract.sol/SeedToken.json').bytecode;

const maxContractSize = 24*1024;

describe("Compiled Smart Contracts Size Test", function () {
    it("Should deploy the SeedToken contract", async function () {
        //const SeedToken = await ethers.getContractFactory("SeedToken");

        const SeedToken = new web3.eth.Contract(abi);
        //[deployer] = await ethers.getSigners();
        [deployer] = await web3.eth.getAccounts();

        //const seedToken = await SeedToken.deploy(deployer.address, "Seed Token", "SEED");
        //await seedToken.waitForDeployment();
        const deployment = SeedToken.deploy({
            data: bytecode,
            arguments: [deployer, "Seed Token", "SEED"]
        });
        const receipt = await deployment.send({
            from: deployer
        });
        //const deployedAddress = await seedToken.getAddress();
        const deployedAddress = receipt.options.address;
        expect(deployedAddress).to.exist;
        const deployedCode = await web3.eth.getCode(deployedAddress);
        const size = (deployedCode.length - 2)/2;
        console.log('    SeedToken contract size: ' + size + ' bytes');
        expect(size <= maxContractSize).to.be.true;
    });
});