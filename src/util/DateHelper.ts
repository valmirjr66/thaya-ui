export const mapMonthNumberToAbbreviation = (month: number): string => {
  const monthNames = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  return monthNames[month];
};

export const mapMonthNumberToCapitalizedAbbreviation = (
  month: number
): string =>
  mapMonthNumberToAbbreviation(month).charAt(0).toUpperCase() +
  mapMonthNumberToAbbreviation(month).slice(1);
