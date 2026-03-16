"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDeckById, updateDeck } from "@/db/queries/decks";
import { createCard } from "@/db/queries/cards";

const AddCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

type AddCardInput = z.infer<typeof AddCardSchema>;

export async function addCard(input: AddCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = AddCardSchema.parse(input);

  const deck = await getDeckById(parsed.deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await createCard(parsed.deckId, parsed.front, parsed.back);

  revalidatePath(`/decks/${parsed.deckId}`);
}

const UpdateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;

export async function editDeck(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = UpdateDeckSchema.parse(input);

  const deck = await getDeckById(parsed.deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await updateDeck(parsed.deckId, userId, parsed.name, parsed.description);

  revalidatePath(`/decks/${parsed.deckId}`);
}
