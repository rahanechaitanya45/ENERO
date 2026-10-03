import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-sky-50/80 border-b border-sky-100/90 text-sky-950 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <p className="leading-snug">
            <span className="font-semibold text-sky-900">Important Disclaimer:</span> ENERO provides an estimated electricity consumption and bill. Actual electricity bills may vary depending on electricity-provider tariffs, progressive slabs, fixed meter rents, regulatory taxes, government subsidies, and seasonal ambient temperature variations.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-sky-600 hover:text-sky-900 p-0.5 rounded transition-colors shrink-0"
          title="Dismiss disclaimer"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
