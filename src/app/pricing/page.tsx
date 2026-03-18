import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-foreground mb-3">Pricing</h1>
        <p className="text-muted-foreground text-lg">
          Choose the plan that works best for you.
        </p>
      </div>
      <PricingTable />
    </div>
  );
}
