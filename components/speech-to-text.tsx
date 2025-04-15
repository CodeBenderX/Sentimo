"use client"

import { useState, useEffect } from "react"
import { Mic, Loader2, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface SpeechToTextProps {
  onTranscript: (text: string) => void
}

// Define types for the Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

function SpeechToTextComponent({ onTranscript }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setIsSupported(false)
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const startListening = () => {
    setIsLoading(true)
    setHasError(false)

    try {
      // Use the appropriate SpeechRecognition constructor
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
        setIsLoading(false)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (event.results.length > 0) {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join(" ")

          // Only send final results
          if (event.results[0].isFinal) {
            onTranscript(transcript)
          }
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Handle specific error types
        if (event.error === "network") {
          console.log("Network error occurred with speech recognition")
          toast({
            title: "Network Issue",
            description: "Unable to connect to speech recognition service. Please check your internet connection.",
            variant: "destructive",
          })
        } else if (event.error === "not-allowed") {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive",
          })
        } else if (event.error === "no-speech") {
          toast({
            description: "No speech was detected. Please try again.",
            variant: "default",
          })
        } else {
          console.log("Speech recognition error:", event.error)
          toast({
            title: "Speech Recognition Error",
            description: "An error occurred. Please try again later.",
            variant: "destructive",
          })
        }

        setHasError(true)
        setIsListening(false)
        setIsLoading(false)
      }

      recognition.onend = () => {
        // Only show the "finished recording" toast if there was no error
        if (isListening && !hasError) {
          toast({
            description: "Voice recording finished",
            variant: "default",
          })
        }
        setIsListening(false)
        setIsLoading(false)
      }

      // Store recognition instance in window to access it later for stopping
      window.recognitionInstance = recognition

      recognition.start()
    } catch (error) {
      console.log("Error initializing speech recognition:", error)
      toast({
        title: "Speech Recognition Error",
        description: "Could not initialize speech recognition. Please try again later.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const stopListening = () => {
    if (window.recognitionInstance) {
      try {
        window.recognitionInstance.stop()
      } catch (error) {
        console.log("Error stopping speech recognition:", error)
      }
      setIsListening(false)
    }
  }

  // If speech recognition is not supported, return a disabled button with tooltip
  if (!isSupported) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled
        className="rounded-full opacity-50 cursor-not-allowed"
        title="Speech recognition is not supported in your browser"
      >
        <Mic className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleListening}
      className={`rounded-full ${
        isListening
          ? "bg-red-100 text-red-600 border-red-300"
          : hasError
            ? "bg-orange-100 text-orange-600 border-orange-300"
            : ""
      }`}
      title={isListening ? "Stop recording" : hasError ? "Try again" : "Start voice recording"}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <Mic className="h-5 w-5 animate-pulse" />
      ) : hasError ? (
        <WifiOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  )
}

// Export both as named export and default export to ensure compatibility
export { SpeechToTextComponent as SpeechToText }
export default SpeechToTextComponent

// Add TypeScript declaration for the global window object
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    recognitionInstance?: any
  }
}
