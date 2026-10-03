import { 
  Appliance, 
  ApplianceWithCalculations, 
  TariffConfig, 
  BillSummary, 
  EnergyInsight, 
  HomeProfile 
} from '../types';

/**
 * Calculates consumption for an individual appliance.
 * Formula: Power (W) × Quantity × Hours/Day × Days/Month ÷ 1000
 */
export function calculateApplianceConsumption(
  appliance: Appliance,
  tariff: TariffConfig,
  totalApplianceKwh: number = 0
): ApplianceWithCalculations {
  const dailyKwh = (appliance.powerWatts * appliance.quantity * appliance.hoursPerDay) / 1000;
  const monthlyKwh = (appliance.powerWatts * appliance.quantity * appliance.hoursPerDay * appliance.daysPerMonth) / 1000;
  
  // Approximate cost contribution based on effective average rate
  const effectiveRate = getEffectiveRatePerKwh(tariff, totalApplianceKwh || monthlyKwh);
  const estimatedCost = monthlyKwh * effectiveRate;
  const percentageOfTotal = totalApplianceKwh > 0 ? (monthlyKwh / totalApplianceKwh) * 100 : 0;

  return {
    ...appliance,
    dailyKwh: roundTo(dailyKwh, 2),
    monthlyKwh: roundTo(monthlyKwh, 2),
    estimatedCost: roundTo(estimatedCost, 2),
    percentageOfTotal: roundTo(percentageOfTotal, 1),
  };
}

/**
 * Calculates total bill breakdown (energy cost, fixed charges, taxes) from kWh.
 */
export function calculateBillFromKwh(totalKwh: number, tariff: TariffConfig): {
  energyCost: number;
  fixedCharges: number;
  taxes: number;
  total: number;
} {
  if (totalKwh <= 0) {
    return {
      energyCost: 0,
      fixedCharges: tariff.fixedMonthlyCharge || 0,
      taxes: roundTo((tariff.fixedMonthlyCharge || 0) * (tariff.taxPercent / 100), 2),
      total: roundTo((tariff.fixedMonthlyCharge || 0) * (1 + tariff.taxPercent / 100), 2),
    };
  }

  let energyCost = 0;

  if (tariff.mode === 'flat' || !tariff.slabs || tariff.slabs.length === 0) {
    energyCost = totalKwh * tariff.flatRate;
  } else {
    // Progressive slab calculation
    let remainingUnits = totalKwh;
    
    // Sort slabs by minUnits
    const sortedSlabs = [...tariff.slabs].sort((a, b) => a.minUnits - b.minUnits);

    for (let i = 0; i < sortedSlabs.length; i++) {
      const slab = sortedSlabs[i];
      const slabSpan = slab.maxUnits !== null ? (slab.maxUnits - slab.minUnits + 1) : Infinity;
      
      const unitsBilledInSlab = Math.min(remainingUnits, slabSpan);
      if (unitsBilledInSlab > 0) {
        energyCost += unitsBilledInSlab * slab.ratePerKwh;
        remainingUnits -= unitsBilledInSlab;
      }

      if (remainingUnits <= 0) break;
    }
  }

  const fixedCharges = tariff.fixedMonthlyCharge || 0;
  const subtotal = energyCost + fixedCharges;
  const taxes = subtotal * (tariff.taxPercent / 100);
  const total = subtotal + taxes;

  return {
    energyCost: roundTo(energyCost, 2),
    fixedCharges: roundTo(fixedCharges, 2),
    taxes: roundTo(taxes, 2),
    total: Math.round(total), // Bills typically presented rounded to nearest integer
  };
}

/**
 * Computes an effective per-kWh rate for proportional attribution
 */
export function getEffectiveRatePerKwh(tariff: TariffConfig, currentKwh: number): number {
  if (tariff.mode === 'flat') {
    return tariff.flatRate;
  }
  if (!currentKwh || currentKwh <= 0) {
    return tariff.slabs[0]?.ratePerKwh || tariff.flatRate;
  }
  const bill = calculateBillFromKwh(currentKwh, tariff);
  return bill.energyCost / currentKwh;
}

/**
 * Generates the full bill summary, rankings, and stats for the dashboard.
 */
