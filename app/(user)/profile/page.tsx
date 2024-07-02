"use client";
import { useUserStore } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
export default function Profile() {
  const updateUser = useUserStore((state: any) => state.updateUser);
  const user = useUserStore((state: any) => state.user);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

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
      alert(err.message);
      alert("You are Rate limited for Airdrop");
    }
  };
  const [balance, setBalance] = useState<number>(0);

  // useEffect(() => {
  //   if (publicKey) {
  //     (async function getBalanceEvery10Seconds() {
  //       const newBalance = await connection.getBalance(publicKey);
  //       setBalance(newBalance / LAMPORTS_PER_SOL);
  //       setTimeout(getBalanceEvery10Seconds, 10000);
  //     })();
  //   }
  // }, [publicKey, connection, balance]);
  return (
    <div className="w-full h-[500px]">
      <div className="w-full px-5 py-2">
        <h1 className="font-semibold text-xl">Profile</h1>
        <p>
          Username: <span className="font-semibold">{user.username}</span>
        </p>
        <WalletMultiButton style={{}} />
      </div>
    </div>
  );
}
