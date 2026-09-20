"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <img src="/logo-pliiz.png" alt="Pliiz Sunbed" className="h-20 w-auto rounded-2xl" />
      <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
      <p className="max-w-sm text-sm text-gray-500">
        No internet connection. Check your network and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white"
      >
        Retry
      </button>
    </div>
  );
}
