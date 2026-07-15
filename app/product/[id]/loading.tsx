export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-8 sm:px-6">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="aspect-square bg-zinc-200" />
        <div className="space-y-4">
          <div className="h-4 w-24 rounded bg-zinc-200" />
          <div className="h-7 w-2/3 rounded bg-zinc-200" />
          <div className="h-6 w-32 rounded bg-zinc-200" />
          <div className="h-20 w-full rounded bg-zinc-200" />
          <div className="h-12 w-full rounded-full bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}
