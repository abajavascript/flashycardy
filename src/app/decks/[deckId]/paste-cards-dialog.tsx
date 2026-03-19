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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { pasteCards } from "./actions";

interface PasteCardsDialogProps {
  deckId: number;
}

interface ParseResult {
  valid: { front: string; back: string }[];
  processed: number;
  skipped: number;
}

interface Summary {
  processed: number;
  added: number;
  skipped: number;
}

function parseText(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  const valid: { front: string; back: string }[] = [];
  let skipped = 0;

  for (const line of nonEmpty) {
    // Split by tab or pipe, trim each part, drop empty segments
    // This handles leading/trailing pipes (Markdown-style tables) and tab-separated values
    const parts = line
      .split(/[\t|]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const front = parts[0] ?? "";
    const back = parts[1] ?? "";

    if (front && back) {
      valid.push({ front, back });
    } else {
      skipped++;
    }
  }

  return { valid, processed: nonEmpty.length, skipped };
}

export function PasteCardsDialog({ deckId }: PasteCardsDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(value: boolean) {
    if (!isPending) {
      setOpen(value);
      if (!value) {
        setText("");
        setError(null);
        setSummary(null);
      }
    }
  }

  function handleTabKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = text.substring(0, start) + "\t" + text.substring(end);
    setText(next);
    // restore cursor after React re-renders
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 1;
    });
  }

  function handleImport() {
    setError(null);

    const { valid, processed, skipped } = parseText(text);

    if (valid.length === 0) {
      setError(
        "No valid cards found. Each row needs a front and back separated by a tab or |."
      );
      return;
    }

    startTransition(async () => {
      try {
        await pasteCards({ deckId, cards: valid });
        setSummary({ processed, added: valid.length, skipped });
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" className="text-yellow-400" />}>
        Paste Cards
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Paste Cards</DialogTitle>
        </DialogHeader>

        {summary ? (
          <div className="py-2 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Import complete. Here&apos;s a summary:
            </p>
            <div className="rounded-lg border divide-y">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">Processed rows</span>
                <span className="text-sm tabular-nums">{summary.processed}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Added
                </span>
                <span className="text-sm tabular-nums text-green-600 dark:text-green-400">
                  {summary.added}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Skipped
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {summary.skipped}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="paste-area">Table data</Label>
              <Textarea
                id="paste-area"
                placeholder={
                  "Paste from Excel or enter manually.\n" +
                  "Separators: Tab or |  (leading/trailing pipes are ignored)\n\n" +
                  "achieve\tдосягати\n" +
                  "| achieve | досягати |\n" +
                  "achieve | досягати"
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleTabKey}
                disabled={isPending}
                rows={10}
                className="font-mono text-sm resize-y"
              />
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground -mt-2">
              Separators: Tab (press Tab to insert) or <code className="font-mono">|</code>.
              Leading/trailing pipes and empty columns are ignored.
              Rows with fewer than two values will be skipped.
            </p>
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
              <Button
                type="button"
                onClick={handleImport}
                disabled={isPending || !text.trim()}
              >
                {isPending ? "Importing…" : "Import"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
