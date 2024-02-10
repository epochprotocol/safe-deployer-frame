import { NEXT_PUBLIC_URL } from "@/app/config";
import { getMaticGasFee } from "@/utils";
import {
  FrameRequest,
  getFrameHtmlResponse,
  getFrameMessage,
} from "@coinbase/onchainkit";
import {
  HttpRpcClient,
  SafeAccountAPI,
  safeDefaultConfig,
} from "@epoch-protocol/sdk";
import { TransactionDetailsForUserOp } from "@epoch-protocol/sdk/dist/src/TransactionDetailsForUserOp";
import { BigNumber, VoidSigner, Wallet, providers } from "ethers";
import { NextRequest, NextResponse } from "next/server";

// const privateKey = process.env.PRIVATE_KEY!;
const mnemonic = process.env.MNEMONIC || "";
const chainId: string = "80001";
const bundlerUrl: string = process.env.BUNDLER_URL
  ? `${process.env.BUNDLER_URL}/${chainId}`
  : "http://localhost:14337/80001";
const ENTRY_POINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  console.log("bodyasdvasdfas: ", body);

  const { buttonId, custody_address } = body;

  let chainId: string = "80001";
  let rpcUrl: string =
    "https://go.getblock.io/8759d1fa53ef4f2098fd2509c2c9d3b5";

  if (buttonId === 1) {
    chainId = "137";
    rpcUrl = "https://go.getblock.io/9e0328cd2ffe480385dac5e2c5bc988b";
  }
  // if (message.button === 2) {
  //   chainId = "some other chain";
  // }

  const accountAddress = custody_address;
  // const accountAddress = "0xC40A20e82418347FEC023b2a8B94D102B0C67d53";
  console.log("accountAddress: ", accountAddress);

  const walletMnemonic = Wallet.fromMnemonic(mnemonic);
  const provider = new providers.JsonRpcProvider({
    skipFetchSetup: true,
    url: rpcUrl,
  });

  const signerDeployer = new Wallet(walletMnemonic.privateKey, provider);
  const signerUser: VoidSigner = new VoidSigner(accountAddress, provider);
  // signer.connect(provider);

  console.log("chainId: ", chainId);

  signerDeployer.connect(provider);
  signerUser.connect(provider);

  // const network = await provider.getNetwork();
  // console.log("network: ", network);

  let walletAPIInstanceDeployer = new SafeAccountAPI({
    provider,
    entryPointAddress: ENTRY_POINT,
    owner: signerDeployer,
    safeConfig: safeDefaultConfig[chainId],
    salt: safeDefaultConfig[chainId].salt,
  });

  let walletAPIInstanceUser = new SafeAccountAPI({
    provider,
    entryPointAddress: ENTRY_POINT,
    owner: signerUser,
    safeConfig: safeDefaultConfig[chainId],
    salt: safeDefaultConfig[chainId].salt,
  });

  console.log("walletAPIInstance");

  const userSCWallet = await walletAPIInstanceUser.getAccountAddress();
  // const userSCWallet = "0x09191Ae48498527C9a80eA2B4211Dbe3439C26fc";
  console.log("userSCWallet: ", userSCWallet);

  const isNotDeployed = await walletAPIInstanceUser.checkAccountPhantom();
  // const isNotDeployed = false;
  console.log("isNotDeployed: ", isNotDeployed);

  if (isNotDeployed) {
    const unsignedUserOpUser = await walletAPIInstanceUser.createUnsignedUserOp(
      {
        target: userSCWallet,
        data: "0x00",
        value: BigNumber.from(0),
      }
    );

    const userInitCode = await unsignedUserOpUser.initCode;
    console.log("userInitCode: ", userInitCode);

    const safeProxyFactory = userInitCode.toString().slice(0, 42);
    console.log("safeProxyFactory: ", safeProxyFactory);

    const callData =
      "0x" + userInitCode.toString().slice(42, userInitCode.length);

    console.log("callData: ", callData);

    let opData: TransactionDetailsForUserOp = {
      target: safeProxyFactory.toString(),
      data: callData,
      value: BigNumber.from(0),
      // maxFeePerGas: BigNumber.from("50000000000"),
      // maxPriorityFeePerGas: BigNumber.from("8600000000"),
      // gasLimit: BigNumber.from("2000320"),
    };

    if (chainId === "137") {
      const { maxPriorityFeePerGas, maxFeePerGas } = await getMaticGasFee();
      opData = {
        ...opData,
        maxPriorityFeePerGas: (maxPriorityFeePerGas as BigNumber).mul(2),
        maxFeePerGas: (maxFeePerGas as BigNumber).mul(2),
      };
    }

    const deployerInitCodeUserOp =
      await walletAPIInstanceDeployer.createSignedUserOp(opData);
    console.log("deployerInitCodeUserOp: ", deployerInitCodeUserOp);

    const bundlerInstance = new HttpRpcClient(
      bundlerUrl,
      ENTRY_POINT,
      parseInt(chainId)
    );
    console.log("bundlerInstance");

    const userOpHash = bundlerInstance.sendUserOpToBundler(
      deployerInitCodeUserOp
    );
    console.log("userOpHash: ", userOpHash);
    // const txid = await walletAPIInstanceDeployer.getUserOpReceipt(userOpHash);
    // const txid =
    //   "0xc6880f312659ff73536454908f0d523fe22f4a85d062ae1ecece73bed393d108";
    // console.log("txid: ", txid);

    return NextResponse.json({ success: true }, { status: 500 });
  } else {
    return NextResponse.json({ success: true }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