export function calculateTotalSummary(
  appliances: Appliance[],
  tariff: TariffConfig,
  homeProfile: HomeProfile
): {
  summary: BillSummary;
  rankedAppliances: ApplianceWithCalculations[];
} {
  // 1. Calculate raw kWh sum first
  const rawTotalMonthlyKwh = appliances.reduce((sum, app) => {
    return sum + (app.powerWatts * app.quantity * app.hoursPerDay * app.daysPerMonth) / 1000;
  }, 0);

  const totalMonthlyKwh = roundTo(rawTotalMonthlyKwh, 1);
  const totalDailyKwh = roundTo(totalMonthlyKwh / 30, 1);

  // 2. Calculate appliance-level breakdown with percentage
  const calculatedAppliances: ApplianceWithCalculations[] = appliances.map((app) => 
    calculateApplianceConsumption(app, tariff, totalMonthlyKwh)
  );

  // 3. Sort by highest consumption first
  const rankedAppliances = [...calculatedAppliances].sort(
    (a, b) => b.monthlyKwh - a.monthlyKwh
  );

  // 4. Calculate bill components
  const billBreakdown = calculateBillFromKwh(totalMonthlyKwh, tariff);
  const targetBudget = homeProfile.targetMonthlyBudget;
  const budgetDelta = billBreakdown.total - targetBudget;
  const isOverBudget = budgetDelta > 0;

  // 5. Calculate potential savings by optimizing top consumer by 20%
  const topConsumer = rankedAppliances.length > 0 ? rankedAppliances[0] : null;
  let potentialSavingsMonthly = 0;
  if (topConsumer && topConsumer.monthlyKwh > 30) {
    const reducedTopKwh = topConsumer.monthlyKwh * 0.25; // simulate ~25% reduction on top device
    const billBefore = billBreakdown.total;
    const billAfter = calculateBillFromKwh(Math.max(0, totalMonthlyKwh - reducedTopKwh), tariff).total;
    potentialSavingsMonthly = Math.max(0, billBefore - billAfter);
  }

  // 6. Energy Awareness Score calculation
  const energyScore = calculateEnergyScore(rankedAppliances, totalMonthlyKwh, targetBudget, billBreakdown.total, homeProfile.occupants);

  const summary: BillSummary = {
    totalMonthlyKwh,
    totalDailyKwh,
    energyCost: billBreakdown.energyCost,
    fixedCharges: billBreakdown.fixedCharges,
    taxes: billBreakdown.taxes,
    totalEstimatedBill: billBreakdown.total,
    targetBudget,
    budgetDelta: Math.abs(budgetDelta),
    isOverBudget,
    topConsumer,
    energyScore,
    potentialSavingsMonthly: Math.round(potentialSavingsMonthly),
    applianceCount: appliances.reduce((acc, a) => acc + (a.quantity || 1), 0),
  };

  return {
    summary,
    rankedAppliances,
  };
}

/**
 * Calculates simulated scenario: what happens when hours/day are modified
 */
export function simulateUsageAdjustment(
  originalAppliances: Appliance[],
  adjustments: Record<string, { hoursPerDay: number; daysPerMonth?: number }>,
  tariff: TariffConfig
): {
  originalKwh: number;
  simulatedKwh: number;
  kwhSaved: number;
  originalBill: number;
  simulatedBill: number;
  costSaved: number;
  annualizedSaved: number;
  percentSaved: number;
} {
  const originalKwh = originalAppliances.reduce((sum, app) => {
    return sum + (app.powerWatts * app.quantity * app.hoursPerDay * app.daysPerMonth) / 1000;
  }, 0);

  const simulatedKwh = originalAppliances.reduce((sum, app) => {
    const adj = adjustments[app.id];
    const hours = adj !== undefined ? adj.hoursPerDay : app.hoursPerDay;
    const days = (adj && adj.daysPerMonth !== undefined) ? adj.daysPerMonth : app.daysPerMonth;
    return sum + (app.powerWatts * app.quantity * hours * days) / 1000;
  }, 0);

  const originalBill = calculateBillFromKwh(originalKwh, tariff).total;
  const simulatedBill = calculateBillFromKwh(simulatedKwh, tariff).total;

  const kwhSaved = Math.max(0, originalKwh - simulatedKwh);
  const costSaved = Math.max(0, originalBill - simulatedBill);
  const annualizedSaved = costSaved * 12;
  const percentSaved = originalBill > 0 ? (costSaved / originalBill) * 100 : 0;

  return {
    originalKwh: roundTo(originalKwh, 1),
    simulatedKwh: roundTo(simulatedKwh, 1),
    kwhSaved: roundTo(kwhSaved, 1),
    originalBill: Math.round(originalBill),
    simulatedBill: Math.round(simulatedBill),
    costSaved: Math.round(costSaved),
    annualizedSaved: Math.round(annualizedSaved),
    percentSaved: roundTo(percentSaved, 1),
  };
}

