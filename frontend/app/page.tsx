import VerifyBox from "@/components/verification/VerifyBox";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6">

        <h1 className="mb-4 text-6xl font-bold">
          TruthLens AI
        </h1>

        <p className="mb-10 max-w-2xl text-center text-zinc-400">
          Verify news, reports, claims and documents using
          Retrieval-Augmented Generation.
        </p>

        <VerifyBox />

      </div>
    </main>
  );
}