import ProfileSettingsView from "@/components/ProfileSettingsView";

export const metadata = {
  title: "Minha Conta | TechFitness",
};

export default function StudentProfilePage() {
  return <ProfileSettingsView backUrl="/student/dashboard" roleLabel="Atleta" />;
}
