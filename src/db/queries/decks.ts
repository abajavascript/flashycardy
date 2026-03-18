import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getDecksForUser(userId: string) {
  return db.select().from(decksTable).where(eq(decksTable.userId, userId));
}

export async function getDeckById(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
  return deck ?? null;
}

export async function createDeckForUser(
  userId: string,
  name: string,
  description?: string
) {
  await db.insert(decksTable).values({ userId, name, description });
}

export async function updateDeck(
  deckId: number,
  userId: string,
  name: string,
  description?: string
) {
  await db
    .update(decksTable)
    .set({ name, description, updatedAt: new Date() })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
}

export async function deleteDeck(deckId: number, userId: string) {
  await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
}
