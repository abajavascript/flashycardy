import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDecksForUser } from "@/db/queries/decks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const decks = await getDecksForUser(userId);

  return (
    <main className="container mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your flashcard decks
          </p>
        </div>
        <Button>New Deck</Button>
      </div>

      {decks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No decks yet
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first deck to get started
            </p>
            <Button>Create a Deck</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`} className="block">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent>
                  <div className="mb-2">
                    <span className="block font-semibold truncate">
                      {deck.name}
                    </span>
                    {deck.description && (
                      <span className="block text-sm text-muted-foreground line-clamp-2">
                        {deck.description}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(deck.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
