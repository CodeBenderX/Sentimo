/*
Author: Lorenzo Menil
Last Modified by: Lorenzo Menil, Bianca Salunga, 
Date Last Modified: 2025-04-13
Program Description: This code implements a client-side journaling interface using React (with Next.js's "use client" directive). The component provides a form where users can submit their journal entry. Once submitted, it sends the entry to an API endpoint, processes the resulting sentiment analysis and AI-generated response, and displays these results with a dynamic UI including badges, cards, and suggested action icons.
Revision History:
    0.1 - 2025-04-13: Initial creation.
    0.2 - 2025-04-13: feat: Recommendations/suggested actions
    0.3 - 2025-04-13: feat: Sentiment emojis and GIFs, enhance journal entry responses
    0.4 - 2025-04-13: feat: Added Detection of concerning content with immediate feedback and added support resources.
  
*/

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircleIcon, AlertTriangle, Phone, Globe } from "lucide-react";
import Image from "next/image";

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
} from "lucide-react";

// Interface for suggested actions
interface SuggestedAction {
  title: string;
  description: string;
  icon: string;
}

// Interface for mental health resources
interface MentalHealthResource {
  message: string;
  hotlines: Array<{
    name: string;
    phone: string;
    website: string;
  }>;
  advice: string;
}

