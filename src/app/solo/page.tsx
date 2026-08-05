import { buildMetadata } from "@/lib/metadata";
import UnderConstruction from "@/views/UnderConstruction";

export const metadata = buildMetadata({
  title: "KITech Software – Relaunch",
  description: "Diese Seite entsteht gerade neu. Sprechen Sie uns direkt an.",
  path: "/solo",
  noindex: true,
});

export default function Page() {
  return <UnderConstruction />;
}
