"use client";

type Tab = "team" | "ranking" | "player" | "clubhouse";

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "team",      label: "チーム",       emoji: "⚾" },
  { id: "ranking",   label: "ランキング",   emoji: "👑" },
  { id: "player",    label: "個人",         emoji: "👤" },
  { id: "clubhouse", label: "クラブハウス", emoji: "🏠" },
];

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch h-16 max-w-xl mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "text-[#1e3a5f]"
                  : "text-slate-400 hover:text-slate-500"
              }`}
            >
              <span className="text-xl leading-none">{tab.emoji}</span>
              <span className={`text-[11px] font-semibold tracking-tight ${isActive ? "text-[#1e3a5f]" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-[#1e3a5f] rounded-b" style={{ position: "relative", width: "24px", height: "2px", background: "#1e3a5f", borderRadius: "1px", marginTop: "2px" }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
