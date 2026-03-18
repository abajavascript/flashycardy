"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createDeckForUser, getDecksForUser } from "@/db/queries/decks";

const CreateDeckSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  const { userId, has } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = CreateDeckSchema.parse(input);

  if (has({ feature: "3_deck_limit" })) {
    const existing = await getDecksForUser(userId);
    if (existing.length >= 3) {
      throw new Error(
        "Free plan is limited to 3 decks. Upgrade to Pro for unlimited decks."
      );
    }
  }

  await createDeckForUser(userId, parsed.name, parsed.description);

  revalidatePath("/dashboard");
}
