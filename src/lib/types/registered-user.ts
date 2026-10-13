export interface RegisteredUserItem {
  id: string;
  name: string;
  image: string | null;
  role: "STUDENT";
  createdAt: string;
  trainerName: string | null;
}
