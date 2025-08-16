"use client";

import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Contact {
  emails?: string[];
  phones?: string[];
}

const truncateClass = "block max-w-[200px] truncate";

export function ContactRow({ contact }: { contact: Contact }) {
  const renderArrayCell = (items?: string[]) => {
    if (!items || items.length === 0) return <TableCell>-</TableCell>;

    return (
      <TableCell>
        <TooltipProvider>
          {items.map((item, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <span className={truncateClass}>{item}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </TableCell>
    );
  };

  return (
    <>
      {renderArrayCell(contact.emails)}
      {renderArrayCell(contact.phones)}
    </>
  );
}
