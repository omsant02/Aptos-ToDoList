import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Button, Spin } from "antd";
import { Aptos } from "@aptos-labs/ts-sdk";

import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

export const aptos = new Aptos();

export const moduleAddress =
  "6dfcf8d4afabfb700e3e02246262a7dca2c6410e3326ceb97af47607b0bd46b8";

function App() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const fetchList = async () => {
    if (!account) return [];
    // change this to be your module account address

    try {
      const todoListResource = await aptos.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::todolist::TodoList`,
      });
      setAccountHasList(true);
    } catch (e: any) {
      setAccountHasList(false);
    }
  };

  const addNewList = async () => {
    if (!account) return [];
    setTransactionInProgress(true);
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::todolist::create_list`,
        functionArguments: [],
      },
    };
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setAccountHasList(true);
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  return (
    <>
      <Layout>
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>Our todolist</h1>
          </Col>
          <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <Spin spinning={transactionInProgress}>
        {!accountHasList && (
          <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
            <Col span={8} offset={8}>
              <Button
                onClick={addNewList}
                block
                type="primary"
                style={{ height: "40px", backgroundColor: "#3f67ff" }}
              >
                Add new list
              </Button>
            </Col>
          </Row>
        )}
      </Spin>
    </>
  );
}

export default App;
