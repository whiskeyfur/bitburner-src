import type { IPAddress } from "../Types/strings";

/**
 * Generate a random IP address
 * Does not check to see if the IP already exists in the game
 */
export const createRandomIp = (): IPAddress => {
  const ip = (Math.random() * 0xffffffff) & 0xffffffff;
  return `${(ip >>> 24) & 0xff}.${(ip >>> 16) & 0xff}.${(ip >>> 8) & 0xff}.${ip & 0xff}` as IPAddress;
};
