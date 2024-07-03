"use client";
import { useUserStore } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { baseApiUrl } from "@/lib/utils";
import { main } from "@/app/components/Umi";
import { set } from "@metaplex-foundation/umi/serializers";
import getTokenAccounts from "@/app/components/GetNft";
import GetNFT from "@/app/components/GetNft";
export default function Profile() {
  const updateUser = useUserStore((state: any) => state.updateUser);
  const [hex, setHex] = useState<string>("");
  const user = useUserStore((state: any) => state.user);
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      updateUser({ username: "", accessToken: "" });
      router.push("/login");
    }
  }, []);
  const getAirdropOnClick = async () => {
    try {
      if (!publicKey) {
        throw new Error("Wallet is not Connected");
      }
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL),
      ]);
      const sigResult = await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      );
      if (sigResult) {
        alert("Airdrop was confirmed!");
      }
    } catch (err) {
      alert("You are Rate limited for Airdrop");
    }
  };
  const [balance, setBalance] = useState<number>(0);
  async function mintNft() {
    const res = await fetch(`${baseApiUrl}/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Bearer: "Bearer " + localStorage.getItem("accessToken"),
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (data.canMint == false) {
      alert("You can't mint anymore");
      return;
    }
    main();
  }
  useEffect(() => {
    if (publicKey) {
      (async function getBalanceEvery10Seconds() {
        const newBalance = await connection.getBalance(publicKey);
        setBalance(newBalance / LAMPORTS_PER_SOL);
        setTimeout(getBalanceEvery10Seconds, 10000);
      })();
    }
  }, [publicKey, connection, balance]);
  return (
    <div className="w-full h-[500px]">
      <div className="w-full px-5 py-2">
        <h1 className="font-semibold text-xl">Profile</h1>
        <p>
          Username: <span className="font-semibold">{user.username}</span>
        </p>

        <div>
          <WalletMultiButton style={{}} />
        </div>
        <div>
          <button
            className="bg-blue-300 px-2 py-2 rounded-xl m-5"
            onClick={() => mintNft()}
          >
            Mint Your custom NFT
          </button>
          <button onClick={() => GetNFT()}>Check NFTs you own</button>
        </div>
      </div>
    </div>
  );
}
