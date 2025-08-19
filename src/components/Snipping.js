import React, { useState, useEffect } from "react";
import { Button, FormControl } from "react-bootstrap";
import "./Display.css";
import { MDBDataTable } from "mdbreact";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import CONFIG from "./constant/config";
import { ethers } from "ethers";
import {
  BsFillKeyFill,
  BsCloud,
} from "react-icons/bs";
import {
  startSnipping,
  stopSnipping,
  getSnippingStatus,
} from "./api";



const Snipping = () => {
  const [client, setClient] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [nodeUrl, setNodeUrl] = useState("");
  const [inAmount, setInAmount] = useState("");
  const [slippage, setSlippage] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [gasLimit, setGasLimit] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [dexPrice, setDexPrice] = useState({});
  const [currentBalance, setCurrentBalance] = useState(0);

  var rows = transactions.map((item) => {
    item.transaction = (
      <a href={CONFIG.EXPLORER + item.transaction} target="_blank" rel="noopener noreferrer">
        {item.transaction}
      </a>
    );

    return item;
  });



  const tradeLogData = {
    columns: [
      {
        label: "TimeStamp",
        field: "timestamp",
        width: 100,
      },

      {
        label: "Trade Token",
        field: "tradeToken",
        width: 100,
      },
      {
        label: "Token Amounts ",
        field: "TokenAmounts",
        width: 100,
      },
      {
        label: "Buy Dex",
        field: "buyDex",
      },
      {
        label: "Sell Dex",
        field: "sellDex",
        width: 100,
      },
      {
        label: "Trade Rate",
        field: "tradeRate",
      },
    ],
    rows: rows,
  };

  const start = () => {
    if (
      nodeUrl === "" ||
      walletAddress === "" ||
      privateKey === "" ||
      tokenAddress === "" ||
      inAmount === "" ||
      slippage === "" ||
      gasPrice === "" ||
      gasLimit === ""
    ) {
      alert("please input all information to start the snipping !");
    } else if (Number(inAmount) < 1) {
      alert("Insert at least 1 ETH for get profit !");
    } else {
      let wallet = new ethers.Wallet(privateKey);
      setWalletAddress(wallet.address);
      setIsRunning(true);
      startSnipping(
        nodeUrl,
        walletAddress,
        privateKey,
        tokenAddress,
        inAmount,
        slippage,
        gasPrice,
        gasLimit
      );
    }
  };

  const stop = () => {
    setIsRunning(false);
    stopSnipping();
    client.send("stopBot");
  };
  const openWebSocket = () => {
    const client = new W3CWebSocket("ws://127.0.0.1:8089/connect");
    setClient(client);
    if (!client) return;
    client.onopen = () => {
      console.log("WebSocket Client Connected");
      setStatus();
    };
    client.onmessage = (message) => {
      const messageInfo = JSON.parse(message.data);
      switch (messageInfo.type) {
        case "price":
          setDexPrice(messageInfo.data);
          break;
        case "tx":
          console.log(messageInfo.data);
          setCurrentBalance(messageInfo.data.currentBalance);

          setTransactions((prev) => [messageInfo.data, ...prev]);
          break;
        default:
          console.log("Unknown message type:", messageInfo.type);
      }
      if (message.data.includes("snipping")) listTransactions();
      if (message.data.includes("setting")) {
        setStatus();
        listTransactions();
      }
    };
    client.onclose = () => {
      setIsRunning(false);
      setClient(null);
    };
  };
  const loadSetting = (status) => {
    setWalletAddress(status.wallet);
    setPrivateKey(status.key);
    // let wallet = new ethers.Wallet(status.key);
    setNodeUrl(status.node);
    setTokenAddress(status.token);
    setInAmount(status.amount);
    setSlippage(status.slippage);
    setGasPrice(status.gasprice);
    setGasLimit(status.gaslimit);
  };

  const setStatus = async () => {
    console.log("setStatue");
    var curStatus = await getSnippingStatus();
    loadSetting(curStatus);
    // if (curStatus.status === "1") setIsRunning(true);
    // else setIsRunning(false);
  };

  const listTransactions = async () => {
    // console.log("listTransactions");
    // transactionItems = await listSnipping();
    // setTransactions(transactionItems);
    // console.log(transactions);
  };
  useEffect(() => {
    if (client == null) {
      setTimeout(openWebSocket, 5000);
    }
  }, [client]);
  useEffect(() => {
    setStatus();
    listTransactions();
  }, []);
  return (
    <div style={{ paddingLeft: "48px" }}>
      <div
        className="row"
        style={{
          border: "1px solid darkblue",
          color: "white",
          backgroundColor: "rgba(12,12,48,0.9)",
          padding: "24px",
          margin: "24px",
          boxShadow: "1px 1px 3px darkblue",
        }}
      >
        <div className="col-sm-12 col-md-6 col-lg-6">
          {/* <div className="form-group">
            <label htmlFor="usr" style={{ fontSize: "24px", color: "silver" }}>
              <BsWallet2></BsWallet2> Wallet Address:
            </label>
            <FormControl
              type="text"
              id="walletAddr"
              value={walletAddress}
              onChange={(e) => {
                setWalletAddress(e.target.value);
              }}
              className="form-control form-control-md"
            />
          </div> */}
          {/* <div className="form-group">
            <label
              htmlFor="tokenAddress"
              style={{ fontSize: "24px", color: "silver" }}
            >
              <BsFillLightningChargeFill />
              Token Address:
            </label>
            <FormControl
              type="text"
              id="tokenAddress"
              value={tokenAddress}
              onChange={(e) => {
                setTokenAddress(e.target.value);
              }}
              size="md"
            />
          </div> */}
          <div className="form-group">
            <label htmlFor="pwd" style={{ fontSize: "20px", color: "silver" }}>
              <BsFillKeyFill />
              Private Key:
              <span style={{ fontSize: 16 }}>({walletAddress})</span>
            </label>
            <FormControl
              type="password"
              id="privateKey"
              value={privateKey}
              onChange={(e) => {
                setPrivateKey(e.target.value);
              }}
              className="form-control form-control-md"
            />
          </div>
        </div>
        <div className="col-sm-12 col-md-6 col-lg-6">
          <div className="form-group">
            <label
              htmlFor="wssURL"
              style={{ fontSize: "20px", color: "silver" }}
            >
              <BsCloud />
              Quick Node WSS URL:
            </label>
            <FormControl
              type="text"
              id="nodeUrl"
              value={nodeUrl}
              onChange={(e) => {
                setNodeUrl(e.target.value);
              }}
              className="form-control form-control-md"
            />
          </div>
        </div>
        <div className="col-sm-12">
          <span style={{ marginRight: 20 }}>
            Uniswap(MATIC/USDT): {dexPrice.uniswap ? dexPrice.uniswap : 0}
          </span>
          <span style={{ marginRight: 20 }}>
            Sushiswap(MATIC/USDT): {dexPrice.sushiswap ? dexPrice.sushiswap : 0}
          </span>
          <span>balance: {currentBalance}</span>
        </div>
      </div>

      <div className="row">
        <div className="col col-9">
          <div className="row" style={{ margin: "24px", marginTop: "0px" }}>
            {/* <div
              className="col col-12"
              style={{
                border: "1px solid darkgreen",
                color: "white",
                backgroundColor: "rgba(8,48,48,0.9)",
                padding: "24px",
              }}
            >
              <MDBDataTable
                hover
                data={{ columns: tokenPriceColumns, rows: tokenPrice }}
              />
            </div> */}
            <div
              className="col col-12"
              style={{
                border: "1px solid darkgreen",
                color: "white",
                backgroundColor: "rgba(8,48,48,0.9)",
                padding: "24px",
              }}
            >
              <MDBDataTable hover data={tradeLogData} />
            </div>
          </div>
        </div>
        <div className="col col-3">
          <div
            className="row"
            style={{
              border: "1px solid darkgreen",
              color: "white",
              backgroundColor: "rgba(8,28,48,0.9)",
              padding: "24px",
              marginRight: "24px",
            }}
          >
            <div
              className="col col-12"
              style={{ display: "flex", flex: "1", height: "100%" }}
            >
              <div className="form-group">
                <label htmlFor="pwd">WMATIC Amount:</label>
                <input
                  type="number"
                  id="inAmount"
                  className="short-input"
                  value={inAmount}
                  onChange={(e) => {
                    setInAmount(e.target.value);
                  }}
                />
                <label htmlFor="slippage">Threshold(%):</label>
                <input
                  type="number"
                  id="slippage"
                  className="short-input"
                  value={slippage}
                  onChange={(e) => {
                    setSlippage(e.target.value);
                  }}
                />
                <label htmlFor="pwd">Gas Price(gwei):</label>
                <input
                  type="number"
                  id="gasPrice"
                  className="short-input"
                  value={gasPrice}
                  onChange={(e) => {
                    setGasPrice(e.target.value);
                  }}
                />
                <label htmlFor="pwd">Gas Limit:</label>
                <input
                  type="number"
                  id="gasLimit"
                  className="short-input"
                  value={gasLimit}
                  onChange={(e) => {
                    setGasLimit(e.target.value);
                  }}
                />
                <Button
                  variant={isRunning ? "danger" : "primary"}
                  id="button-addon2"
                  style={{ width: "100%" }}
                  onClick={isRunning ? () => stop() : () => start()}
                >
                  {isRunning ? "Stop" : "Start"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snipping;
