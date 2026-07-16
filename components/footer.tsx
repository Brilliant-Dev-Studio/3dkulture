import Image from "next/image";
import { T } from "./t";

const CONTACT = {
  phone: "+959 784 400 410",
  email: "3dkultureburma@gmail.com",
  facebook: "https://www.facebook.com/share/18gLbmg4PM/",
};

function PhoneIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-12 text-center sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:text-left sm:px-6">
        <Image
          src="/logo.png"
          alt="3D Kulture"
          width={120}
          height={117}
          className="h-16 w-auto brightness-0 invert sm:h-10"
        />

        <div className="flex flex-col items-center gap-2 text-sm text-white/70 sm:items-start">
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white">
            <PhoneIcon />
            {CONTACT.phone}
          </a>
          <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-white">
            <MailIcon />
            {CONTACT.email}
          </a>
          <a
            href={CONTACT.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white"
          >
            <FacebookIcon />
            Facebook
          </a>
        </div>

        <p className="text-xs uppercase tracking-[0.15em] text-white/50">
          &copy; {new Date().getFullYear()} 3D Kulture — <T k="footer.rights" />
        </p>
      </div>
    </footer>
  );
}
