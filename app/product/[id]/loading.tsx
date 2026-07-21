import { Container } from "@/components/container";

export default function Loading() {
  return (
    <Container className="animate-pulse py-8">
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
    </Container>
  );
}
