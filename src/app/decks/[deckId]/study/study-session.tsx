"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Card = {
  id: number;
  front: string;
  back: string;
};

type Deck = {
  id: number;
  name: string;
};

interface StudySessionProps {
  deck: Deck;
  cards: Card[];
}

export function StudySession({ deck, cards }: StudySessionProps) {
  const [shuffledCards, setShuffledCards] = useState<Card[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const shuffleArray = (arr: Card[]) =>
    [...arr].sort(() => Math.random() - 0.5);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  }, []);

  const handleShuffle = useCallback(() => {
    setShuffledCards(shuffleArray(cards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  }, [cards]);

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      setCompleted(true);
    }
  }, [currentIndex, shuffledCards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completed, handleNext, handlePrevious]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-xl font-semibold">No cards in this deck</p>
        <p className="text-muted-foreground text-sm">
          Add some cards before studying.
        </p>
        <Link href={`/decks/${deck.id}`}>
          <Button variant="outline">← Back to deck</Button>
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center max-w-md mx-auto">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold">Session Complete!</h2>
        <p className="text-muted-foreground">
          You&apos;ve reviewed all {shuffledCards.length}{" "}
          {shuffledCards.length === 1 ? "card" : "cards"} in{" "}
          <span className="font-medium text-foreground">{deck.name}</span>.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <Button onClick={handleRestart}>Study Again</Button>
          <Button variant="outline" onClick={handleShuffle}>
            Shuffle &amp; Restart
          </Button>
          <Link href={`/decks/${deck.id}`}>
            <Button variant="outline">← Back to deck</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/decks/${deck.id}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {deck.name}
        </Link>
        <span className="text-sm text-muted-foreground tabular-nums">
          {currentIndex + 1} / {shuffledCards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className="relative h-72 cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={() => setIsFlipped((f) => !f)}
        role="button"
        aria-label={isFlipped ? "Show front" : "Reveal answer"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsFlipped((f) => !f);
          }
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-card p-8 text-center shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Front
            </p>
            <p className="text-2xl font-medium leading-relaxed">
              {currentCard.front}
            </p>
            <p className="mt-8 text-xs text-muted-foreground">
              Click to reveal answer
            </p>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-primary/5 p-8 text-center shadow-sm"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Back
            </p>
            <p className="text-2xl font-medium leading-relaxed">
              {currentCard.back}
            </p>
            <p className="mt-8 text-xs text-muted-foreground">
              Click to flip back
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ← Previous
        </Button>

        <Button variant="ghost" size="sm" onClick={handleShuffle}>
          Shuffle
        </Button>

        <Button onClick={handleNext}>
          {currentIndex === shuffledCards.length - 1 ? "Finish" : "Next →"}
        </Button>
      </div>
    </div>
  );
}
