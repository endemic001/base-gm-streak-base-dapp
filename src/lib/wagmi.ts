"use client";

import { Attribution } from "ox/erc8021";
import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const supportedChains = [base, baseSepolia] as const;
export const builderCode = "bc_pgxsgj9m";

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [injected()],
  dataSuffix: Attribution.toDataSuffix({ codes: [builderCode] }),
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
