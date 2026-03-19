export interface Room {
  id: string;
  name: string;
  capacity: number;
  occupants: string[];
  bedDescription: string;
}

export interface Floor {
  name: string; // "" for single-floor, "RDC", "Étage"
  rooms: Room[];
}

export interface Chalet {
  id: string;
  name: string;
  capacity: number;
  floors: Floor[];
  color: string;
}

export interface AppState {
  chalets: Chalet[];
  people: string[];
  unassigned: string[];
}