export default function Home() {
  const [journalEntry, setJournalEntry] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [error, setError] = useState("");
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>(
    []
  );
  const [isConcerning, setIsConcerning] = useState(false);
  const [resources, setResources] = useState<MentalHealthResource | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Function to detect concerning content on the frontend
  const detectConcerningContent = (text: string): boolean => {
    const concerningPatterns = [
      // Suicidal thoughts
      /\b(suicid(e|al)|kill (myself|me)|end (my|this) life|don't want to (live|be alive)|take my (own )?life)\b/i,
      // Self-harm
      /\b(cut(ting)? myself|harm(ing)? myself|hurt(ing)? myself|self[- ]harm)\b/i,
      // Severe depression indicators
      /\b(no reason to live|better off dead|can't go on|give up on life|no way out)\b/i,
      // Direct statements
      /\b(want to die|planning to die|going to end it|saying goodbye|final note|last message)\b/i,
      // Additional patterns
      /\b(i want to die|i'm going to die|scared of dying|feel like i'm going to die)\b/i,
      // Violent thoughts toward others
      /\b(kill you|want to kill|going to kill)\b/i,
    ];

    return concerningPatterns.some((pattern) => pattern.test(text));
  };

  // Check for concerning content as user types
  useEffect(() => {
    if (journalEntry.trim()) {
      const isConcerningEntry = detectConcerningContent(journalEntry);
      setShowWarning(isConcerningEntry);
    } else {
      setShowWarning(false);
    }
  }, [journalEntry]);

  const handleSubmit = async () => {
    if (journalEntry.trim()) {
      setIsLoading(true);
      setError("");
      setIsConcerning(false);
      setResources(null);

      try {
        const response = await fetch("/api/journal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ journalEntry }),
        });

        const data = await response.json();

        if (data.success) {
          setAiResponse(data.response);
          setSentiment(data.sentiment || "Balanced");
          setSuggestedActions(data.suggestions || []);
          setIsConcerning(data.is_concerning || false);
          setResources(data.resources || null);
          setApiConnected(true);
        } else {
          setAiResponse(
            data.fallbackResponse ||
              "I couldn't process your journal entry. Please try again."
          );
          setError("Failed to connect to LM Studio API");
        }
      } catch (err) {
        console.error("Error submitting journal entry:", err);
        setError("Failed to connect to LM Studio API");
        setAiResponse(
          "I couldn't process your journal entry. Please try again."
        );
      } finally {
        setIsLoading(false);
        setSubmitted(true);
      }
    }
  };

  const handleNewEntry = () => {
    setJournalEntry("");
    setSubmitted(false);
    setAiResponse("");
    setSentiment("");
    setSuggestedActions([]);
    setIsConcerning(false);
    setResources(null);
    setError("");
    setShowWarning(false);
  };

  // Handle scroll to update active dot
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const cardWidth = 250 + 12; // card width + gap
      const totalCards = suggestedActions.length || 3;

      // Calculate which card is most visible
      const activeIndex = Math.min(
        Math.floor((scrollPosition + cardWidth / 2) / cardWidth),
        totalCards - 1
      );

      setActiveDot(activeIndex);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [submitted, suggestedActions]);

  // Function to scroll to a specific card when dot is clicked
  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;

    const cardWidth = 250 + 12; // card width + gap
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setActiveDot(index);
  };

  // Get sentiment badge color
  const getSentimentColor = () => {
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

  //emojis for sentiment
  const getSentimentEmoji = () => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "Feeling great! 😊"; // or "👍" or "😄"
      case "negative":
        return "Not a good day 😞"; // or "👎" or "😠"
      case "neutral":
      default:
        return "Just okay 🤔"; // or "😐"
    }
  };

  //GIF for sentiments
  const getSentimentGif = () => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return (
          <picture>
            <source
              srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/263a_fe0f/512.webp"
              type="image/webp"
            />
            <img
              src="https://fonts.gstatic.com/s/e/notoemoji/latest/263a_fe0f/512.gif"
              alt="☺"
              width="32"
              height="32"
              className="inline-block align-middle"
            />
          </picture>
        );
      case "negative":
        return (
          <picture>
            <source
              srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f61e/512.webp"
              type="image/webp"
            />
            <img
              src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f61e/512.gif"
              alt="☺"
              width="32"
              height="32"
              className="inline-block align-middle"
            />
          </picture>
        );
      case "neutral":
      default:
        return (
          <picture>
            <source
              srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/512.webp"
              type="image/webp"
            />
            <img
              src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/512.gif"
              alt="☺"
              width="32"
              height="32"
              className="inline-block align-middle"
            />
          </picture>
        );
    }
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "reflect":
        return <BookOpen className="w-12 h-12 text-[#05a653]" />;
      case "journey":
        return <Compass className="w-12 h-12 text-[#05a653]" />;
      case "personalized":
        return <Palette className="w-12 h-12 text-[#05a653]" />;
      case "meditate":
        return <Meditation className="w-12 h-12 text-[#05a653]" />;
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

  // Default suggested actions
  const defaultSuggestedActions = [
    {
      title: "Gratitude Journal",
      description:
        "Write down three things you're grateful for to maintain this positive mood",
      icon: "reflect",
    },
    {
      title: "Share Your Joy",
      description:
        "Consider reaching out to a friend or family member to share your positive feelings",
      icon: "connect",
    },
    {
      title: "Create a Happy Playlist",
      description:
        "Compile songs that match or enhance your current positive mood",
      icon: "create",
    },
  ];

  // Default mental health resources
  const defaultResources = {
    message:
      "We've noticed some concerning content in your journal entry. Please remember that help is available.",
    hotlines: [
      {
        name: "National Suicide Prevention Lifeline",
        phone: "988 or 1-800-273-8255",
        website: "https://suicidepreventionlifeline.org/",
      },
      {
        name: "Crisis Text Line",
        phone: "Text HOME to 741741",
        website: "https://www.crisistextline.org/",
      },
    ],
    advice:
      "Please reach out to a mental health professional, trusted friend, or family member. You don't have to face these feelings alone.",
  };

  // Use suggested actions from API or defaults
  const displayedActions =
    suggestedActions.length > 0 ? suggestedActions : defaultSuggestedActions;

  // Render mental health resources
  const renderMentalHealthResources = (resources: MentalHealthResource) => {
    return (
      <div className="space-y-4 mt-4 border-t pt-4 border-amber-200">
        <h3 className="font-medium text-amber-800">Support Resources</h3>
        <div className="space-y-4">
          {resources.hotlines.map((hotline, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <h4 className="font-medium text-[#2D3142]">{hotline.name}</h4>
              <div className="flex items-center text-[#5D6470] text-sm">
                <Phone className="h-4 w-4 mr-2 text-amber-600" />
                <span>{hotline.phone}</span>
              </div>
              <div className="flex items-center text-[#5D6470] text-sm">
                <Globe className="h-4 w-4 mr-2 text-amber-600" />
                <a
                  href={hotline.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {hotline.website}
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[#2D3142] text-sm">{resources.advice}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full animate-gradient-shift bg-gradient-to-br from-[#F9F7D9] via-[#E3F6EF] to-[#F0E6FA] opacity-80"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[#F9F7D9] blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[15%] right-[10%] w-80 h-80 rounded-full bg-[#E3F6EF] blur-3xl animate-float"></div>
        <div className="absolute top-[60%] left-[50%] w-72 h-72 rounded-full bg-[#F0E6FA] blur-3xl animate-pulse-slower"></div>
      </div>

      <main className="relative flex min-h-screen flex-col items-center justify-center py-12 px-4">
        {/* Update logo here   */}
        <Image
          src="/sentimo1.png"
          alt="Sentimo Logo"
          width={128}
          height={128}
          className="absolute top-10 left-10"
        />

        <Card className="w-full max-w-2xl border-none shadow-lg">
          {!submitted ? (
            <>
              <CardHeader className="pb-0">
                <Badge
                  variant="outline"
                  className="px-4 py-2 font-normal w-fit"
                >
                  Hello, How are you today?
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                {showWarning && (
                  <Alert
                    variant="warning"
                    className="bg-amber-50 border-amber-200"
                  >
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="text-amber-800 font-medium">
                      We're Here For You
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                      We've noticed your entry contains content that suggests
                      you might be going through a difficult time. When you
                      submit, we'll provide resources that may help. Remember,
                      you're not alone.
                    </AlertDescription>
                  </Alert>
                )}
                <Textarea
                  placeholder="Write your thoughts here..."
                  className="min-h-[200px] resize-none border-[#E2E8F0] focus:border-[#05a653] focus:ring-[#05a653] bg-white"
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-[#5D6470] text-[14px]">
                  {currentDate}
                </span>
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
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-medium text-[#2D3142]">Your entry</h2>
                    <Button
                      variant="default"
                      className="rounded-full px-6"
                      onClick={handleNewEntry}
                    >
                      Write new entry
                    </Button>
                  </div>
                  <Card className="bg-white rounded-[18px] bg-[#F9F6F3] border-noneborder-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <p>{journalEntry}</p>
                        {sentiment && (
                          <span className="ml-2">{getSentimentGif()}</span> //Change getSentimentGif to getSentimentEmoji if you want to use emojis instead of gifs
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h2 className="font-medium text-[#2D3142] mb-2">Response</h2>
                  <Card className="bg-white rounded-[18px] bg-[#F9F6F3] border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* AI Response */}
                        <p className="text-[#2D3142]">
                          {aiResponse ||
                            "I'm glad to hear from you today! How can I help support you?"}
                        </p>

                        {/* Mental Health Resources (if concerning content detected) */}
                        {isConcerning &&
                          (resources || defaultResources) &&
                          renderMentalHealthResources(
                            resources || defaultResources
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h2 className="font-medium text-[#2D3142] mb-2">
                    Suggested actions
                  </h2>

                  <div className="flex flex-col">
                    <div
                      ref={scrollContainerRef}
                      className="flex flex-row gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-hide"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {displayedActions.map((action, index) => (
                        <Card
                          key={index}
                          className="bg-gradient-to-r from-[#F0F9F6] to-[#F9F7F2] border-none shadow-sm hover:shadow-md transition-shadow duration-200 flex-shrink-0 w-[250px]"
                        >
                          <CardContent className="p-4 flex flex-col items-start gap-3">
                            {getIconComponent(action.icon)}
                            <div>
                              <h3 className="text-[#2D3142] font-semibold">
                                {action.title}
                              </h3>
                              <p className="text-sm text-[#5D6470]">
                                {action.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-center mt-4 gap-2">
                      {displayedActions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => scrollToCard(index)}
                          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                            activeDot === index
                              ? "bg-[#05a653]"
                              : "bg-[#D1D5DB]"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <span className="text-[#5D6470] text-[14px]">
                  {currentDate}
                </span>
              </CardFooter>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
