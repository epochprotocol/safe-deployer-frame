import { BigNumber, BigNumberish, ethers } from "ethers";

export function parseGwei(num: number | string): BigNumber {
  if (typeof num !== "number") {
    num = Number(num);
  }
  return ethers.utils.parseUnits(num.toFixed(9), "gwei");
}

export const getMumbaiGasFee = async (): Promise<{
  maxPriorityFeePerGas: BigNumberish;
  maxFeePerGas: BigNumberish;
  gasPrice: BigNumberish;
}> => {
  const oracle = "https://gasstation-testnet.polygon.technology/v2";
  const data = await (await fetch(oracle)).json();
  return {
    maxPriorityFeePerGas: parseGwei(data.fast.maxPriorityFee),
    maxFeePerGas: parseGwei(data.fast.maxFee),
    gasPrice: parseGwei(data.fast.maxFee),
  };
};

export const getMaticGasFee = async (): Promise<{
  maxPriorityFeePerGas: BigNumberish;
  maxFeePerGas: BigNumberish;
  gasPrice: BigNumberish;
}> => {
  const oracle = "https://gasstation.polygon.technology/v2";
  const data = await (await fetch(oracle)).json();
  return {
    maxPriorityFeePerGas: parseGwei(data.fast.maxPriorityFee),
    maxFeePerGas: parseGwei(data.fast.maxFee),
    gasPrice: parseGwei(data.fast.maxFee),
  };
};
