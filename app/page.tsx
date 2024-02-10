import { getFrameMetadata } from "@coinbase/onchainkit";
import type { Metadata } from "next";
import { NEXT_PUBLIC_URL } from "./config";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "FREE Deploy SAFE on Polygon",
    },
    // {
    //   label: "Deploy SAFE Wallet on Base",
    // },
  ],
  image: `${NEXT_PUBLIC_URL}/main.png`,
  // input: {
  //   text: "Address - Optional Default - Custody Address",
  // },
  post_url: `${NEXT_PUBLIC_URL}/api/account`,
});

export const metadata: Metadata = {
  title: "Epoch Dapp",
  description: "Automate Anything in Web3",
  openGraph: {
    title: "Epoch Dapp",
    description: "Automate Anything in Web3",
    images: [`${NEXT_PUBLIC_URL}/main.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>Epoch SAFE Deployer</h1>
      <div style={{ color: "blue" }}>
        <a href="https://epochprotocol.xyz">Epoch Protocol</a>
      </div>
      <div style={{ color: "blue" }}>
        <a href="https://app.epochprotocol.xyz">Checkout Epoch Dapp</a>
      </div>
    </>
  );
}
