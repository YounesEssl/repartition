import type { Chalet } from "./types";

export function parsePeople(text: string): string[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Ensure unique names
  const seen: Record<string, number> = {};
  return lines.map((line) => {
    if (seen[line]) {
      seen[line]++;
      return `${line} (${seen[line]})`;
    }
    seen[line] = 1;
    return line;
  });
}

export function findPersonLocation(
  chalets: Chalet[],
  personId: string
): { chaletId: string; roomId: string } | null {
  for (const chalet of chalets) {
    for (const floor of chalet.floors) {
      for (const room of floor.rooms) {
        if (room.occupants.includes(personId)) {
          return { chaletId: chalet.id, roomId: room.id };
        }
      }
    }
  }
  return null;
}

export function generateExport(chalets: Chalet[]): string {
  const lines: string[] = [];
  lines.push("═══════════════════════════════");
  lines.push("RÉPARTITION DES CHAMBRES");
  lines.push("═══════════════════════════════");
  lines.push("");

  const large = chalets.filter((c) => c.capacity > 2);
  const small = chalets.filter((c) => c.capacity <= 2);

  large.forEach((chalet) => {
    lines.push(`${chalet.name.toUpperCase()} (${chalet.capacity} places)`);
    chalet.floors.forEach((floor) => {
      if (floor.name) lines.push(`  ${floor.name}`);
      floor.rooms.forEach((room) => {
        const occ =
          room.occupants.length > 0 ? room.occupants.join(", ") : "(vide)";
        lines.push(`  ${room.name} (${room.capacity}p) : ${occ}`);
      });
    });
    lines.push("");
  });

  const filledSmall = small.filter((c) =>
    c.floors.some((f) => f.rooms.some((r) => r.occupants.length > 0))
  );
  if (filledSmall.length > 0) {
    lines.push("CHALETS INDIVIDUELS (2 places)");
    filledSmall.forEach((chalet) => {
      const occupants = chalet.floors[0].rooms[0].occupants;
      lines.push(`  ${chalet.name} : ${occupants.join(", ")}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}
