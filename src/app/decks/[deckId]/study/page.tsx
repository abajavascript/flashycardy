import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { StudySession } from "./study-session";

interface StudyPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { deckId } = await params;
  const deckIdNum = Number(deckId);

  if (isNaN(deckIdNum)) {
    notFound();
  }

  const [deck, cards] = await Promise.all([
    getDeckById(deckIdNum, userId),
    getCardsByDeckId(deckIdNum),
  ]);

  if (!deck) {
    notFound();
  }

  return (
    <main className="container mx-auto px-6 py-10">
      <StudySession deck={deck} cards={cards} />
    </main>
  );
}
