import WalletConnectProvider from "@walletconnect/web3-provider";
//import Torus from "@toruslabs/torus-embed"
import WalletLink from "walletlink";
import { CopyBlock, dracula } from "react-code-blocks";
import { Alert, Button, Col, Input, Menu, Row, Image, Form, Card, List } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch, useHistory } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import fs from "fs";
import { Account, AddressInput, Contract, GasGauge, Header, Ramp, ThemeSwitch } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import { useDropzone } from "react-dropzone";
import dotenv from "dotenv";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
// import Hints from "./Hints";
import { ExampleUI, Hints, Subgraph, NewMerkler } from "./views";
import { InfoCircleOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";

// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import externalContracts from "./contracts/external_contracts";

import { useContractConfig } from "./hooks";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Authereum from "authereum";

import { NFTStorage, File, Blob } from "nft.storage";
const client = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDllRjc3OGNjQ0VCOEQ2NTg2ZDllRjYxYTEwNTk1Y0QyNDUwMGU5YUQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNTQ4MDM3MDAxMywibmFtZSI6ImRkIn0.Cy-vLvDjMBUGw8vuXTcM7Lv0Lj07aPx_S_LpHwRnV6c",
});

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

function Previews({ files, setFiles }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg, image/png",
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFiles(
        acceptedFiles.map(file =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
            pinblob: pintoStorage(file),
          }),
        ),
      );
    },
  });

  const thumbs = files.map(file => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} />
      </div>
    </div>
  ));

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach(file => URL.revokeObjectURL(file.preview));
    },
    [files],
  );

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside style={thumbsContainer}>{thumbs}</aside>
    </section>
  );
}

<Previews />;

async function pintoStorage(file) {
  //var url = URL.createObjectURL(file)
  //const data = await fs.promises.readFile(`${url}`)
  var cid = await client.storeBlob(new Blob([file]));
  console.log(cid);

  return cid;
}
const ObjectsToCsv = require("objects-to-csv");
const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const poktMainnetProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(
      "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
    )
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID
// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

// Portis ID: 6255fb2b-58c8-433b-a2c9-62098c05ddc9
/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: "https://dai.poa.network", // xDai
        },
      },
    },
    portis: {
      display: {
        logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
        name: "Portis",
        description: "Connect to Portis App",
      },
      package: Portis,
      options: {
        id: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "pk_live_5A7C91B2FC585A17", // required
      },
    },
    // torus: {
    //   package: Torus,
    //   options: {
    //     networkParams: {
    //       host: "https://localhost:8545", // optional
    //       chainId: 1337, // optional
    //       networkId: 1337 // optional
    //     },
    //     config: {
    //       buildEnv: "development" // optional
    //     },
    //   },
    // },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, _options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  },
});

