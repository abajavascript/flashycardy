import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Welcome to{" "}
            <span className="text-blue-400">Flashy Cardy Course</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Master any subject with our interactive flashcard learning system.
            <br />
            Create, study, and track your progress all in one place.
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Get Started Today</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-muted-foreground">
            <p>
              Sign up or sign in to start creating your personalized flashcard
              decks.
            </p>
            <p className="text-sm">
              Click the buttons in the header above to get started! 👆
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
