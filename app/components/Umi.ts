import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  percentAmount,
  sol,
} from "@metaplex-foundation/umi";
import { mockStorage } from "@metaplex-foundation/umi-storage-mock";

import secret from "./wallet.json";

const QUICKNODE_RPC = "https://api.devnet.solana.com"; //Replace with your QuickNode RPC Endpoint
const umi = createUmi(QUICKNODE_RPC);
import { clusterApiUrl, Keypair } from "@solana/web3.js";
const creatorWallet = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(secret)
);
const creator = createSignerFromKeypair(umi, creatorWallet);
umi.use(keypairIdentity(creator));
umi.use(mplTokenMetadata());
umi.use(mockStorage());
const nftDetail = {
  name: "Road",
  symbol: "RD",
  uri: "IPFS_URL_OF_METADATA",
  royalties: 5.5,
  description: "Infrastructure for everyone!",
  imgType: "image/png",
  attributes: [{ trait_type: "Speed", value: "Quick" }],
};

async function uploadMetadata(imageUri: string): Promise<string> {
  try {
    const metadata = {
      name: nftDetail.name,
      description: nftDetail.description,
      image: imageUri,
      attributes: nftDetail.attributes,
      properties: {
        files: [
          {
            type: nftDetail.imgType,
            uri: imageUri,
          },
        ],
      },
    };
    const metadataUri = await umi.uploader.uploadJson(metadata);
    console.log("Uploaded metadata:", metadataUri);
    return metadataUri;
  } catch (e) {
    throw e;
  }
}
async function mintNft(metadataUri: string) {
  try {
    const mint = generateSigner(umi);
    await createNft(umi, {
      mint,
      name: nftDetail.name,
      symbol: nftDetail.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(nftDetail.royalties),
      creators: [{ address: creator.publicKey, verified: true, share: 100 }],
    }).sendAndConfirm(umi);
    console.log(`Created NFT: ${mint.publicKey.toString()}`);
    return mint.publicKey.toString();
  } catch (e) {
    throw e;
  }
}
const { Connection, PublicKey } = require("@solana/web3.js");

export async function main() {
  await mintNft("https://donewithwork.pythonanywhere.com/static/metadata.json");
}
