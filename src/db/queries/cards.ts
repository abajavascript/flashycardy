import { db } from "@/db";
import { cardsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCardsByDeckId(deckId: number) {
  return db.select().from(cardsTable).where(eq(cardsTable.deckId, deckId));
}

export async function createCard(
  deckId: number,
  front: string,
  back: string
) {
  return db.insert(cardsTable).values({ deckId, front, back });
}
