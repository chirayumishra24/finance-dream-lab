import { BadgeIndianRupee, BarChart3, Package, Store } from "lucide-react";

export function VisualBackdrop() {
  return (
    <div className="visual-backdrop no-print" aria-hidden="true">
      <div className="depth-grid" />
      <div className="light-beam light-beam-one" />
      <div className="light-beam light-beam-two" />

      <div className="floating-depth-card floating-depth-card-one">
        <Store className="h-5 w-5" />
        <span>Concept</span>
      </div>
      <div className="floating-depth-card floating-depth-card-two">
        <BadgeIndianRupee className="h-5 w-5" />
        <span>Capital</span>
      </div>
      <div className="floating-depth-card floating-depth-card-three">
        <BarChart3 className="h-5 w-5" />
        <span>Growth</span>
      </div>

      <div className="floating-coin coin-one">₹</div>
      <div className="floating-coin coin-two">%</div>
      <div className="floating-coin coin-three">
        <Package className="h-5 w-5" />
      </div>

      <div className="depth-cube depth-cube-one" />
      <div className="depth-cube depth-cube-two" />
      <div className="depth-ring" />
    </div>
  );
}
