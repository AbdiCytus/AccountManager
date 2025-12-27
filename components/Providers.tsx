"use client";

import { SessionProvider as Session } from "next-auth/react";
type Provider = { children: React.ReactNode };

const Providers = ({ children }: Provider) => <Session>{children}</Session>;
export default Providers;