function App(props) {
  const history = useHistory();
  const mainnetProvider =
    poktMainnetProvider && poktMainnetProvider._isProvider
      ? poktMainnetProvider
      : scaffoldEthProvider && scaffoldEthProvider._network
      ? scaffoldEthProvider
      : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [userQuery, setUserQuery] = useState();
  const [userQuery2, setUserQuery2] = useState();
  const [userToken, setUserToken] = useState();
  const [userValue, setUserValue] = useState();
  const [sending, setSending] = useState();
  const [sheet, setSheet] = useState();
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [files, setFiles] = useState([]);
  const [massDropRecepients, setMassDropRecepients] = useState([]);

  async function makeAList(data, userValue, userToken) {
    //data logging is working
    //create CSV using user inputs in form of buttons for distribution amounts or token IDs
    const csvArray = [];
    for (let x in data.data.items) {
      console.log(data.data.items[x].address);
      var obj = {
        address: data.data.items[x].address,
        value: userValue,
      };
      csvArray.push(obj);
      console.log(csvArray);
    }
    makethesheet(csvArray);
  }

  async function makeIteratedList(data, userToken) {
    const csvArray = [];
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

    var itList = range(1, userToken, 1);

    if (itList.length > data.data.items.length) {
      for (let x in data.data.items) {
        var obj = {
          address: data.data.items[x].address,
          value: itList[x],
        };
        csvArray.push(obj);
        makethesheet(csvArray);
      }
    } else {
      for (let x in itList) {
        var obj = {
          address: data.data.items[x].address,
          value: itList[x],
        };
        csvArray.push(obj);
      }
      makethesheet(csvArray);
    }
  }

  async function makethesheet(csvArray) {
    const csv = new ObjectsToCsv(csvArray);
    const theSheet = await csv.toString();
    var newSheet = theSheet.split("\n").slice(1).join("\n");
    console.log(newSheet);
    setSheet(newSheet);
  }

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  //const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts, "YourContract", "purpose");

  // 📟 Listen for broadcast events
  const setPurposeEvents = useEventListener(readContracts, "NFTDeployer", "Deployed", localProvider, 1);

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts &&
      mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
      console.log("📝 readContracts", readContracts);
      console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    mainnetContracts,
  ]);

  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);

                    let switchTx;
                    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: data[0].chainId }],
                      });
                    } catch (switchError) {
                      // not checking specific error code, because maybe we're not using MetaMask
                      try {
                        switchTx = await ethereum.request({
                          method: "wallet_addEthereumChain",
                          params: data,
                        });
                      } catch (addError) {
                        // handle "add" error
                      }
                    }

                    if (switchTx) {
                      console.log(switchTx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              YourContract
            </Link>
          </Menu.Item>
          <Menu.Item key="/newNFT">
            <Link
              onClick={() => {
                setRoute("/newNFT");
              }}
              to="/newNFT"
            >
              newNFT
            </Link>
          </Menu.Item>
          <Menu.Item key="/DistributeERC20">
            <Link
              onClick={() => {
                setRoute("/DistributeERC20");
              }}
              to="/DistributeERC20"
            >
              ERC20_CSV
            </Link>
          </Menu.Item>
          <Menu.Item key="/DistributeNFT">
            <Link
              onClick={() => {
                setRoute("/DistributeNFT");
              }}
              to="/DistributeNFT"
            >
              NFT_CSV
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}

            <Contract
              name="SimpleNFT"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={contractConfig}
            />
          </Route>
          <Route exact path="/instance">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
            <Card title={"Deployments"} style={{ maxWidth: 600, margin: "auto", marginTop: 10 }}>
              <List
                itemLayout="horizontal"
                rowKey={item => `${item.transactionHash}_${item.logIndex}`}
                dataSource={setPurposeEvents}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Link to={`/view/${item.args._address}`}>
                          <Address value={item.args._address} />
                        </Link>
                      }
                      description={`${ethers.utils.formatUnits(item.args._amount, item.args._decimals)} ${
                        item.args._symbol
                      } dropped by ${item.args._dropper}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Route>
          <Route path="/view/:merkler">
            <Contract
              readContracts={readContracts}
              writeContracts={writeContracts}
              localProvider={localProvider}
              userSigner={userSigner}
              address={address}
              localChainId={localChainId}
            />
          </Route>
          <Route exact path="/newNFT">
            <div style={{ paddingTop: 32, width: 740, margin: "auto" }}>
              <Previews files={files} setFiles={setFiles} />
              <h1>Drag and drop a png/jpeg </h1>
              <h2> {!pintoStorage} </h2>

              <label>Recepients</label>
              <Input
                placeholder='["0x00000000", "0x111111111"]'
                value={massDropRecepients}
                onChange={e => setMassDropRecepients(e.target.value)}
              />

              <Button
                onClick={async () => {
                  const result = tx(
                    writeContracts.NFTDropper.massDrop(
                      readContracts.NFTDeployer.address,
                      JSON.parse(massDropRecepients),
                      files[0].pinblob,
                    ),
                  )
                    .then(result => {
                      console.log(result);
                      result.wait().then(receipt => {
                        console.log(receipt);
                      });
                    })
                    .catch(err => {
                      //handle error here
                      console.log(err);
                    });
                }}
              >
                Drop NFTS
              </Button>
              <Contract
                name="NFTDeployer"
                signer={userSigner}
                provider={localProvider}
                address={address}
                blockExplorer={blockExplorer}
                contractConfig={contractConfig}
              />
              <Input
                onChange={e => {
                  setNewPurpose(e.target.value);
                }}
              />
              <Button
                style={{ marginTop: 8 }}
                onClick={async () => {
                  /* look how you call setPurpose on your contract: */
                  /* notice how you pass a call back for tx updates too */
                  const result = tx(writeContracts.SimpleNFT.initializeSimpleNFT(newPurpose))
                    .then(result => {
                      console.log(result);
                      result.wait().then(receipt => {
                        console.log(receipt);
                        history.push(`/view/${receipt.events[receipt.events.length - 1].args._address}`);
                      });
                    })
                    .catch(err => {
                      //handle error here
                      console.log(err);
                    });
                }}
              >
                Set Purpose!
              </Button>
              <Contract
                name="NFTDropper"
                signer={userSigner}
                provider={localProvider}
                address={address}
                blockExplorer={blockExplorer}
                contractConfig={contractConfig}
              />
            </div>
          </Route>
          <Route path="/Merkler">
            <NewMerkler
              readContracts={readContracts}
              writeContracts={writeContracts}
              localProvider={localProvider}
              userSigner={userSigner}
              address={address}
            />
          </Route>
          <Route path="/hints">
            <Hints
              address={address}
              yourLocalBalance={yourLocalBalance}
              mainnetProvider={mainnetProvider}
              price={price}
            />
          </Route>
          <Route path="/DistributeERC20">
            <div style={{ paddingTop: 32, width: 740, margin: "auto" }}>
              <h1>Enter a value to send to each address</h1>
              <Input
                style={{ margin: 16 }}
                value={userValue}
                placeHolder="Enter Value to mass send"
                onChange={e => {
                  setUserValue(e.target.value);
                }}
              />
              <h1>Select a Public Goods Project</h1>
              <h2>(dont forget value up top)</h2>
              <Button
                style={{ margin: 16 }}
                loading={sending}
                size="large"
                shape="round"
                type="primary"
                onClick={async () => {
                  //chain_id = 1 for ETH, 137 for Polygon/Matic, 43114 for Binance
                  // Grabs list of all holders of token / nft, so we can append a value,
                  // and make a merkle json for IPFS
                  const result = await fetch(
                    `https://api.covalenthq.com/v1/1/tokens/0x8b13e88ead7ef8075b58c94a7eb18a89fd729b18/token_holders/?page-size=2000&key=ckey_2c198a798bdc4553b499279fe87`,
                  )
                    .then(response => response.json())
                    //take data and organize in CSV with Holders -> amounts or token number
                    //Amounts will be preset buttons, placed in CSV adjacent
                    .then(data => makeAList(data, userValue));
                }}
              >
                Moonshot Bots
              </Button>
              <Button
                style={{ margin: 16 }}
                loading={sending}
                size="large"
                shape="round"
                type="primary"
                onClick={async () => {
                  //chain_id = 1 for ETH, 137 for Polygon/Matic, 43114 for Binance
                  // Grabs list of all holders of token / nft, so we can append a value,
                  // and make a merkle json for IPFS
                  const result = await fetch(
                    `https://api.covalenthq.com/v1/1/tokens/0x82C7c02a52B75387DB14FA375938496cbb984388/token_holders/?page-size=2000&key=ckey_2c198a798bdc4553b499279fe87`,
                  )
                    .then(response => response.json())
                    //take data and organize in CSV with Holders -> amounts or token number
                    //Amounts will be preset buttons, placed in CSV adjacent
                    .then(data => makeAList(data, userValue));
                }}
              >
                LARP(ETHBots)
              </Button>
              <Button
                style={{ margin: 16 }}
                loading={sending}
                size="large"
                shape="round"
                type="primary"
                onClick={async () => {
                  //chain_id = 1 for ETH, 137 for Polygon/Matic, 43114 for Binance
                  // Grabs list of all holders of token / nft, so we can append a value,
                  // and make a merkle json for IPFS
                  const result = await fetch(
                    `https://api.covalenthq.com/v1/1/tokens/0x42dcba5da33cddb8202cc182a443a3e7b299dadb/token_holders/?page-size=2000&key=ckey_2c198a798bdc4553b499279fe87`,
                  )
                    .then(response => response.json())
                    //take data and organize in CSV with Holders -> amounts or token number
                    //Amounts will be preset buttons, placed in CSV adjacent
                    .then(data => makeAList(data, userValue));
                }}
              >
                LARP(Molochs)
              </Button>
              <Button
                style={{ margin: 16 }}
                loading={sending}
                size="large"
                shape="round"
                type="primary"
                onClick={async () => {
                  //chain_id = 1 for ETH, 137 for Polygon/Matic, 43114 for Binance
                  // Grabs list of all holders of token / nft, so we can append a value,
                  // and make a merkle json for IPFS
                  const result = await fetch(
                    `https://api.covalenthq.com/v1/1/tokens/0xf5918382Dd20Ecba89747c50f80fB7f9f1e0524C/token_holders/?page-size=2000&key=ckey_2c198a798bdc4553b499279fe87`,
                  )
                    .then(response => response.json())
                    //take data and organize in CSV with Holders -> amounts or token number
                    //Amounts will be preset buttons, placed in CSV adjacent
                    .then(data => makeAList(data, userValue));
                }}
              >
                RainbowRolls
              </Button>
              <Button
                style={{ margin: 16 }}
                loading={sending}
                size="large"
                shape="round"
                type="primary"
                onClick={async () => {
                  //chain_id = 1 for ETH, 137 for Polygon/Matic, 43114 for Binance
                  // Grabs list of all holders of token / nft, so we can append a value,
                  // and make a merkle json for IPFS
                  const result = await fetch(
                    `https://api.covalenthq.com/v1/1/tokens/0x711d2aC13b86BE157795B576dE4bbe6827564111/token_holders/?page-size=2000&key=ckey_2c198a798bdc4553b499279fe87`,
                  )
                    .then(response => response.json())
                    //take data and organize in CSV with Holders -> amounts or token number
                    //Amounts will be preset buttons, placed in CSV adjacent
                    .then(data => makeAList(data, userValue));
                }}
              >
                Mars-Shot Bots
              </Button>
              <Button
                style={{ margin: 16 }}
                loading={sending}
                size="large"
                shape="round"
                type="primary"
                onClick={async () => {
                  //chain_id = 1 for ETH, 137 for Polygon/Matic, 43114 for Binance
                  // Grabs list of all holders of token / nft, so we can append a value,
                  // and make a merkle json for IPFS
                  const result = await fetch(
                    `https://api.covalenthq.com/v1/1/tokens/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03/token_holders/?page-size=2000&key=ckey_2c198a798bdc4553b499279fe87`,
                  )
                    .then(response => response.json())
                    //take data and organize in CSV with Holders -> amounts or token number
                    //Amounts will be preset buttons, placed in CSV adjacent
                    .then(data => makeAList(data, userValue));
                }}
              >
                Nouns.wtf
              </Button>
              {/* <Form.Item
          label="Recipients and amounts"
          name="recipients"
          style={{ margin: 0 }}
          tooltip={{
            title: "Enter each recipient as a separate row, with their address and the amount in whole units e.g. 1.0",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input.TextArea
            placeholder={`0xaddress,amount\n0xaddress,amount\n0xaddress,amount`}
            onChange={event => {
              const results = readString(event.target.value, { dynamicTyping: true });

              let newAmountRequired;
              let invalidData;

              try {
                if (results.data) {
                  newAmountRequired = results.data.reduce((previousValue, current) => {
                    if (
                      !ethers.utils.isAddress(current[0]) ||
                      !(current.length == 2 || (current.length == 3 && current[2] == "")) ||
                      !(typeof current[1] === "number")
                    ) {
                      invalidData = true;
                    }
                    return Math.round((previousValue + current[1]) * 1e12) / 1e12;
                  }, 0);
                  console.log({ newAmountRequired });
                  console.log({ invalidData });

                  if (invalidData) throw "invalid data";

                  setAmountRequired(newAmountRequired);

                  let transformedData = results.data.map((element, index) => {
                    return [index, element[0], ethers.utils.parseUnits(String(element[1]), decimals)];
                  });

                  setMerkleJson(transformedData);
                }
              } catch (e) {
                console.log(e);
              }
            }}
            rows={4}
          />
        </Form.Item> */}
              <h1>Or enter any token address and submit.</h1>
              <Input
                style={{ margin: 16 }}
                value={userQuery}
                placeHolder="Enter Project Token or NFT Token Address"
                onChange={e => {
                  setUserQuery(e.target.value);
                }}
              />
              <Button
                style={{ margin: 16 }}
                loading={sending}
                size="large"
                shape="round"
                type="primary"
                onClick={async () => {
                  //chain_id = 1 for ETH, 137 for Polygon/Matic, 43114 for Binance
                  // Grabs list of all holders of token / nft, so we can append a value,
                  // and make a merkle json for IPFS
                  const result = await fetch(
                    `https://api.covalenthq.com/v1/1/tokens/${userQuery}/token_holders/?page-size=2000&key=ckey_2c198a798bdc4553b499279fe87`,
                  )
                    .then(response => response.json())
                    //take data and organize in CSV with Holders -> amounts or token number
                    //Amounts will be preset buttons, placed in CSV adjacent
                    .then(data => makeAList(data, userValue));
                }}

                /* {const transform = data
                    for (let x in transform.length) {
                      console.log(transform[x].address)}
                    })}    }     */
              >
                Submit
              </Button>
              <h1>Copy your list below into the Merkler!</h1>
            </div>
            <CopyBlock
              text={sheet || "Copy this list after submitting!"}
              theme={dracula}
              language="text"
              //showLineNumbers={props.showLineNumbers}
              //startingLineNumber={props.startingLineNumber}
              //wrapLines
              codeBlock
            />
          </Route>
          <Route path="/DistributeNFT">
            <div style={{ paddingTop: 32, width: 740, margin: "auto" }}>
              <h1>Enter address and number of tokens to distribute</h1>
              <h3>If you enter more/less tokens than there are holders, the list will truncate.</h3>
              <Input
                style={{ margin: 16 }}
                value={userQuery2}
                placeHolder="Enter Project Token or NFT Token Address"
                onChange={e => {
                  setUserQuery2(e.target.value);
                }}
              />
              <Input
                style={{ margin: 16 }}
                value={userToken}
                placeHolder="Max Number of Mints (tokenID 1 -> x)"
                onChange={e => {
                  setUserToken(e.target.value);
                }}
              />
              <Button
                style={{ margin: 16 }}
                loading={sending}
                size="large"
                shape="round"
                type="primary"
                onClick={async () => {
                  //chain_id = 1 for ETH, 137 for Polygon/Matic, 43114 for Binance
                  // Grabs list of all holders of token / nft, so we can append a value,
                  // and make a merkle json for IPFS
                  const result = await fetch(
                    `https://api.covalenthq.com/v1/1/tokens/${userQuery2}/token_holders/?page-size=2000&key=ckey_2c198a798bdc4553b499279fe87`,
                  )
                    .then(response => response.json())
                    //take data and organize in CSV with Holders -> amounts or token number
                    //Amounts will be preset buttons, placed in CSV adjacent
                    .then(data => makeIteratedList(data, userToken));
                }}

                /* {const transform = data
                    for (let x in transform.length) {
                      console.log(transform[x].address)}
                    })}    }     */
              >
                Submit
              </Button>
            </div>
            <CopyBlock
              text={sheet || "Copy this list after submitting!"}
              theme={dracula}
              language="text"
              //showLineNumbers={props.showLineNumbers}
              //startingLineNumber={props.startingLineNumber}
              //wrapLines
              codeBlock
            />
          </Route>
          <Route path="/exampleui">
            <ExampleUI
              address={address}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              purpose={purpose}
              setPurposeEvents={setPurposeEvents}
            />
          </Route>
          <Route path="/mainnetdai">
            <Contract
              name="DAI"
              customContract={mainnetContracts && mainnetContracts.contracts && mainnetContracts.contracts.DAI}
              signer={userSigner}
              provider={mainnetProvider}
              address={address}
              blockExplorer="https://etherscan.io/"
              contractConfig={contractConfig}
              chainId={1}
            />
            {/*
            <Contract
              name="UNI"
              customContract={mainnetContracts && mainnetContracts.contracts && mainnetContracts.contracts.UNI}
              signer={userSigner}
              provider={mainnetProvider}
              address={address}
              blockExplorer="https://etherscan.io/"
            />
            */}
          </Route>
          <Route path="/subgraph">
            <Subgraph
              subgraphUri={props.subgraphUri}
              tx={tx}
              writeContracts={writeContracts}
              mainnetProvider={mainnetProvider}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>
    </div>
  );
}

export default App;
