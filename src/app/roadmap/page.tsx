import { getAllTopics } from "@/lib/contentLoader";
import RoadmapClient from "./RoadmapClient";

export default function RoadmapPage() {
  const availableTopics = getAllTopics();
  return <RoadmapClient availableTopics={availableTopics} />;
}
