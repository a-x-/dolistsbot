import nodeCrypto from "crypto";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const cryptoCreateHash = nodeCrypto.createHash;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
nodeCrypto.createHash = (_algo: string, ...args: any[]) => {
  console.log(
    "HACK(crypto.createHash): sha3-256 -> sha256. Fix TypeError: Unsupported algorithm sha3-256"
  );
  const algo = _algo === "sha3-256" ? "sha256" : _algo;
  return cryptoCreateHash(algo, ...args);
};
