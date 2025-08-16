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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, FileSpreadsheet, Code } from "lucide-react";

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

interface ExportDialogProps {
  contacts: Contact[];
  disabled?: boolean;
}

type ExportFormat = "csv" | "json" | "xlsx";

interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  selectedFields: string[];
  filename: string;
  filterByOrganization: string;
  onlyWithEmail: boolean;
  onlyWithPhone: boolean;
}

export function ExportDialog({
  contacts,
  disabled = false,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: "csv",
    includeHeaders: true,
    selectedFields: ["name", "email", "phone", "organization"],
    filename: `contacts-${new Date().toISOString().split("T")[0]}`,
    filterByOrganization: "",
    onlyWithEmail: false,
    onlyWithPhone: false,
  });

  const availableFields = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "organization", label: "Organization" },
  ];

  const organizations = [
    ...new Set(contacts.map((c) => c.organization).filter(Boolean)),
  ];

  const getFilteredContacts = () => {
    let filtered = [...contacts];

    if (options.filterByOrganization) {
      filtered = filtered.filter(
        (c) => c.organization === options.filterByOrganization
      );
    }

    if (options.onlyWithEmail) {
      filtered = filtered.filter((c) => c.emails);
    }

    if (options.onlyWithPhone) {
      filtered = filtered.filter((c) => c.phones);
    }

    return filtered;
  };

  const handleExport = () => {
    const filteredContacts = getFilteredContacts();

    if (filteredContacts.length === 0) {
      alert("No contacts match the selected filters.");
      return;
    }

    switch (options.format) {
      case "csv":
        exportAsCSV(filteredContacts);
        break;
      case "json":
        exportAsJSON(filteredContacts);
        break;
      case "xlsx":
        exportAsXLSX(filteredContacts);
        break;
    }

    setOpen(false);
  };

  const exportAsCSV = (data: Contact[]) => {
    const headers = options.selectedFields.map(
      (field) => availableFields.find((f) => f.id === field)?.label || field
    );

    const rows = data.map((contact, index) => {
      const row: string[] = [];

      // Add serial number if required
      if (options.selectedFields.includes("sn")) {
        row.push((index + 1).toString());
      }

      options.selectedFields.forEach((field) => {
        if (field !== "sn") {
          const value = contact[field as keyof Contact];

          if (Array.isArray(value)) {
            row.push(value.join(", ")); // flatten arrays
          } else if (value !== undefined && value !== null) {
            row.push(String(value)); // ensure it's a string
          } else {
            row.push(""); // empty if missing
          }
        }
      });

      return row.map((field) => `"${field}"`).join(",");
    });

    let csvContent = "";
    if (options.includeHeaders) {
      const headerRow = ["S/N", ...headers].join(",");
      csvContent = headerRow + "\n";
    }
    csvContent += rows.join("\n");

    downloadFile(csvContent, `${options.filename}.csv`, "text/csv");
  };

  const exportAsJSON = (data: Contact[]) => {
    const exportData = data.map((contact, index) => {
      const item: any = {};
      if (options.selectedFields.includes("sn")) {
        item.sn = index + 1;
      }
      options.selectedFields.forEach((field) => {
        if (field !== "sn") {
          item[field] = contact[field as keyof Contact] || "";
        }
      });
      return item;
    });

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `${options.filename}.json`, "application/json");
  };

  const exportAsXLSX = (data: Contact[]) => {
    const headers = [
      "S/N",
      ...options.selectedFields.map(
        (field) => availableFields.find((f) => f.id === field)?.label || field
      ),
    ];

    const rows = data.map((contact, index) => {
      const row: string[] = [String(index + 1)];
      options.selectedFields.forEach((field) => {
        if (field !== "sn") {
          const value = contact[field as keyof Contact];

          // Handle arrays and undefined safely
          if (Array.isArray(value)) {
            row.push(value.join(", ")); // join arrays
          } else if (value !== undefined && value !== null) {
            row.push(String(value)); // stringify everything else
          } else {
            row.push(""); // empty if missing
          }
        }
      });
      return row.join("\t");
    });

    const xlsxContent = [headers.join("\t"), ...rows].join("\n");
    downloadFile(
      xlsxContent,
      `${options.filename}.xlsx`,
      "application/vnd.ms-excel"
    );
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredCount = getFilteredContacts().length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Contacts</DialogTitle>
          <DialogDescription>
            Configure your export settings and download your contact data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select
              value={options.format}
              onValueChange={(value: ExportFormat) =>
                setOptions((prev) => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV (Comma Separated)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    JSON (JavaScript Object)
                  </div>
                </SelectItem>
                <SelectItem value="xlsx">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (XLSX)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fields Selection */}
          <div className="space-y-2">
            <Label>Fields to Export</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={options.selectedFields.includes(field.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setOptions((prev) => ({
                          ...prev,
                          selectedFields: [...prev.selectedFields, field.id],
                        }));
                      } else {
                        setOptions((prev) => ({
                          ...prev,
                          selectedFields: prev.selectedFields.filter(
                            (f) => f !== field.id
                          ),
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={field.id} className="text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Filters */}
          <div className="space-y-4">
            <Label>Filters</Label>

            {organizations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Filter by Organization</Label>
                <Select
                  value={options.filterByOrganization}
                  onValueChange={(value) =>
                    setOptions((prev) => ({
                      ...prev,
                      filterByOrganization: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All organizations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All organizations</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org} value={org}>
                        {org}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onlyWithEmail"
                  checked={options.onlyWithEmail}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({
                      ...prev,
                      onlyWithEmail: !!checked,
                    }))
                  }
                />
                <Label htmlFor="onlyWithEmail" className="text-sm">
                  Only contacts with email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onlyWithPhone"
                  checked={options.onlyWithPhone}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({
                      ...prev,
                      onlyWithPhone: !!checked,
                    }))
                  }
                />
                <Label htmlFor="onlyWithPhone" className="text-sm">
                  Only contacts with phone
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Filename */}
          <div className="space-y-2">
            <Label>Filename</Label>
            <Input
              value={options.filename}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, filename: e.target.value }))
              }
              placeholder="contacts-export"
            />
          </div>

          {/* Export Summary */}
          <div className="text-sm text-muted-foreground">
            {filteredCount} of {contacts.length} contacts will be exported
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={options.selectedFields.length === 0}
          >
            Export {filteredCount} Contacts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
