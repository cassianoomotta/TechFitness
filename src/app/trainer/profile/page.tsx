import ProfileSettingsView from "@/components/ProfileSettingsView";

export const metadata = {
  title: "Configurações da Conta | TechFitness Personal",
};

export default function TrainerProfilePage() {
  return <ProfileSettingsView backUrl="/trainer/dashboard" roleLabel="Personal Trainer" />;
}
