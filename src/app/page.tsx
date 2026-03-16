import { SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">Flashy Cardy</h1>
        <p className="text-xl text-muted-foreground">Your personal flashcard platform</p>
        <Show when="signed-out">
          <div className="flex items-center gap-3 mt-2">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button variant="secondary">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <Button>Sign Up</Button>
            </SignUpButton>
          </div>
        </Show>
      </div>
    </main>
  );
}
