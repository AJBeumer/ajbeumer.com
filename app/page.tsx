import { getAllContent } from "@/lib/contentLoader";
import Terminal from "@/components/Terminal";

export default function Home() {
  const content = getAllContent();
  return <Terminal content={content} />;
}
