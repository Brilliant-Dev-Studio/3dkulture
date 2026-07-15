import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left sm:px-6">
        <Image
          src="/logo.png"
          alt="3D Kulture"
          width={120}
          height={117}
          className="h-16 w-auto brightness-0 invert sm:h-10"
        />
        <p className="text-xs uppercase tracking-[0.15em] text-white/50">
          &copy; {new Date().getFullYear()} 3D Kulture — All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
