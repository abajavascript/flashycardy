"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDeckById, updateDeck, deleteDeck } from "@/db/queries/decks";
import { createCard, createCards, updateCard, deleteCard } from "@/db/queries/cards";

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

const PasteCardsSchema = z.object({
  deckId: z.number().int().positive(),
  cards: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
      })
    )
    .min(1, "No valid cards to import"),
});

type PasteCardsInput = z.infer<typeof PasteCardsSchema>;

export async function pasteCards(input: PasteCardsInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = PasteCardsSchema.parse(input);

  const deck = await getDeckById(parsed.deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await createCards(parsed.deckId, parsed.cards);

  revalidatePath(`/decks/${parsed.deckId}`);

  return { added: parsed.cards.length };
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

const EditCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

type EditCardInput = z.infer<typeof EditCardSchema>;

export async function editCard(input: EditCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = EditCardSchema.parse(input);

  const deck = await getDeckById(parsed.deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await updateCard(parsed.cardId, { front: parsed.front, back: parsed.back });

  revalidatePath(`/decks/${parsed.deckId}`);
}

const DeleteCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
});

type DeleteCardInput = z.infer<typeof DeleteCardSchema>;

export async function removeCard(input: DeleteCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = DeleteCardSchema.parse(input);

  const deck = await getDeckById(parsed.deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await deleteCard(parsed.cardId);

  revalidatePath(`/decks/${parsed.deckId}`);
}

const DeleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

type DeleteDeckInput = z.infer<typeof DeleteDeckSchema>;

export async function removeDeck(input: DeleteDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = DeleteDeckSchema.parse(input);

  const deck = await getDeckById(parsed.deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await deleteDeck(parsed.deckId, userId);

  redirect("/dashboard");
}
