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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Database,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

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

interface IntegrationDialogProps {
  contacts: Contact[];
  disabled?: boolean;
}

interface Integration {
  id: string;
  name: string;
  type: "attio" | "notion" | "airtable" | "webhook";
  status: "connected" | "disconnected" | "error";
  config: Record<string, any>;
}

export function IntegrationDialog({
  contacts,
  disabled = false,
}: IntegrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Attio CRM",
      type: "attio",
      status: "disconnected",
      config: {},
    },
    {
      id: "2",
      name: "Notion Database",
      type: "notion",
      status: "disconnected",
      config: {},
    },
    {
      id: "3",
      name: "Airtable Base",
      type: "airtable",
      status: "disconnected",
      config: {},
    },
  ]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Mock configuration forms for different integrations
  const [attioConfig, setAttioConfig] = useState({
    apiKey: "",
    workspaceId: "",
  });

  const [notionConfig, setNotionConfig] = useState({
    token: "",
    databaseId: "",
  });

  const [airtableConfig, setAirtableConfig] = useState({
    apiKey: "",
    baseId: "",
    tableId: "",
  });

  const [webhookConfig, setWebhookConfig] = useState({
    url: "",
    method: "POST",
    headers: "{}",
  });

  const handleConnect = async (integrationType: string) => {
    setIsConnecting(true);

    // Mock connection process
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.type === integrationType
            ? { ...integration, status: "connected" as const }
            : integration
        )
      );
      setIsConnecting(false);
    }, 2000);
  };

  const handlePushContacts = async () => {
    if (!selectedIntegration || contacts.length === 0) return;

    setIsPushing(true);
    setPushResult(null);

    const chosenIntegration = integrations?.find(
      (inte) => inte.id === selectedIntegration
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
        throw new Error(`Failed to push to ${selectedIntegration}`);
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

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "attio":
        return <Database className="h-4 w-4" />;
      case "notion":
        return <FileText className="h-4 w-4" />;
      case "airtable":
        return <Database className="h-4 w-4" />;
      case "webhook":
        return <Zap className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Connected
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Integrations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>External Integrations</DialogTitle>
          <DialogDescription>
            Connect and push your extracted contacts to external services.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Manage Integrations</TabsTrigger>
            <TabsTrigger value="push">Push Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-4">
            <div className="grid gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIntegrationIcon(integration.type)}
                        <CardTitle className="text-base">
                          {integration.name}
                        </CardTitle>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {integration.type === "attio" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="attio-api-key">API Key</Label>
                          <Input
                            disabled
                            id="attio-api-key"
                            type="password"
                            defaultValue={"yenkoatioapikey"}
                            placeholder="Enter your Attio API key"
                            value={attioConfig.apiKey}
                            onChange={(e) =>
                              setAttioConfig((prev) => ({
                                ...prev,
                                apiKey: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="attio-workspace">
                            Workspace ID (optional)
                          </Label>
                          <Input
                            disabled
                            id="attio-workspace"
                            placeholder="Enter your workspace ID"
                            value={attioConfig.workspaceId}
                            onChange={(e) =>
                              setAttioConfig((prev) => ({
                                ...prev,
                                workspaceId: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    {integration.type === "notion" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="notion-token">
                            Integration Token
                          </Label>
                          <Input
                            id="notion-token"
                            type="password"
                            placeholder="Enter your Notion integration token"
                            value={notionConfig.token}
                            onChange={(e) =>
                              setNotionConfig((prev) => ({
                                ...prev,
                                token: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notion-database">Database ID</Label>
                          <Input
                            id="notion-database"
                            placeholder="Enter your database ID"
                            value={notionConfig.databaseId}
                            onChange={(e) =>
                              setNotionConfig((prev) => ({
                                ...prev,
                                databaseId: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    {integration.type === "airtable" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="airtable-api-key">API Key</Label>
                          <Input
                            id="airtable-api-key"
                            type="password"
                            placeholder="Enter your Airtable API key"
                            value={airtableConfig.apiKey}
                            onChange={(e) =>
                              setAirtableConfig((prev) => ({
                                ...prev,
                                apiKey: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="airtable-base">Base ID</Label>
                          <Input
                            id="airtable-base"
                            placeholder="Enter your base ID"
                            value={airtableConfig.baseId}
                            onChange={(e) =>
                              setAirtableConfig((prev) => ({
                                ...prev,
                                baseId: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="airtable-table">Table ID</Label>
                          <Input
                            id="airtable-table"
                            placeholder="Enter your table ID"
                            value={airtableConfig.tableId}
                            onChange={(e) =>
                              setAirtableConfig((prev) => ({
                                ...prev,
                                tableId: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => handleConnect(integration.type)}
                      disabled={
                        integration.status === "connected" || isConnecting
                      }
                      className="w-full"
                    >
                      {isConnecting
                        ? "Connecting..."
                        : integration.status === "connected"
                        ? "Connected"
                        : "Connect"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="push" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Integration</Label>
                <Select
                  value={selectedIntegration}
                  onValueChange={setSelectedIntegration}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an integration" />
                  </SelectTrigger>
                  <SelectContent>
                    {integrations
                      .filter((i) => i.status === "connected")
                      .map((integration) => (
                        <SelectItem key={integration.id} value={integration.id}>
                          <div className="flex items-center gap-2">
                            {getIntegrationIcon(integration.type)}
                            {integration.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

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
                        {contacts.filter((c) => c.emails).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>With Phone:</span>
                      <span className="font-medium">
                        {contacts.filter((c) => c.phones).length}
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
                disabled={
                  !selectedIntegration || contacts.length === 0 || isPushing
                }
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
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
