import { useSim } from "@/lib/simStore";
import { Cake, BookOpen, Gamepad2, ToyBrick, Sparkles, Building2, TrendingUp, Users, Package } from "lucide-react";

export function ShopVisual() {
  const { shopType, customShop, step, months } = useSim();
  const shopLabel = shopType === "Custom" ? customShop : shopType;
  
  // Determine Stage
  // 0: Blueprint, 1: Opening, 2: Operating, 3: Thriving
  let stage = 0;
  if (step > 1) stage = 1;
  if (months.length >= 3) stage = 2;
  if (months.length >= 6) {
    const totalPL = months.reduce((acc, m) => acc + (m.revenue - m.expenses), 0);
    if (totalPL > 500) stage = 3; // Success!
  }

  const stageConfigs = [
    {
      label: "Blueprint Phase",
      color: "from-blue-500/10 via-sky-500/5 to-blue-600/5",
      iconOpacity: 0.4,
      decoration: "border-dashed",
      accent: "bg-blue-500",
      glow: "bg-blue-500/25",
      front: "from-slate-100 to-blue-100",
      awning: "from-blue-500 to-cyan-400",
    },
    {
      label: "Grand Opening",
      color: "from-emerald-500/10 via-teal-500/5 to-emerald-600/5",
      iconOpacity: 0.65,
      decoration: "border-solid",
      accent: "bg-emerald-500",
      glow: "bg-emerald-500/25",
      front: "from-emerald-50 to-teal-100",
      awning: "from-emerald-500 to-teal-400",
    },
    {
      label: "Full Operation",
      color: "from-orange-500/10 via-amber-500/5 to-orange-600/5",
      iconOpacity: 0.85,
      decoration: "border-double border-4",
      accent: "bg-orange-500",
      glow: "bg-orange-500/25",
      front: "from-orange-50 to-amber-100",
      awning: "from-orange-500 to-amber-400",
    },
    {
      label: "Market Leader",
      color: "from-yellow-500/10 via-amber-400/5 to-yellow-600/5",
      iconOpacity: 1,
      decoration: "border-solid ring-4 ring-yellow-400/20 shadow-glow",
      accent: "bg-yellow-500",
      glow: "bg-yellow-500/30",
      front: "from-yellow-50 to-amber-100",
      awning: "from-yellow-500 to-orange-400",
    },
  ];

  const config = stageConfigs[stage];
  const traffic = stage * 25 + 10;
  const inventory = stage * 15 + 40;

  const getShopIcon = () => {
    switch (shopType) {
      case "Bakery": return Cake;
      case "Bookstore": return BookOpen;
      case "Toy Store": return ToyBrick;
      case "Gaming Café": return Gamepad2;
      default: return Sparkles;
    }
  };

  const Icon = getShopIcon();

  return (
    <div className={`shop-stage relative flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border bg-gradient-to-br p-6 transition-all duration-700 ${config.decoration} ${config.color}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="grid grid-cols-6 gap-4 p-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <Building2 key={i} className="h-12 w-12" />
            ))}
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />
        <div className={`absolute left-12 top-16 h-24 w-24 rounded-full ${config.glow} blur-2xl`} />
        <div className={`absolute bottom-10 right-10 h-32 w-32 rounded-full ${config.glow} blur-3xl`} />
      </div>

      <div className="absolute right-5 top-5 rounded-full border bg-background/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm backdrop-blur-sm">
        {config.label}
      </div>

      <div className="shop-scene relative mt-4 h-44 w-full max-w-[280px]">
        <div className="shop-shadow" />
        <div className="shop-back-wall" />
        <div className={`shop-building-face bg-gradient-to-br ${config.front}`}>
          <div className={`shop-awning bg-gradient-to-r ${config.awning}`}>
            <span />
            <span />
            <span />
          </div>
          <div className="shop-sign">
            <Icon className="h-6 w-6" style={{ opacity: config.iconOpacity }} />
            <span>{shopLabel || "Dream Shop"}</span>
          </div>
          <div className="shop-window shop-window-left">
            <Package className="h-4 w-4" />
          </div>
          <div className="shop-door">
            <span />
          </div>
          <div className="shop-window shop-window-right">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className={`shop-side-wall ${config.accent}`} />
        <div className="shop-coin shop-coin-one">₹</div>
        <div className="shop-coin shop-coin-two">%</div>
        {stage >= 2 && <div className="shop-spark shop-spark-one" />}
        {stage === 3 && <div className="shop-spark shop-spark-two" />}
      </div>

      <div className="mt-5 space-y-2 text-center">
        <h3 className="text-2xl font-bold tracking-tight">{shopLabel || "Building your dream..."}</h3>
        <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
          {stage === 0 && "Architecting the vision. Finalizing details."}
          {stage === 1 && "Doors are open! Welcoming the first customers."}
          {stage === 2 && "Steady footfall. Optimizing daily flows."}
          {stage === 3 && "A local legend. Scaling the magic."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border bg-background/50 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
          <Users className="h-3 w-3" /> {traffic}% Traffic
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border bg-background/50 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
          <Package className="h-3 w-3" /> {inventory}% Inventory
        </div>
        {stage === 3 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-semibold text-yellow-600">
            <TrendingUp className="h-3 w-3" /> Peak Performance
          </div>
        )}
      </div>
    </div>
  );
}
