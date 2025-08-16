"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, Database, Settings } from "lucide-react";
import { toast } from "sonner";
import { INTEGRATIONS } from "@/lib/state";

interface Contact {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  organization: string;
  domain: string;
  linkedIn?: string;
  twitter?: string;
}

interface PushToAttioDialogProps {
  contacts: Contact[];
  disabled?: boolean;
}

export function PushToAttioDialog({
  contacts,
  disabled,
}: PushToAttioDialogProps) {
  const [open, setOpen] = useState(false);

  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handlePushContacts = async () => {
    setIsPushing(true);
    setPushResult(null);

    const chosenIntegration = INTEGRATIONS?.find(
      (inte) => inte.type === "attio"
    );
    try {
      const data = {
        integration: chosenIntegration?.type,
        contacts,
      };

      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resp = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to push to ${chosenIntegration?.name}`);
      }

      setPushResult({
        success: true,
        message: `Successfully pushed ${contacts.length} contacts to ${chosenIntegration?.name}`,
      });
      setIsPushing(false);
    } catch (error) {
      console.log("failed to push to integration", error);
      const errorMessage =
        error instanceof Error
          ? error?.message
          : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          Push to Attio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Push Contacts to Attio CRM</DialogTitle>
          <DialogDescription>
            Connect your Attio workspace and push contacts directly.
          </DialogDescription>
        </DialogHeader>

        {pushResult && (
          <Alert
            className={
              pushResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            {pushResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{pushResult.message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Push Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Contacts:</span>
                <span className="font-medium">{contacts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>With Email:</span>
                <span className="font-medium">
                  {contacts.filter((c) => c.emails.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>With Phone:</span>
                <span className="font-medium">
                  {contacts.filter((c) => c.phones.length > 0).length}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Ready to Push:</span>
                <span>{contacts.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handlePushContacts}
          disabled={contacts.length === 0 || isPushing}
          className="w-full"
        >
          {isPushing ? (
            <>
              <Settings className="h-4 w-4 mr-2 animate-spin" />
              Pushing Contacts...
            </>
          ) : (
            `Push ${contacts.length} Contacts`
          )}
        </Button>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
