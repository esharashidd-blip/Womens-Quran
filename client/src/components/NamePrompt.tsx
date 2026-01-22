import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface NamePromptProps {
  onComplete: () => void;
}

export function NamePrompt({ onComplete }: NamePromptProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const firstName = name.trim().split(/\s+/)[0]; // Only first word
    if (!firstName) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: firstName }
      });

      if (error) {
        console.error("Supabase error:", error);
      }

      // Always close on attempt (name is optional)
      onComplete();
    } catch (err) {
      console.error("Failed to save name:", err);
      onComplete(); // Close anyway
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-background p-6 rounded-3xl space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif text-foreground">Assalamu Alaikum</h2>
          <p className="text-muted-foreground text-sm">What should we call you?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl text-center text-lg"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full h-12 rounded-xl"
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? "Saving..." : "Continue"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
