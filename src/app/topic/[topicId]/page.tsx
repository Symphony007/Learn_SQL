import { notFound } from "next/navigation";
import { getTopicById } from "@/lib/contentLoader";
import TopicPageClient from "./TopicPageClient";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default async function TopicDetailPage({ params }: PageProps) {
  const { topicId } = await params;
  const topic = getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  return <TopicPageClient topic={topic} />;
}
