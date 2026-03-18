import { db } from "@/db";
import { cardsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getCardsByDeckId(deckId: number) {
  return db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
}

export async function createCard(
  deckId: number,
  front: string,
  back: string
) {
  return db.insert(cardsTable).values({ deckId, front, back });
}

export async function updateCard(
  cardId: number,
  data: { front: string; back: string }
) {
  return db
    .update(cardsTable)
    .set({ front: data.front, back: data.back, updatedAt: new Date() })
    .where(eq(cardsTable.id, cardId));
}

export async function deleteCard(cardId: number) {
  return db.delete(cardsTable).where(eq(cardsTable.id, cardId));
}
