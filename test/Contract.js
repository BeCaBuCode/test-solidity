const { expect } = require("chai");
const abi = require('../artifacts/contracts/Contract.sol/SeedToken.json').abi;
const bytecode = require('../artifacts/contracts/Contract.sol/SeedToken.json').bytecode;

describe("SeedToken Test", function () {
    /*const mnemonic = 'wood zebra throw venture possible ugly pencil story hurry worry minute panel';
    const wallet = new ethers.Wallet(ethers.Wallet.fromPhrase(mnemonic).privateKey, ethers.provider);
    const mnemonic2 = 'music goose pitch observe cradle double water budget swim crew water canyon';
    const wallet2 = new ethers.Wallet(ethers.Wallet.fromPhrase(mnemonic2).privateKey, ethers.provider);*/

    const wallet = web3.eth.accounts.privateKeyToAccount(
        '0xd8689f37d9c31c143b2c5f8a53ef166adf9f8f9db3d41d4205efa44f9264e2c2'
    );
    const wallet2 = web3.eth.accounts.privateKeyToAccount(
        '0x02165b45f7653cd5cd4d5d474b4469920a312aca1f0ea5b909cd8a5e27f6eb47' 
    );

    let deployer;
    let seedToken;

    before(async function() {
        //[deployer] = await ethers.getSigners();
        [deployer] = await web3.eth.getAccounts();
        /*await deployer.sendTransaction({
            from: deployer.address,
            to: wallet.address,
            value: ethers.parseEther("100")
        });
        await deployer.sendTransaction({
            from: deployer.address,
            to: wallet2.address,
            value: ethers.parseEther("100")
        });*/
        await web3.eth.sendTransaction({
            from: deployer,
            to: wallet.address,
            value: web3.utils.toWei('100', 'ether')
        });
        await web3.eth.sendTransaction({
            from: deployer,
            to: wallet2.address,
            value: web3.utils.toWei('100', 'ether')
        });
    });

    beforeEach(async function() {
        //const SeedToken = await ethers.getContractFactory("SeedToken");
        const SeedToken = new web3.eth.Contract(abi);
        //seedToken = await SeedToken.deploy(deployer.address, "Seed Token", "SEED");
        const deployment = SeedToken.deploy({
            data: bytecode,
            arguments: [deployer, "Seed Token", "SEED"]
        });
        //await seedToken.waitForDeployment();
        const receipt = await deployment.send({
            from: deployer
        });
        seedToken = new web3.eth.Contract(
            abi,
            receipt.options.address,
            web3Context
        );
    });

    it("sets the original owner correctly", async function () {
        //const originalOwner = await seedToken.owner();
        const originalOwner = await seedToken.methods.owner().call();

        //expect(originalOwner).to.equal(deployer.address);
        expect(originalOwner).to.equal(deployer);
    });
    it("allows the owner to set a new owner", async function () {
        //let response = await seedToken.changeOwner(wallet.address);
        await seedToken.methods.changeOwner(wallet.address).send({
            from: deployer
        });
        //await response.wait();
        //const newOwner = await seedToken.owner();
        const newOwner = await seedToken.methods.owner().call();
        //expect(newOwner).to.equal(wallet.address);
        expect(newOwner).to.equal(wallet.address);
    });
    it("does not allow anyone else to set a new owner", async function () {
        let isExceptionThrown = false;
        /*try {
            await seedToken.connect(wallet).changeOwner(wallet.address);
        } catch (e) { 
            isExceptionThrown = true;
        }*/
        try {
            const tx = {
                from: wallet.address,
                to: seedToken.address,
                gas: 1000000,
                gasPrice: 10000000000,
                data: seedToken.methods.changeOwner(wallet.address).encodeABI()
            }
            const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.privateKey);
            await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        } catch (e) { //expected
            isExceptionThrown = true;
        }
        expect(isExceptionThrown, "exception to be thrown on changing the owner").to.be.true;
    });
    it("allows the owner to mint tokens", async function () {
        //const decimals = await seedToken.decimals();
        const decimals = await seedToken.methods.decimals().call();

        const divisor = 10n ** decimals;

        //const originalAmount = await seedToken.totalSupply() / divisor;
        const originalAmount = 
            await seedToken.methods.totalSupply().call() / divisor;

        /*const response = await seedToken.changeOwner(wallet.address);
        await response.wait();*/
        await seedToken.methods.changeOwner(wallet.address).send({
            from: deployer
        });

        /*const response2 = await seedToken.connect(wallet).mint(12345);
        await response2.wait();*/
        const tx = {
            from: wallet.address,
            to: seedToken._address,
            gas: 1000000,
            gasPrice: 10000000000,
            data: seedToken.methods.mint(12345).encodeABI()
        }
        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.privateKey);
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        //const mintedAmount = await seedToken.totalSupply() / divisor;
        const mintedAmount = await seedToken.methods.totalSupply().call() / divisor;

        expect(originalAmount).to.equal(0);

        expect(mintedAmount).to.equal(12345);
    });
    it("does not allow anyone else to mint tokens", async function () {
        /*const response = await seedToken.changeOwner(wallet.address);
        await response.wait();*/
        await seedToken.methods.changeOwner(wallet.address).send({
            from: deployer
        });
        let isExceptionThrown = false;
        /*try {
            await seedToken.connect(wallet2).mint(67890);
        } catch (e) { //expected
            isExceptionThrown = true;
        }*/
        try {
            const tx2 = {
                from: wallet2.address,
                to: seedToken._address,
                gas: 1000000,
                gasPrice: 10000000000,
                data: seedToken.methods.mint(67890).encodeABI()
            }
            const signedTx2 = await web3.eth.accounts.signTransaction(tx2, wallet2.privateKey);
            await web3.eth.sendSignedTransaction(signedTx2.rawTransaction);
        } catch (e) { 
            isExceptionThrown = true;
        }
        expect(isExceptionThrown, "exception to be thrown on minting tokens").to.be.true;
    });
});