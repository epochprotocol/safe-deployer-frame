import { getFrameMetadata } from "@coinbase/onchainkit";
import type { Metadata } from "next";
import { NEXT_PUBLIC_URL } from "./config";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Deploy SAFE Wallet on Polygon",
    },
    // {
    //   label: "Deploy SAFE Wallet on Base",
    // },
  ],
  image: `${NEXT_PUBLIC_URL}/main.png`,
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
      <h1>Smart Account Frame Template</h1>
    </>
  );
}
