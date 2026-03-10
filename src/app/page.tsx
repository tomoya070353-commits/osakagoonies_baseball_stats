import { Suspense } from "react";
import { getPlayersData } from "./actions";
import AppClient from "@/components/AppClient";
import { Loader2 } from "lucide-react";

export default async function Home() {
  const players = await getPlayersData();

  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-slate-50">
          <Loader2 size={36} className="text-[#1e3a5f] animate-spin" />
          <p className="text-slate-400 text-sm">データを読み込み中...</p>
        </div>
      }
    >
      <AppClient players={players} />
    </Suspense>
  );
}
