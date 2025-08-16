"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportDialog } from "@/components/common/export-dialog";
import { IntegrationDialog } from "@/components/common/integration-dialog";
import {
  Loader2,
  LinkIcon,
  Users,
  AlertCircle,
  CheckCircle,
  Trash2,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { ContactRow } from "@/components/common/ContactRow";
import { Contact } from "@/types";
import { PushToAttioDialog } from "@/components/common/integrations/push-to-attio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompaniesView } from "@/components/companies-view";

9;

export default function ContactExtractor() {
  const [url, setUrl] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set()
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExtractContacts = async () => {
    if (!url.trim()) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/extract-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract contacts");
      }

      console.log("extracted data", data);

      const mainData = data?.contacts;

      // Check if the expected object structure is present
      const hasImportantData =
        Array.isArray(mainData.emails) || Array.isArray(mainData.phones);

      if (hasImportantData) {
        const companyData: Contact = {
          organization: mainData.organization,
          name: mainData.organization,
          domain: mainData.domain,
          ...(mainData?.linkedIn &&
            mainData?.linkedIn?.length > 0 && {
              linkedIn: mainData.linkedIn[0],
            }),
          ...(mainData?.twitter &&
            mainData?.twitter?.length > 0 && {
              twitter: mainData.twitter[0],
            }),
          emails: mainData.emails || "",
          phones: mainData.phones || "",
          id: "",
        };

        setContacts((prev) => [...prev, companyData]);
        setProcessedUrls((prev) => [...prev, url.trim()]);
        setSuccess(`Successfully extracted data from ${new URL(url).hostname}`);
      } else {
        setError(
          "No contact information found on this page. Try a different URL."
        );
      }

      setUrl("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = () => {
    setContacts([]);
    setProcessedUrls([]);
    setSelectedContacts(new Set());
    setError(null);
    setSuccess(null);
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(contacts.map((c) => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleDeleteSelected = () => {
    setContacts((prev) => prev.filter((c) => !selectedContacts.has(c.id)));
    setSelectedContacts(new Set());
  };

  const getExportContacts = () => {
    if (selectedContacts.size > 0) {
      return contacts.filter((c) => selectedContacts.has(c.id));
    }
    return contacts;
  };
  console.log("contacts", contacts);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Yenkit</h1>
          <p className="text-muted-foreground">
            Extract contact information from web pages for your agency
          </p>
        </div>

        <Tabs defaultValue="extractor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="extractor" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Extractor
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extractor" className="space-y-6">
            {/* Error and Success Alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* URL Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Extract Contacts from URL
                </CardTitle>
                <CardDescription>
                  Paste a webpage URL to extract contact details (name, email,
                  phone, organization)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/about-us"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                    disabled={isProcessing}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleExtractContacts()
                    }
                  />
                  <Button
                    onClick={handleExtractContacts}
                    disabled={!url.trim() || isProcessing}
                    className="min-w-[120px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Extract"
                    )}
                  </Button>
                </div>

                {processedUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Processed URLs:</p>
                    <div className="flex flex-wrap gap-2">
                      {processedUrls.map((processedUrl, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {new URL(processedUrl).hostname}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle>
                      Extracted Contacts ({contacts.length})
                    </CardTitle>
                    {selectedContacts.size > 0 && (
                      <Badge variant="secondary">
                        {selectedContacts.size} selected
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selectedContacts.size > 0 && (
                      <Button
                        variant="outline"
                        onClick={handleDeleteSelected}
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleClearAll}
                      disabled={contacts.length === 0}
                      size="sm"
                    >
                      Clear All
                    </Button>

                    <PushToAttioDialog
                      contacts={getExportContacts()}
                      disabled={contacts.length === 0}
                    />
                    <ExportDialog
                      contacts={getExportContacts()}
                      disabled={contacts.length === 0}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No contacts extracted yet</p>
                    <p className="text-sm">Add a URL above to get started</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                selectedContacts.size === contacts.length
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="w-16">S/N</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Twitter</TableHead>
                          <TableHead>LinkedIn</TableHead>

                          <TableHead>Organization</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.map((contact, index) => (
                          <TableRow key={contact.organization}>
                            <TableCell>
                              <Checkbox
                                checked={selectedContacts.has(contact.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectContact(contact.id, !!checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell>{contact.name}</TableCell>
                            <ContactRow
                              contact={{
                                emails: contact.emails as any,
                                phones: contact.phones as any,
                              }}
                            />
                            <TableCell>
                              <Link
                                className="hover:underline"
                                href={contact.twitter as string}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {contact.twitter}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link
                                className="hover:underline"
                                href={contact.linkedIn as string}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {contact.linkedIn}
                              </Link>
                            </TableCell>
                            <TableCell>{contact.organization}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <CompaniesView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
