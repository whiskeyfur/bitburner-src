import type { IPAddress } from "../Types/strings";

/**
 * Generate a random IP address
 * Does not check to see if the IP already exists in the game
 */
export const createRandomIp = (): IPAddress => {
  // Credit goes to yichizhng on BitBurner discord
  // Generates a number like 0.c8f0a07f1d47e8
  const ip = Math.random().toString(16);
  // uses regex to match every 2 characters. [0.][c8][f0][a0][7f][1d][47][e8]
  const matchArray = ip.match(/../g) as RegExpMatchArray;
  // we only want #1 through #4
  const sliced = matchArray.slice(1, 5);
  //convert each to a decimal number
  const asDecimals = sliced.map((x) => parseInt(x, 16));
  // and join them together to make a human readable IP address.
  return asDecimals.join(".") as IPAddress;
};
