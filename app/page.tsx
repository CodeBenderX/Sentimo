/*
Author: Lorenzo Menil
Last Modified by: Lorenzo Menil
Date Last Modified: 2025-04-13
Program Description: This code implements a client-side journaling interface using React (with Next.js's "use client" directive). The component provides a form where users can submit their journal entry. Once submitted, it sends the entry to an API endpoint, processes the resulting sentiment analysis and AI-generated response, and displays these results with a dynamic UI including badges, cards, and suggested action icons.
Revision History:
    0.1 - 2025-04-13: Initial creation.
    0.2 - 2025-04-13: 
*/

"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircleIcon } from "lucide-react"

// Import icons for suggested actions
import {
  BookOpen,
  Users,
  Music,
  MedalIcon as Meditation,
  Compass,
  Palette,
  Activity,
  TreePine,
  Heart,
  GraduationCap,
} from "lucide-react"

// Interface for suggested actions
interface SuggestedAction {
  title: string
  description: string
  icon: string
}

export default function Home() {
  const [journalEntry, setJournalEntry] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [activeDot, setActiveDot] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [apiConnected, setApiConnected] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [sentiment, setSentiment] = useState("")
  const [error, setError] = useState("")
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const handleSubmit = async () => {
    if (journalEntry.trim()) {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch("/api/journal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ journalEntry }),
        })

        const data = await response.json()

        if (data.success) {
          setAiResponse(data.response)
          setSentiment(data.sentiment || "Neutral")
          setSuggestedActions(data.suggestions || [])
          setApiConnected(true)
        } else {
          setAiResponse(data.fallbackResponse || "I couldn't process your journal entry. Please try again.")
          setError("Failed to connect to LM Studio API")
        }
      } catch (err) {
        console.error("Error submitting journal entry:", err)
        setError("Failed to connect to LM Studio API")
        setAiResponse("I couldn't process your journal entry. Please try again.")
      } finally {
        setIsLoading(false)
        setSubmitted(true)
      }
    }
  }

  const handleNewEntry = () => {
    setJournalEntry("")
    setSubmitted(false)
    setAiResponse("")
    setSentiment("")
    setSuggestedActions([])
    setError("")
  }

  // Handle scroll to update active dot
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return

      const scrollPosition = scrollContainerRef.current.scrollLeft
      const cardWidth = 250 + 12 // card width + gap
      const totalCards = suggestedActions.length || 3

      // Calculate which card is most visible
      const activeIndex = Math.min(Math.floor((scrollPosition + cardWidth / 2) / cardWidth), totalCards - 1)

      setActiveDot(activeIndex)
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
      return () => scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [submitted, suggestedActions])

  // Function to scroll to a specific card when dot is clicked
  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return

    const cardWidth = 250 + 12 // card width + gap
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    })
    setActiveDot(index)
  }

  // Get sentiment badge color
  const getSentimentColor = () => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      case "neutral":
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "reflect":
        return <BookOpen className="w-12 h-12 text-[#05a653]" />
      case "journey":
        return <Compass className="w-12 h-12 text-[#05a653]" />
      case "personalized":
        return <Palette className="w-12 h-12 text-[#05a653]" />
      case "meditate":
        return <Meditation className="w-12 h-12 text-[#05a653]" />
      case "connect":
        return <Users className="w-12 h-12 text-[#05a653]" />
      case "create":
        return <Music className="w-12 h-12 text-[#05a653]" />
      case "move":
        return <Activity className="w-12 h-12 text-[#05a653]" />
      case "nature":
        return <TreePine className="w-12 h-12 text-[#05a653]" />
      case "gratitude":
        return <Heart className="w-12 h-12 text-[#05a653]" />
      case "learn":
        return <GraduationCap className="w-12 h-12 text-[#05a653]" />
      default:
        return <BookOpen className="w-12 h-12 text-[#05a653]" />
    }
  }

  // Default suggested actions
  const defaultSuggestedActions = [
    {
      title: "Gratitude Journal",
      description: "Write down three things you're grateful for to maintain this positive mood",
      icon: "reflect",
    },
    {
      title: "Share Your Joy",
      description: "Consider reaching out to a friend or family member to share your positive feelings",
      icon: "connect",
    },
    {
      title: "Create a Happy Playlist",
      description: "Compile songs that match or enhance your current positive mood",
      icon: "create",
    },
  ]

  // Use suggested actions from API or defaults
  const displayedActions = suggestedActions.length > 0 ? suggestedActions : defaultSuggestedActions

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full animate-gradient-shift bg-gradient-to-br from-[#F9F7D9] via-[#E3F6EF] to-[#F0E6FA] opacity-80"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[#F9F7D9] blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[15%] right-[10%] w-80 h-80 rounded-full bg-[#E3F6EF] blur-3xl animate-float"></div>
        <div className="absolute top-[60%] left-[50%] w-72 h-72 rounded-full bg-[#F0E6FA] blur-3xl animate-pulse-slower"></div>
      </div>

      <main className="relative flex min-h-screen flex-col items-center justify-center py-12 px-4">
        

        <Card className="w-full max-w-2xl border-none shadow-lg">
          {!submitted ? (
            <>
              <CardHeader className="pb-0">
                <Badge variant="outline" className="px-4 py-2 font-normal w-fit">
                  Hello, How are you today?
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  placeholder="Write your thoughts here..."
                  className="min-h-[200px] resize-none border-[#E2E8F0] focus:border-[#05a653] focus:ring-[#05a653] bg-white"
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-[#5D6470] text-[14px]">{currentDate}</span>
                <Button
                  variant="default"
                  className="rounded-full px-6"
                  onClick={handleSubmit}
                  disabled={!journalEntry.trim() || isLoading}
                >
                  {isLoading ? "Processing..." : "Submit"}
                </Button>
              </CardFooter>
            </>
          ) : (
            <>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h2 className="font-medium text-[#2D3142] mb-2">Your entry</h2>
                  <Card className="bg-white rounded-[18px] bg-[#F9F6F3] border-noneborder-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <p>{journalEntry}</p>
                        {sentiment && <Badge className={`ml-2 ${getSentimentColor()}`}>{sentiment}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h2 className="font-medium text-[#2D3142] mb-2">Response</h2>
                  <Card className="bg-white rounded-[18px] bg-[#F9F6F3] border-none shadow-sm">
                    <CardContent className="p-4">
                      <p>{aiResponse || "I'm glad to hear from you today! How can I help support you?"}</p>
                    </CardContent>
                  </Card>
                </div>

                
              </CardContent>

              <CardFooter className="flex justify-between">
                <span className="text-[#5D6470] text-[14px]">{currentDate}</span>
                <Button variant="default" className="rounded-full px-6" onClick={handleNewEntry}>
                  Write new entry
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        
      </main>
    </div>
  )
}
