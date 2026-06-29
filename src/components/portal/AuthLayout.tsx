import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import heroTruck from "../../../public/images/hero-truck.png";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

/**
 * Split-screen auth shell. Truck photography appears here (login/signup) only —
 * interior portal screens stay data-first. Mobile gets a compact hero band on
 * top rather than the desktop image compressed.
 */
export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-bgBase lg:grid-cols-2">
      {/* Hero — full panel on desktop, slim band on mobile */}
      <div className="relative h-36 overflow-hidden lg:h-auto">
        <Image
          src={heroTruck}
          alt="AddisDispatch freight truck on the highway"
          fill
          placeholder="blur"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div className="absolute inset-0 hidden flex-col justify-between p-10 lg:flex">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold" />
            <span className="text-lg font-bold tracking-tight text-gold">
              Addis<span className="text-textPrimary">Dispatch</span>
            </span>
          </Link>
          <div>
            <p className="max-w-sm text-2xl font-semibold leading-snug text-textPrimary">
              Your loads, documents, and settlements — in one place.
            </p>
            <p className="mt-3 max-w-sm text-sm font-light text-textMuted">
              The carrier portal for owner-operators and small fleets who run on data.
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center bg-bgSurface px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold" />
            <span className="text-lg font-bold tracking-tight text-gold">
              Addis<span className="text-textPrimary">Dispatch</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm font-light text-textMuted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
