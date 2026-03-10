import { Suspense } from "react";
import { getPlayersData, getTeamStats, getPitchingData, getTeamHistory } from "./actions";
import AppClient from "@/components/AppClient";
import { Loader2 } from "lucide-react";

export default async function Home() {
  const [players, teamStats, pitchers, teamHistory] = await Promise.all([
    getPlayersData(),
    getTeamStats("2026"),
    getPitchingData(),
    getTeamHistory(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-slate-50">
          <Loader2 size={36} className="text-[#1e3a5f] animate-spin" />
          <p className="text-slate-400 text-sm">データを読み込み中...</p>
        </div>
      }
    >
      <AppClient players={players} teamStats={teamStats} pitchers={pitchers} teamHistory={teamHistory} />
    </Suspense>
  );
}
