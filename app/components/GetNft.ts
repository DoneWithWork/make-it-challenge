import { Connection, GetProgramAccountsFilter } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
const rpcEndpoint = "https://api.devnet.solana.com";
const solanaConnection = new Connection(rpcEndpoint);
const walletToQuery = "2VoYssmUpioAZHE1iXTiYyBommwcXpLytdCEwSLKT2zZ"; //example: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
async function getTokenAccounts(wallet: string, solanaConnection: Connection) {
  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165, //size of account (bytes)
    },
    {
      memcmp: {
        offset: 32, //location of our query in the account (bytes)
        bytes: wallet, //our search criteria, a base58 encoded string
      },
    },
  ];
  const accounts = await solanaConnection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID, //SPL Token Program, new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    { filters: filters }
  );
  console.log(
    `Found ${accounts.length} token account(s) for wallet ${wallet}.`
  );
  alert(`Found ${accounts.length} token account(s) for wallet ${wallet}.`);
  accounts.forEach(async (account, i) => {
    //Parse the account data
    const parsedAccountInfo: any = account.account.data;
    const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
    const tokenBalance: number =
      parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];

    console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
    console.log(`--Token Mint: ${mintAddress}`);
    console.log(`--Token Balance: ${tokenBalance}`);
  });
}

async function GetNFT() {
  getTokenAccounts(walletToQuery, solanaConnection);
}
export default GetNFT;
