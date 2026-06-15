// Quarter format: "Q1-2026" (Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Set, Q4=Out-Dez)

export function currentQuarter(): string {
  return quarterFromDate(new Date());
}

export function quarterFromDate(date: Date): string {
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();
  const q = Math.ceil(month / 3);
  return `Q${q}-${year}`;
}

export function quarterLabel(quarter: string): string {
  const [q, year] = quarter.split("-");
  const labels: Record<string, string> = {
    Q1: "Jan–Mar",
    Q2: "Abr–Jun",
    Q3: "Jul–Set",
    Q4: "Out–Dez",
  };
  return `${labels[q] ?? q} ${year}`;
}

export function quarterRange(quarter: string): { start: Date; end: Date } {
  const [q, yearStr] = quarter.split("-");
  const year = parseInt(yearStr, 10);
  const ranges: Record<string, [number, number]> = {
    Q1: [0, 2],   // Jan–Mar (month indices)
    Q2: [3, 5],   // Abr–Jun
    Q3: [6, 8],   // Jul–Set
    Q4: [9, 11],  // Out–Dez
  };
  const [startMonth, endMonth] = ranges[q];
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, endMonth + 1, 0); // last day of end month
  return { start, end };
}

export function isQuarterCurrent(quarter: string): boolean {
  return quarter === currentQuarter();
}

export function previousQuarter(quarter: string): string {
  const [q, yearStr] = quarter.split("-");
  const year = parseInt(yearStr, 10);
  const num = parseInt(q.replace("Q", ""), 10);
  if (num === 1) return `Q4-${year - 1}`;
  return `Q${num - 1}-${year}`;
}
