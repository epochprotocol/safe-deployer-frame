import { NEXT_PUBLIC_URL } from "@/app/config";
import {
  FrameRequest,
  getFrameHtmlResponse,
  getFrameMessage,
} from "@coinbase/onchainkit";
import { SafeAccountAPI, safeDefaultConfig } from "@epoch-protocol/sdk";
import { VoidSigner, providers } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import { init } from "@amplitude/analytics-node";
import { track } from "@amplitude/analytics-node";

// Option 1, initialize with API_KEY only
init(process.env.AMPLITUDE_KEY || "");

// Option 2, initialize including configuration
init(process.env.AMPLITUDE_KEY || "", {
  flushIntervalMillis: 30 * 1000, // Sets request interval to 30s
});

// const privateKey = process.env.PRIVATE_KEY!;
const ENTRY_POINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  console.log("bodyasdvasdfas: ", body);
  const { isValid, message } = await getFrameMessage(body);

  console.log("message: ", message);

  if (!isValid) {
    return new NextResponse("Invalid Frame message", { status: 400 });
  }

  if (!message) {
    return new NextResponse("Invalid Frame message", { status: 400 });
  }

  if (!message.recasted) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Recast & Try Again`,
          },
        ],
        image: `${NEXT_PUBLIC_URL}/main.png`,
        // input: {
        //   text: "Address - Optional Default - Custody Address",
        // },
        post_url: `${NEXT_PUBLIC_URL}/api/account`,
      })
    );
  }

  let chainId: string = "80001";
  let rpcUrl: string =
    "https://go.getblock.io/8759d1fa53ef4f2098fd2509c2c9d3b5";

  if (message.button === 1) {
    chainId = "137";
    rpcUrl =
      "https://frosty-solemn-diamond.matic.quiknode.pro/ae32fe5b91c1e127c4e6a065fe17d469910095c0";
  }
  // if (message.button === 2) {
  //   chainId = "some other chain";
  // }

  // const accountAddress = message.input || message.interactor.custody_address;
  const accountAddress = message.interactor.custody_address;
  // const accountAddress = "0xC40A20e82418347FEC023b2a8B94D102B0C67d53";
  console.log("accountAddress: ", accountAddress);

  // Track a basic event
  track(
    "DEPLOY_FRAME",
    { accountAddress },
    {
      user_id: accountAddress,
    }
  );

  // const walletMnemonic = Wallet.fromMnemonic(mnemonic);
  const provider = new providers.JsonRpcProvider({
    skipFetchSetup: true,
    url: rpcUrl,
  });

  // const signerDeployer = new Wallet(walletMnemonic.privateKey, provider);
  const signerUser: VoidSigner = new VoidSigner(accountAddress, provider);
  // signer.connect(provider);

  console.log("chainId: ", chainId);

  // signerDeployer.connect(provider);
  signerUser.connect(provider);

  // const network = await provider.getNetwork();
  // console.log("network: ", network);

  // let walletAPIInstanceDeployer = new SafeAccountAPI({
  //   provider,
  //   entryPointAddress: ENTRY_POINT,
  //   owner: signerDeployer,
  //   safeConfig: safeDefaultConfig[chainId],
  //   salt: safeDefaultConfig[chainId].salt,
  // });

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

  // fetch without await because of 5sec limitation - intentional
  fetch(`${NEXT_PUBLIC_URL}/api/deploy`, {
    method: "POST",
    body: JSON.stringify({
      buttonId: message.button,
      custody_address: accountAddress,
    }),
  });

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Manage Smart Account`,
          action: "link",
          target: `https://safe.epochprotocol.xyz/home?safe=matic:${userSCWallet}`,
        },
        {
          label: `View on Etherscan`,
          action: "link",
          target: `https://polygonscan.com/address/${userSCWallet}`,
        },
      ],
      image: `${NEXT_PUBLIC_URL}/api/og?address=${userSCWallet}&fid=${message.interactor.fid}&txid=`,
    })
  );
}

export const dynamic = "force-dynamic";
