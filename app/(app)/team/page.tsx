import type { Metadata } from "next";
import PaginaTeam from "../../components/team/PaginaTeam";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return <PaginaTeam />;
}
