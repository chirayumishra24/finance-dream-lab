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
    { label: "Blueprint Phase", color: "from-blue-500/10 to-blue-600/5", iconOpacity: 0.3, decoration: "border-dashed" },
    { label: "Grand Opening", color: "from-emerald-500/10 to-emerald-600/5", iconOpacity: 0.6, decoration: "border-solid" },
    { label: "Full Operation", color: "from-orange-500/10 to-orange-600/5", iconOpacity: 0.8, decoration: "border-double border-4" },
    { label: "Market Leader", color: "from-yellow-500/10 to-yellow-600/5", iconOpacity: 1, decoration: "border-solid ring-4 ring-yellow-400/20 shadow-glow" },
  ];

  const config = stageConfigs[stage];

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
    <div className={`relative overflow-hidden rounded-[2rem] border transition-all duration-700 ${config.decoration} ${config.color} p-8 flex flex-col items-center justify-center min-h-[300px]`}>
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="grid grid-cols-6 gap-4 p-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <Building2 key={i} className="h-12 w-12" />
          ))}
        </div>
      </div>

      {/* Stage Badge */}
      <div className="absolute top-6 right-6 rounded-full bg-background/80 backdrop-blur-sm border px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
        {config.label}
      </div>

      {/* Main Visual */}
      <div className="relative">
        <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full opacity-20 animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl transition-transform duration-500 hover:scale-110">
          <Icon className="h-12 w-12" style={{ opacity: config.iconOpacity }} />
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 text-center space-y-2">
        <h3 className="text-2xl font-bold tracking-tight">{shopLabel || "Building your dream..."}</h3>
        <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
          {stage === 0 && "Architecting the vision. Finalizing details."}
          {stage === 1 && "Doors are open! Welcoming the first customers."}
          {stage === 2 && "Steady footfall. Optimizing daily flows."}
          {stage === 3 && "A local legend. Scaling the magic."}
        </p>
      </div>

      {/* Mini Stats */}
      <div className="mt-8 flex gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground bg-background/40 px-2.5 py-1 rounded-lg border">
          <Users className="h-3 w-3" /> {stage * 25 + 10}% Traffic
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground bg-background/40 px-2.5 py-1 rounded-lg border">
          <Package className="h-3 w-3" /> {stage * 15 + 40}% Inventory
        </div>
        {stage === 3 && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-yellow-600 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
            <TrendingUp className="h-3 w-3" /> Peak Performance
          </div>
        )}
      </div>
    </div>
  );
}
