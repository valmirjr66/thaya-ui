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

export const formatDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${day} ${mapMonthNumberToCapitalizedAbbreviation(month)}, ${hours}h${formattedMinutes}`;
};
