"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addCard } from "./actions";

interface AddCardDialogProps {
  deckId: number;
}

export function AddCardDialog({ deckId }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(value: boolean) {
    if (!isPending) {
      setOpen(value);
      if (!value) {
        setFront("");
        setBack("");
        setError(null);
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await addCard({ deckId, front: front.trim(), back: back.trim() });
        setOpen(false);
        setFront("");
        setBack("");
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>Add Card</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="front">Front</Label>
            <Input
              id="front"
              placeholder="Question or term"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              disabled={isPending}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="back">Back</Label>
            <Textarea
              id="back"
              placeholder="Answer or definition"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              disabled={isPending}
              required
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !front.trim() || !back.trim()}>
              {isPending ? "Adding…" : "Add Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
