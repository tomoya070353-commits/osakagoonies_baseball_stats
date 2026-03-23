"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerStats } from "@/types";
import { ChevronRight, X, ArrowLeftRight, UserPlus } from "lucide-react";

// ── 守備位置リスト ──────────────────────────────────────
const POSITIONS = [
  "投手", "捕手", "一塁手", "二塁手", "三塁手",
  "遊撃手", "左翼手", "中堅手", "右翼手", "指名打者",
];

// ── 型定義 ──────────────────────────────────────────────
interface LineupSlot {
  order: number;
  player: PlayerStats | null;
  position: string | null;
}

interface ManualLineupSimulatorProps {
  players: PlayerStats[];
  onBack: () => void;
}

// ── ユーティリティ ──────────────────────────────────────
function getOrderSpecificAvg(player: PlayerStats, orderIndex: number): string {
  let orderAtBats = 0;
  let orderHits = 0;
  player.games.forEach((game) => {
    if (game.battingOrder === String(orderIndex + 1)) {
      game.atBats.forEach((ab) => {
        if (!ab.isWalkOrHBP && !ab.isSacrificeBunt && !ab.isSacrificeFly) {
          orderAtBats += 1;
          if (ab.isHit) orderHits += 1;
        }
      });
    }
  });
  if (orderAtBats === 0) return "-";
  return (orderHits / orderAtBats).toFixed(3).replace(/^0/, "");
}

function fmtAvg(val: number): string {
  if (!val || isNaN(val)) return ".000";
  return val.toFixed(3).replace(/^0/, "");
}

function fmtOps(val: number): string {
  if (!val || isNaN(val)) return ".000";
  return val.toFixed(3).replace(/^0/, "");
}

