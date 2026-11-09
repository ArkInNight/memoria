/** A game account owned by the current browser user. Data is isolated per profile. */
export interface Profile {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
  archivedAt?: string;
}
