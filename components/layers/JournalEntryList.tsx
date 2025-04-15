/*
Author: Jan Allen Almario
Last Modified by: Jan Allen Almario
Date Last Modified: 2025-04-13
Program Description: This is the Journal Entry List component of the Sentimo app. It displays a list of journal entries with their sentiment, date, and content. If an entry is concerning, it shows an alert icon. The component also handles the selection of entries to view more details.
Revision History:
    0.1 - 2025-04-14: Initial creation.
*/
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export interface JournalEntry {
  id: string;
  content: string;
  date: string;
  sentiment: string;
  isConcerning: boolean;
  aiResponse: string,
  suggestions: { title: string; description: string; icon: string }[];
}

interface JournalEntryListProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
}

export function JournalEntryList({ entries, onSelectEntry }: JournalEntryListProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "neutral":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold text-[#2D3142]">Previous Entries</h2>
      {entries.length === 0 ? (
        <p className="text-[#5D6470]">No previous entries yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <Card 
              key={entry.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectEntry(entry)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <Badge className={getSentimentColor(entry.sentiment)}>
                    {entry.sentiment}
                  </Badge>
                  <span className="text-sm text-[#5D6470]">{entry.date}</span>
                </div>
                <p className="text-[#2D3142] line-clamp-3">{entry.content}</p>
                {entry.isConcerning && (
                  <div className="flex items-center text-amber-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span>Contains concerning content</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}