"use client";

import {
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  Flame,
  Loader2,
  Radio,
  Share2,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { supportedChains } from "@/lib/wagmi";

const storageKey = "base-gm-streak";

type StoredCheckin = {
  date: string;
  streak: number;
  total: number;
};

const community = [
  { name: "Ari", streak: 12 },
  { name: "Mina", streak: 9 },
  { name: "Jules", streak: 7 },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function chainName(chainId?: number) {
  if (chainId === base.id) return "Base";
  if (chainId === baseSepolia.id) return "Base Sepolia";
  return "Unsupported";
}

function readStored(): StoredCheckin {
  if (typeof window === "undefined") return { date: "", streak: 0, total: 0 };

  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : { date: "", streak: 0, total: 0 };
  } catch {
    return { date: "", streak: 0, total: 0 };
  }
}

export function GmApp() {
  const [stored, setStored] = useState<StoredCheckin>(() => readStored());
  const [shared, setShared] = useState(false);

  const { address, connector, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const {
    sendTransaction,
    data: hash,
    isPending: isSending,
    error,
  } = useSendTransaction();

  const isSupported = supportedChains.some((chain) => chain.id === chainId);
  const checkedInToday = stored.date === todayKey();
  const primaryConnector = connectors[0];

  const explorerUrl = useMemo(() => {
    if (!hash) return "";
    const root =
      chainId === baseSepolia.id
        ? "https://sepolia.basescan.org"
        : "https://basescan.org";
    return `${root}/tx/${hash}`;
  }, [chainId, hash]);

  function saveCheckin() {
    const next = {
      date: todayKey(),
      streak: checkedInToday ? stored.streak : stored.streak + 1,
      total: checkedInToday ? stored.total : stored.total + 1,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setStored(next);
  }

  function gm() {
    if (!address) return;

    if (!isSupported) {
      switchChain({ chainId: base.id });
      return;
    }

    sendTransaction(
      {
        to: address,
        value: BigInt(0),
      },
      {
        onSuccess: saveCheckin,
      },
    );
  }

  async function share() {
    const text = `GM on Base. I am on a ${stored.streak || 1} day streak with Base GM Streak.`;

    if (navigator.share) {
      await navigator.share({
        title: "Base GM Streak",
        text,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    setShared(true);
    window.setTimeout(() => setShared(false), 1300);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#06111f] text-white">
      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_8%,rgba(0,82,255,0.45),transparent_34%),linear-gradient(180deg,#06111f_0%,#071321_48%,#04101b_100%)]" />
        <div className="absolute inset-x-0 top-16 -z-10 mx-auto h-[520px] w-[520px] rounded-full border border-blue-300/15 bg-blue-400/10 blur-3xl" />

        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/gm-icon.svg"
                alt=""
                width={44}
                height={44}
                className="rounded-2xl"
                priority
              />
              <div>
                <p className="text-sm font-semibold">Base GM Streak</p>
                <p className="text-xs text-white/55">Daily onchain check-in</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs text-white/70 backdrop-blur">
              <Radio className="size-3.5 text-emerald-300" />
              {chainName(chainId)}
            </div>
          </header>

          <div className="grid flex-1 items-center gap-6 py-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-7 lg:py-14">
            <section className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/18 bg-blue-400/12 px-3 py-2 text-sm text-blue-100">
                <Sparkles className="size-4" />
                One GM, once per day
              </div>

              <h1 className="text-[3.6rem] font-semibold leading-[0.9] tracking-normal sm:text-7xl lg:text-8xl">
                GM on Base.
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/68 lg:mx-0">
                Tap once, send a tiny onchain signal, and keep your daily GM
                streak alive.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2 rounded-[1.35rem] border border-white/12 bg-white/8 p-2 backdrop-blur-xl">
                {[
                  ["1", "Connect"],
                  ["2", "Tap GM"],
                  ["3", "Keep streak"],
                ].map(([step, label]) => (
                  <div key={step} className="rounded-2xl bg-[#0b1727]/86 px-3 py-3">
                    <p className="text-sm font-bold text-emerald-200">{step}</p>
                    <p className="mt-1 text-xs font-semibold leading-4 text-white">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mx-auto w-full max-w-[460px]">
              <div className="rounded-[2.2rem] border border-white/16 bg-white/10 p-3 shadow-2xl shadow-black/45 backdrop-blur-2xl">
                <div className="rounded-[1.65rem] border border-white/12 bg-[#f8fbff] p-5 text-slate-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0052ff]">
                        Today
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold">Say GM</h2>
                    </div>
                    <div className="grid size-12 place-items-center rounded-2xl bg-[#0052ff] text-white shadow-lg shadow-blue-700/25">
                      <CalendarCheck2 className="size-5" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={isConnected ? gm : () => primaryConnector && connect({ connector: primaryConnector })}
                    disabled={isConnecting || isSwitching || isSending}
                    className="mt-6 flex aspect-square w-full items-center justify-center rounded-[2rem] bg-[#0052ff] text-white shadow-2xl shadow-blue-700/30 transition hover:bg-[#0147dd] disabled:opacity-60"
                  >
                    {isConnecting || isSwitching || isSending ? (
                      <Loader2 className="size-14 animate-spin" />
                    ) : (
                      <span className="text-[5.5rem] font-black leading-none tracking-normal sm:text-[7rem]">
                        GM
                      </span>
                    )}
                  </button>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      [stored.streak || 0, "streak"],
                      [stored.total || 0, "total"],
                      [checkedInToday ? "done" : "open", "today"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-4"
                      >
                        <p className="text-xl font-semibold">{value}</p>
                        <p className="mt-1 text-xs text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {!isConnected ? (
                      <button
                        type="button"
                        onClick={() => primaryConnector && connect({ connector: primaryConnector })}
                        disabled={!primaryConnector || isConnecting}
                        className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        <Wallet className="size-4" />
                        Connect wallet
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={disconnectWallet}
                        className="h-13 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        {shortAddress(address)}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={share}
                      className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Share2 className="size-4" />
                      {shared ? "Copied" : "Share"}
                    </button>
                  </div>

                  {hash && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="size-4" />
                        GM recorded onchain
                      </span>
                      <ArrowUpRight className="size-4" />
                    </a>
                  )}

                  {error && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-white/12 bg-white/9 p-4 backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy className="size-4 text-amber-200" />
                  <h2 className="text-sm font-semibold">Community streaks</h2>
                </div>
                <div className="grid gap-2">
                  {community.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 rounded-2xl bg-[#0b1727]/76 px-3 py-3"
                    >
                      <div className="grid size-9 place-items-center rounded-xl bg-white/10 text-sm font-semibold">
                        {index === 0 ? <Flame className="size-4 text-orange-300" /> : index + 1}
                      </div>
                      <p className="flex-1 text-sm font-semibold">{item.name}</p>
                      <p className="text-sm font-semibold text-emerald-200">
                        {item.streak}d
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