// ── メインコンポーネント ────────────────────────────────
export default function ManualLineupSimulator({ players, onBack }: ManualLineupSimulatorProps) {
  const initSlots = (): LineupSlot[] =>
    Array.from({ length: 9 }, (_, i) => ({ order: i + 1, player: null, position: null }));

  const [lineup, setLineup] = useState<LineupSlot[]>(initSlots());
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [swapSource, setSwapSource] = useState<number | null>(null); // order番号
  const [editingOrder, setEditingOrder] = useState<number | null>(null); // モーダル表示中の order
  const [modalStep, setModalStep] = useState<"player" | "position">("player");
  const [pendingPlayer, setPendingPlayer] = useState<PlayerStats | null>(null);

  // 打順追加
  const addSlot = () => {
    if (lineup.length >= 12) return;
    setLineup((prev) => [...prev, { order: prev.length + 1, player: null, position: null }]);
  };

  // 最後の空枠を削除
  const removeSlot = () => {
    if (lineup.length <= 1) return;
    const last = lineup[lineup.length - 1];
    if (last.player !== null) return; // 選手が入っていたら削除不可
    setLineup((prev) => prev.slice(0, -1));
  };

  // 枠タップ処理（モード分岐）
  const handleSlotTap = (order: number) => {
    if (isSwapMode) {
      // ── 入れ替えモード ──
      if (swapSource === null) {
        setSwapSource(order);
      } else if (swapSource === order) {
        setSwapSource(null);
      } else {
        setLineup((prev) => {
          const next = prev.map((slot) => ({ ...slot }));
          const aIdx = next.findIndex((s) => s.order === swapSource);
          const bIdx = next.findIndex((s) => s.order === order);
          const tmpPlayer = next[aIdx].player;
          const tmpPos = next[aIdx].position;
          next[aIdx].player = next[bIdx].player;
          next[aIdx].position = next[bIdx].position;
          next[bIdx].player = tmpPlayer;
          next[bIdx].position = tmpPos;
          return next;
        });
        setSwapSource(null);
      }
    } else {
      // ── 通常モード → モーダルを開く ──
      openModal(order);
    }
  };

  // 入れ替えモードトグル
  const toggleSwapMode = () => {
    setIsSwapMode((prev) => !prev);
    setSwapSource(null); // モード切替時にリセット
  };

  // 変更モーダルを開く
  const openModal = (order: number) => {
    setEditingOrder(order);
    setPendingPlayer(null);
    setModalStep("player");
    setSwapSource(null);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setEditingOrder(null);
    setPendingPlayer(null);
    setModalStep("player");
  };

  // ステップ1: 選手を選択してポジション選択ステップへ
  const selectPlayer = (player: PlayerStats) => {
    setPendingPlayer(player);
    setModalStep("position");
  };

  // ステップ2: ポジションを選択して確定・モーダルを閉じる
  const selectPosition = (pos: string) => {
    if (editingOrder === null || pendingPlayer === null) return;
    setLineup((prev) =>
      prev.map((slot) =>
        slot.order === editingOrder
          ? { ...slot, player: pendingPlayer, position: pos }
          : slot
      )
    );
    closeModal();
  };

  // 枠をクリア
  const clearSlot = (order: number) => {
    setLineup((prev) =>
      prev.map((slot) =>
        slot.order === order ? { ...slot, player: null, position: null } : slot
      )
    );
  };

  // すでに選択済みの選手セット
  const usedPlayerNames = new Set(
    lineup.filter((s) => s.player !== null).map((s) => s.player!.name)
  );

  const editingSlot = editingOrder !== null ? lineup.find((s) => s.order === editingOrder) : null;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      {/* ヘッダー */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold"
          >
            <ChevronRight size={18} className="rotate-180" />
            <span>クラブハウスに戻る</span>
          </button>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-900">手動スタメンシミュレーター</p>
          </div>
          {/* 入れ替えモードトグルボタン */}
          <button
            onClick={toggleSwapMode}
            className={`
              flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all
              ${isSwapMode
                ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"}
            `}
          >
            <ArrowLeftRight size={12} />
            {isSwapMode ? "入替モード中" : "打順入替"}
          </button>
        </div>

        {/* 案内メッセージ */}
        <AnimatePresence>
          {isSwapMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-2">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <ArrowLeftRight size={12} className="text-amber-500 shrink-0" />
                  <span className="text-[11px] text-amber-700 font-semibold">
                    入れ替えたい2つの打順をタップしてください
                    {swapSource !== null && `（${swapSource}番を選択中）`}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 打順リスト */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 flex flex-col gap-2.5">
        {lineup.map((slot) => {
          const isSwapSrc = swapSource === slot.order;
          const isSwapTarget = isSwapMode && swapSource !== null && swapSource !== slot.order;
          return (
            <motion.div
              key={slot.order}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`
                relative rounded-2xl shadow-sm border transition-all
                ${isSwapSrc
                  ? "border-amber-400 bg-amber-50 ring-2 ring-amber-400/40"
                  : isSwapTarget
                  ? "border-amber-200 bg-white"
                  : "border-slate-200 bg-white"}
              `}
            >
              {/* 枠全体がタップ可能なボタン */}
              <button
                className="w-full text-left p-3"
                onClick={() => handleSlotTap(slot.order)}
              >
                <div className="flex items-start gap-3">
                  {/* 打順バッジ */}
                  <div
                    className={`
                      w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 mt-0.5
                      ${isSwapSrc ? "bg-amber-500 text-white" : "bg-slate-800 text-white"}
                    `}
                  >
                    {slot.order}
                  </div>

                  {/* 中身 */}
                  {slot.player ? (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-sm">{slot.player.name}</span>
                        {slot.position && (
                          <span className="text-[10px] bg-[#059669]/10 text-[#059669] px-1.5 py-0.5 rounded-md font-bold">
                            {slot.position}
                          </span>
                        )}
                        {!isSwapMode && (
                          <span className="text-[10px] text-slate-300 ml-auto">タップで変更</span>
                        )}
                      </div>
                      {/* スタッツ3点 */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <StatBadge label="AVG" value={fmtAvg(slot.player.avg)} />
                        <StatBadge label="OPS" value={fmtOps(slot.player.ops)} />
                        <StatBadge
                          label={`${slot.order}番打率`}
                          value={getOrderSpecificAvg(slot.player, slot.order - 1)}
                          accent
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-2 py-1">
                      <UserPlus size={16} className="text-slate-300" />
                      <span className="text-slate-300 text-sm">
                        {isSwapMode ? "（空き）" : "タップして選手を設定"}
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {/* クリアボタン（通常モード時のみ表示） */}
              {!isSwapMode && slot.player && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearSlot(slot.order); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-red-400 transition-colors px-1"
                >
                  クリア
                </button>
              )}
            </motion.div>
          );
        })}

        {/* 打順増減ボタン */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={addSlot}
            disabled={lineup.length >= 12}
            className="flex-1 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm font-bold hover:border-[#059669] hover:text-[#059669] transition-colors disabled:opacity-30"
          >
            ＋ 打順を追加
          </button>
          <button
            onClick={removeSlot}
            disabled={lineup.length <= 1 || lineup[lineup.length - 1].player !== null}
            className="flex-1 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm font-bold hover:border-red-400 hover:text-red-400 transition-colors disabled:opacity-30"
          >
            － 打順を減らす
          </button>
        </div>
      </div>

      {/* 選手・ポジション選択モーダル */}
      <AnimatePresence>
        {editingOrder !== null && (
          <>
            {/* オーバーレイ */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={closeModal}
            />
            {/* シート */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col"
            >
              {/* シートヘッダー */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
                <div>
                  <p className="text-xs text-slate-400 font-semibold">
                    {editingOrder}番打者
                    {editingSlot?.player ? `（現: ${editingSlot.player.name}）` : ""}
                  </p>
                  <p className="text-base font-black text-slate-900">
                    {modalStep === "player"
                      ? "選手を選択"
                      : `${pendingPlayer?.name} の守備位置を選択`}
                  </p>
                </div>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* ステップ戻るボタン（ポジション選択画面のみ） */}
              {modalStep === "position" && (
                <button
                  onClick={() => { setModalStep("player"); setPendingPlayer(null); }}
                  className="flex items-center gap-1 text-xs text-[#1e3a5f] font-bold px-5 pt-2 w-fit"
                >
                  <ChevronRight size={14} className="rotate-180" />
                  ← 選手を選び直す
                </button>
              )}

              {/* コンテンツ */}
              <div className="flex-1 overflow-y-auto px-4 py-3 pb-8">
                {modalStep === "player" ? (
                  /* ステップ1: 選手選択リスト */
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-slate-400 mb-1">グレーは選択済み</p>
                    {[...players]
                      .sort((a, b) => b.avg - a.avg)
                      .map((player) => {
                        const isUsed =
                          usedPlayerNames.has(player.name) &&
                          editingSlot?.player?.name !== player.name;
                        const orderAvg =
                          editingOrder !== null
                            ? getOrderSpecificAvg(player, editingOrder - 1)
                            : "-";
                        return (
                          <button
                            key={player.name}
                            onClick={() => !isUsed && selectPlayer(player)}
                            disabled={isUsed}
                            className={`
                              w-full text-left rounded-xl border px-3 py-2.5 transition-all
                              ${isUsed
                                ? "border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed"
                                : "border-slate-200 bg-white hover:border-[#059669] hover:bg-[#ecfdf5]"}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">{player.name}</span>
                                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {player.mostFrequentPosition || "-"}
                                  </span>
                                </div>
                                <div className="flex gap-3 mt-1">
                                  <span className="text-[10px] text-slate-400">
                                    AVG <span className="font-bold text-slate-600">{fmtAvg(player.avg)}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    OPS <span className="font-bold text-slate-600">{fmtOps(player.ops)}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {editingOrder}番AVG{" "}
                                    <span className="font-bold text-[#059669]">{orderAvg}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  /* ステップ2: 守備位置選択グリッド */
                  <div className="grid grid-cols-3 gap-2.5">
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => selectPosition(pos)}
                        className="py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:border-[#059669] hover:text-[#059669] hover:bg-[#ecfdf5] transition-all"
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── スタッツバッジ ──────────────────────────────────────
function StatBadge({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="flex flex-col items-start">
      <span className="text-[9px] text-slate-400 leading-none">{label}</span>
      <span className={`text-[13px] font-black leading-tight ${accent ? "text-[#059669]" : "text-slate-700"}`}>
        {value}
      </span>
    </span>
  );
}
