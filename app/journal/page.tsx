/*
Author: Angelo Tiquio and Allen Almario
Last Modified by: Angelo Tiquioo
Date Last Modified: 2025-04-14
Program Description: This fetches the journal entries from local storage and displays them in a list. When an entry is clicked, it opens a modal with the entry details, including the AI response and suggested actions. The suggested actions are displayed with icons and descriptions. For enhancement, we can use database instead of local storage for better data management and retrieval.
Revision History:
    0.1 - 2025-04-14: Initial creation.
*/
"use client"

import { useState, useEffect } from "react"
import { JournalEntryList, JournalEntry } from "@/components/layers/JournalEntryList"
import { MainNav } from "@/components/layers/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, BookOpen, Compass, Palette, EditIcon, Users, Music, Activity, TreePine, Heart, GraduationCap } from "lucide-react"

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [journalEntry, setJournalEntry] = useState<string>("")
  const [sentiment, setSentiment] = useState<string>("")
  const [isConcerning, setIsConcerning] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [aiResponse, setAiResponse] = useState<string>("")
  const [suggestedActions, setSuggestedActions] = useState<{ title: string; description: string; icon: string }[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem("journalEntries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [])

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const migrateOldEntries = (entries: any[]): JournalEntry[] => {
    return entries.map(entry => ({
      ...entry,
      aiResponse: entry.aiResponse || "No response saved with this entry",
      suggestions: entry.suggestions || []
    }));
  };

  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        setEntries(migrateOldEntries(parsed));
      } catch (e) {
        console.error("Failed to parse saved entries", e);
      }
    }
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "reflect":
        return <BookOpen className="w-12 h-12 text-[#05a653]" />;
      case "journey":
        return <Compass className="w-12 h-12 text-[#05a653]" />;
      case "personalized":
        return <Palette className="w-12 h-12 text-[#05a653]" />;
      case "meditate":
        return <EditIcon className="w-12 h-12 text-[#05a653]" />;
      case "connect":
        return <Users className="w-12 h-12 text-[#05a653]" />;
      case "create":
        return <Music className="w-12 h-12 text-[#05a653]" />;
      case "move":
        return <Activity className="w-12 h-12 text-[#05a653]" />;
      case "nature":
        return <TreePine className="w-12 h-12 text-[#05a653]" />;
      case "gratitude":
        return <Heart className="w-12 h-12 text-[#05a653]" />;
      case "learn":
        return <GraduationCap className="w-12 h-12 text-[#05a653]" />;
      default:
        return <BookOpen className="w-12 h-12 text-[#05a653]" />;
    }
  };

  return (
    <>
      <MainNav />
      <div className="h-[100vh] flex justify-center overflow-hidden inset-0 animate-gradient-shift bg-gradient-to-br from-[#F9F7D9] via-[#E3F6EF] to-[#F0E6FA] opacity-80">
        <main className="container py-8 px-4 max-w-4xl h-full">
          <h1 className="text-2xl font-bold mb-6 text-[#2D3142] text-center">Your Journal Entries</h1>
          <div className="h-[calc(100%-4rem)] overflow-y-auto">
            <JournalEntryList 
              entries={entries} 
              onSelectEntry={handleSelectEntry}
            />

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                {selectedEntry && (
                  <>
                    <DialogHeader>
                      <div className="flex justify-between items-center">
                        <DialogTitle>Journal Entry</DialogTitle>
                        <span className="text-sm text-[#5D6470]">{selectedEntry.date}</span>
                      </div>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className={selectedEntry.sentiment === 'positive' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedEntry.sentiment === 'negative' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'}>
                          {selectedEntry.sentiment}
                        </Badge>
                        {selectedEntry.isConcerning && (
                          <div className="flex items-center text-amber-600 text-sm">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span>Contains concerning content</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Your Entry</h3>
                          <p className="text-[#2D3142]">{selectedEntry.content}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">AI Response</h3>
                          <p className="text-[#2D3142]">{selectedEntry.aiResponse}</p>
                        </div>

                        {selectedEntry.suggestions?.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-4">Suggested Actions</h3>
                            <div className="space-y-6"> {/* Changed from space-y-3 to space-y-6 */}
                              {selectedEntry.suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="w-full bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-md transition-shadow" /* Changed p-4 to p-6 */
                                >
                                  <div className="flex items-center gap-3 mb-4"> {/* Changed mb-3 to mb-4 */}
                                    {getIconComponent(suggestion.icon)}
                                    <h4 className="font-medium text-[#2D3142]">
                                      {suggestion.title}
                                    </h4>
                                  </div>
                                  <p className="text-[#5D6470] text-sm">
                                    {suggestion.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </>
  )
}