/**
 * Generates rule-based smart insights and actionable recommendations
 */
export function generateSmartInsights(
  appliances: ApplianceWithCalculations[],
  tariff: TariffConfig,
  totalMonthlyKwh: number
): EnergyInsight[] {
  const insights: EnergyInsight[] = [];
  const effectiveRate = getEffectiveRatePerKwh(tariff, totalMonthlyKwh);

  // 1. Air Conditioner Insight
  const acs = appliances.filter((a) => a.category === 'Cooling' && a.name.toLowerCase().includes('air conditioner') || a.name.toLowerCase().includes('ac'));
  const totalAcKwh = acs.reduce((sum, a) => sum + a.monthlyKwh, 0);

  if (totalAcKwh > 0 && totalMonthlyKwh > 0) {
    const acPercent = (totalAcKwh / totalMonthlyKwh) * 100;
    if (acPercent >= 35 || totalAcKwh > 180) {
      // 1 hour less per day across ACs
      const potentialMonthlyKwh = acs.reduce((sum, a) => sum + (a.powerWatts * a.quantity * 1 * a.daysPerMonth) / 1000, 0);
      const potentialSavingCost = potentialMonthlyKwh * effectiveRate;

      insights.push({
        id: 'insight-ac-usage',
        priority: 'High',
        applianceName: 'Air Conditioner',
        title: 'Optimize Daily AC Run-Time & Thermostat',
        description: 'Your air conditioner contributes a large portion of your estimated monthly consumption. Setting thermostat to 24°C instead of 18°C or reducing usage by 1 hour daily yields major savings without sacrificing comfort.',
        potentialMonthlySavingKwh: roundTo(potentialMonthlyKwh, 1),
        potentialMonthlySavingCost: Math.round(potentialSavingCost),
        actionHint: 'Try reducing daily usage by 1 hour and compare the potential difference in the Savings Simulator.',
      });
    }
  }

  // 2. Water Heater / Geyser Insight
  const geysers = appliances.filter((a) => a.category === 'Heating' || a.name.toLowerCase().includes('geyser') || a.name.toLowerCase().includes('water heater'));
  const totalGeyserKwh = geysers.reduce((sum, a) => sum + a.monthlyKwh, 0);

  if (totalGeyserKwh > 40) {
    const highRunGeyser = geysers.find((g) => g.hoursPerDay >= 1);
    const saveKwh = (highRunGeyser ? (highRunGeyser.powerWatts * 0.4 * highRunGeyser.daysPerMonth) : 25) / 1000;
    insights.push({
      id: 'insight-geyser',
      priority: 'Medium',
      applianceName: 'Geyser / Water Heater',
      title: 'Water Heater Operating Duration',
      description: 'Your geyser has a high power rating (typically 2000W+). Switching it off immediately after heating rather than leaving it on continuous standby prevents continuous reheating cycles.',
      potentialMonthlySavingKwh: roundTo(saveKwh * 30, 1),
      potentialMonthlySavingCost: Math.round(saveKwh * 30 * effectiveRate),
      actionHint: 'Limit heating cycle to 20-30 minutes per bath instead of keeping switched on all morning.',
    });
  }

  // 3. Multiple Ceiling Fans
  const fans = appliances.filter((a) => a.name.toLowerCase().includes('fan'));
  const fanCount = fans.reduce((sum, a) => sum + a.quantity, 0);
  const totalFanKwh = fans.reduce((sum, a) => sum + a.monthlyKwh, 0);

  if (fanCount >= 3 || totalFanKwh > 60) {
    // BLDC conversion or 2h less
    const fanSaveKwh = totalFanKwh * 0.35; // BLDC saves 50%, or 2h less saves ~20%
    insights.push({
      id: 'insight-fans',
      priority: 'Medium',
      applianceName: 'Ceiling Fans',
      title: 'Continuous Fan Operation & BLDC Upgrade',
      description: 'You have several fans running for long periods every day. While a single fan has low wattage, multiple units operating 10+ hours per day quietly compound into a noticeable chunk of your bill.',
      potentialMonthlySavingKwh: roundTo(fanSaveKwh, 1),
      potentialMonthlySavingCost: Math.round(fanSaveKwh * effectiveRate),
      actionHint: 'Compare current usage with a reduced-hours scenario or consider BLDC fans when replacing older units.',
    });
  }

  // 4. Lighting & Standby
  const lights = appliances.filter((a) => a.category === 'Lighting');
  const entertainment = appliances.filter((a) => a.category === 'Entertainment' || a.category === 'Computing');
  
  if (lights.some((l) => l.powerWatts > 25)) {
    insights.push({
      id: 'insight-lighting',
      priority: 'Low',
      applianceName: 'Lighting',
      title: 'LED Lighting Upgrades',
      description: 'Some of your recorded lights indicate higher wattage than modern 9W LED bulbs. Transitioning traditional tube lights or incandescent bulbs can reduce lighting load by up to 60%.',
      potentialMonthlySavingKwh: 18,
      potentialMonthlySavingCost: Math.round(18 * effectiveRate),
      actionHint: 'Ensure all primary fixtures use 9W–12W LED bulbs with automatic room shutoffs.',
    });
  }

  if (entertainment.some((e) => e.hoursPerDay >= 6)) {
    insights.push({
      id: 'insight-entertainment',
      priority: 'Low',
      applianceName: 'TV & Computing',
      title: 'Phantom & Standby Load Prevention',
      description: 'Smart TVs, gaming rigs, and desktop stations often consume continuous idle power when kept on wall standby. Using a master switch strips phantom power drain.',
      potentialMonthlySavingKwh: 12,
      potentialMonthlySavingCost: Math.round(12 * effectiveRate),
      actionHint: 'Enable automatic sleep timers and switch off set-top boxes at night.',
    });
  }

  // 5. Fallback general insight if list is small
  if (insights.length === 0) {
    insights.push({
      id: 'insight-general-balance',
      priority: 'Low',
      applianceName: 'General Efficiency',
      title: 'Balanced Home Energy Profile',
      description: 'Your entered appliances show a well-distributed consumption profile without extreme runaway spikes. Continue monitoring seasonal changes as weather shifts.',
      potentialMonthlySavingKwh: 15,
      potentialMonthlySavingCost: Math.round(15 * effectiveRate),
      actionHint: 'Use the Savings Simulator to test seasonal what-if scenarios.',
    });
  }

  return insights;
}

