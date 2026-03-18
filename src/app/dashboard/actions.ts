"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createDeckForUser } from "@/db/queries/decks";

const CreateDeckSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = CreateDeckSchema.parse(input);

  await createDeckForUser(userId, parsed.name, parsed.description);

  revalidatePath("/dashboard");
}
