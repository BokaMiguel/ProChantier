export const processExcelData = (data: any[]) => {
  const lieux = new Set<string>();
  const bases = new Set<string>();

  data.forEach((row) => {
    if (row.Lieu) {
      lieux.add(row.Lieu);
    }
    if (row["Base A"] && row["Base B"]) {
      bases.add(`${row["Base A"]}-${row["Base B"]}`);
    }
  });

  return {
    lieux: Array.from(lieux),
    bases: Array.from(bases),
  };
};
