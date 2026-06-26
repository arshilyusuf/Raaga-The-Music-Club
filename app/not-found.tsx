import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-24 sm:py-32 lg:px-8 font-sans">
      <div className="text-center">
        <p className="text-base font-semibold text-neutral-400">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-50 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-neutral-400 max-w-md mx-auto">
          The page you are looking for does not exist, has been moved, or is
          currently unavailable.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
          >
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
