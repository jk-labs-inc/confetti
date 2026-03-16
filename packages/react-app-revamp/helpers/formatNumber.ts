/**
 * Converts a number to a more human-readable string format
 * @param num - The number to format
 * @return A string representing the formatted number
 */
export function formatNumber(num: number): string {
  let formatter = new Intl.NumberFormat("en-US");

  let formatted = formatter.format(+num);

  return formatted;
}

/**
 * formats a number with commas as thousand separators
 * @param num - the number to format
 * @return a string representing the formatted number with commas
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * breaks down a number into a value and symbol for abbreviation
 * @param num - the number to format
 * @return an object with the formatted value and symbol
 */
export function getNumberWithSymbol(num: number): { value: string; symbol: string } {
  const abbreviations = [
    { value: 1e9, symbol: "b" },
    { value: 1e6, symbol: "m" },
    { value: 1e3, symbol: "k" },
  ];

  if (num < 10000) {
    return { value: num.toLocaleString("en-US"), symbol: "" };
  }

  for (const { value, symbol } of abbreviations) {
    if (num >= value) {
      const formatted = (num / value).toFixed(2).replace(/\.00$/, "");
      return { value: formatted, symbol };
    }
  }

  return { value: num.toString(), symbol: "" };
}