/**
 * Calculates a motivational 0-100 energy awareness score
 */
function calculateEnergyScore(
  rankedAppliances: ApplianceWithCalculations[],
  totalKwh: number,
  targetBudget: number,
  estimatedBill: number,
  occupants: number
): number {
  if (rankedAppliances.length === 0 || totalKwh === 0) return 60;

  let score = 70;

  // 1. Budget alignment (+15 if under budget, -15 if >20% over)
  if (targetBudget > 0) {
    const ratio = estimatedBill / targetBudget;
    if (ratio <= 0.95) score += 15;
    else if (ratio <= 1.05) score += 8;
    else if (ratio <= 1.25) score -= 8;
    else score -= 18;
  }

  // 2. Top consumer dominance (if top item > 60% of whole house, indicates heavy reliance on single load)
  const topAppliance = rankedAppliances[0];
  if (topAppliance) {
    if (topAppliance.percentageOfTotal > 60) score -= 10;
    else if (topAppliance.percentageOfTotal < 40) score += 10;
  }

  // 3. Per-occupant benchmark (approx 60-120 kWh/person/month is typical urban benchmark)
  const safeOccupants = Math.max(1, occupants || 1);
  const kwhPerPerson = totalKwh / safeOccupants;
  if (kwhPerPerson < 90) score += 10;
  else if (kwhPerPerson > 180) score -= 12;

  // Clamp strictly between 20 and 98 (keep realistic)
  return Math.min(98, Math.max(25, Math.round(score)));
}

/**
 * Helper to round to specified decimal places
 */
function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
