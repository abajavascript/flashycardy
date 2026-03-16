import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AddCardDialog } from "./add-card-dialog";
import { EditDeckDialog } from "./edit-deck-dialog";

interface DeckPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
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
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
        >
          ← Back to decks
        </Link>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground mt-1">{deck.description}</p>
            )}
            <div className="flex gap-4 mt-2">
              <p className="text-xs text-muted-foreground">
                Created:{" "}
                {deck.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                Updated:{" "}
                {deck.updatedAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <EditDeckDialog
            deckId={deckIdNum}
            initialName={deck.name}
            initialDescription={deck.description}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </p>
          <AddCardDialog deckId={deckIdNum} />
        </div>
      </div>

      {cards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No cards yet
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Add your first card to start studying
            </p>
            <AddCardDialog deckId={deckIdNum} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.id}>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Front
                </CardTitle>
                <CardDescription className="text-base text-foreground">
                  {card.front}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t pt-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Back
                </p>
                <p className="text-base">{card.back}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
