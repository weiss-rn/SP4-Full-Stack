import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
      <h1 className="text-4xl font-extrabold text-mono-900">404</h1>
      <p className="text-sm text-mono-500 mt-1">Page not found</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors mt-6"
      >
        Back to Home
      </Link>
    </div>
  );
}

