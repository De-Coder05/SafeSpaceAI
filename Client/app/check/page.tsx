"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import Link from "next/link"
import { Mic, Activity, AlertCircle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Results from "./results"

const DASS21_QUESTIONS = [
  "I found it hard to wind down",                  // q1(S)
  "I tended to over-react to situations",          // q6(s)
  "I felt that I was using a lot of nervous energy", // q8(s)
  "I found myself getting agitated",               // q11(s)
  "I found it difficult to relax",                 // q12(s)
  "I was intolerant of anything that kept me from getting on with what I was doing", // q14(s)
  "I felt that I was rather touchy"                // q18(s)
]

export default function CheckPage() {
  const [dass21Responses, setDass21Responses] = useState<number[]>(new Array(7).fill(0))
  const [stressResult, setStressResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [allDataReady, setAllDataReady] = useState(false)

  // Progress states
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(90)
  const [statusMessage, setStatusMessage] = useState("Initializing...")

  // Audio playback ref
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const pageRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Progress Simulation Logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLoading) {
      setProgress(0)
      setTimeLeft(90)

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) return 99
          // Linear progress: ~1.1% per second for 90s
          return prev + 1.1
        })

        setTimeLeft((prev) => {
          if (prev <= 1) return 1
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  // Update status message based on progress
  useEffect(() => {
    if (progress < 20) setStatusMessage("Preprocessing physiological signals...")
    else if (progress < 45) setStatusMessage("Extracting regularized features...")
    else if (progress < 70) setStatusMessage("Analyzing questionnaire responses...")
    else if (progress < 90) setStatusMessage("Running Deep Learning Voice models...")
    else setStatusMessage("Finalizing Multi-modal Fusion...")
  }, [progress])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".check-section",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" },
      )
    })

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (stressResult && resultsRef.current) {
      gsap.fromTo(
        resultsRef.current,
        { scale: 0.9, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" },
      )
    }
  }, [stressResult])

  // Check if required modalities have data (physiological and questionnaire are required, voice is optional)
  useEffect(() => {
    const hasPhysiological = uploadedFile !== null
    const hasQuestionnaire = dass21Responses.some((response) => response > 0)

    setAllDataReady(hasPhysiological && hasQuestionnaire)
  }, [uploadedFile, dass21Responses])

  const handleDass21Change = (index: number, value: number) => {
    const newResponses = [...dass21Responses]
    newResponses[index] = value
    setDass21Responses(newResponses)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setAudioURL(URL.createObjectURL(file))
    }
  }

  //   const analyzeAllModalities = async () => {
  //   if (!allDataReady || !uploadedFile || !audioFile) return;

  //   setIsLoading(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append("physiological_file", uploadedFile);
  //     formData.append("audio_file", audioFile);
  //     formData.append("questionnaire", JSON.stringify(dass21Responses));

  //     const response = await fetch("http://localhost:8000/api/predict/comprehensive", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const result = await response.json();
  //     setStressResult(result);
  //   } catch (error) {
  //     console.error("Error analyzing comprehensive data:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const analyzeAllModalities = async () => {
    if (!allDataReady || !uploadedFile) return;

    setIsLoading(true);
    try {
      // Convert DASS-21 integer responses to a comma-separated string
      const dass21ResponseString = dass21Responses.join(",");

      const formData = new FormData();
      formData.append("physiological_file", uploadedFile);
      formData.append("dass21_responses", dass21ResponseString);

      // Add voice audio if available
      if (audioFile) {
        formData.append("voice_audio", audioFile, audioFile.name);
        console.log("✅ Voice audio file details:", {
          name: audioFile.name,
          type: audioFile.type,
          size: audioFile.size,
          lastModified: audioFile.lastModified
        });
      }

      // Debug prints
      console.log("✅ Sending physiological_file:", uploadedFile.name);
      console.log("✅ DASS-21 Responses:", dass21ResponseString);
      if (audioFile) {
        console.log("✅ Voice audio file:", audioFile.name);
      }

      // Debug: Log FormData contents
      console.log("📋 FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Directly call the FastAPI backend.
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("❌ API Error:", errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ API Response:", result);

      if (!result.success) {
        throw new Error(result.message || result.error || "Prediction failed");
      }

      // Force progress to 100% on success
      setProgress(100)
      setStatusMessage("Analysis Complete!")

      // Small delay to let the user see 100%
      setTimeout(() => {
        setStressResult(result);
        setIsLoading(false);
      }, 500)

    } catch (error: any) {
      console.error("❌ Error analyzing comprehensive data:", error);
      alert(`Error: ${error.message || "Failed to analyze stress level. Please check your data and try again."}`);
      setStressResult(null);
      setIsLoading(false);
    } finally {
      // setIsLoading(false) is handled in setTimeout for success case
    }
  };

  const getStressColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      case "moderate":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getCompletionPercentage = () => {
    let completed = 0
    if (uploadedFile) completed += 40
    if (dass21Responses.some((response) => response > 0)) completed += 40
    if (audioFile) completed += 20
    return completed
  }

  const clearAudio = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setAudioFile(null);
  };

  return (
    <main
      ref={pageRef}
      id="check-page-main"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 py-4 sm:py-6 md:py-8 pt-[120px] scroll-mt-[120px]"
      style={{ scrollMarginTop: '120px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="pt-8 sm:pt-12 md:pt-16"></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
            AI-Powered Multimodal Stress Detection
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
            Leveraging Deep Learning, Ensemble Methods, and Multi-modal Fusion for accurate stress level classification
          </p>
          {/* Progress Indicator */}
          <div className="max-w-md mx-auto mb-6 sm:mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Assessment Progress</span>
              <span>{getCompletionPercentage()}%</span>
            </div>
            <Progress value={getCompletionPercentage()} className="h-2 sm:h-3" />
          </div>

          {!allDataReady && (
            <Alert className="max-w-2xl mx-auto mb-6 sm:mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm sm:text-base">
                Please complete Physiological Data and Questionnaire for analysis. Voice audio upload is optional but recommended for enhanced accuracy through our CNN-GRU-Attention deep learning model.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Input Methods */}
          <div className="space-y-6 sm:space-y-8">
            {/* Physiological Data Section */}
            <Card className="check-section border-0 shadow-lg sm:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl md:text-2xl">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600" />
                  <span>Physiological Signal Processing</span>
                  {uploadedFile && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Feature Engineering: Time-domain, Frequency-domain, Wavelet Transform, HRV Analysis
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <Label
                    htmlFor="file-upload"
                    className="block text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-4"
                  >
                    Upload Physiological Data (CSV/JSON)
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Processed by Regularized Ensemble Classifier with 180 engineered features
                  </p>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileUpload}
                      className="flex-1 p-3 sm:p-4 text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                    />
                  </div>
                  {uploadedFile && (
                    <p className="text-green-600 mt-2 font-medium text-sm sm:text-base flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{uploadedFile.name} uploaded</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Voice Analysis Section */}
            <Card className="check-section border-0 shadow-lg sm:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl md:text-2xl">
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-teal-600" />
                  <span>Deep Learning Voice Analysis</span>
                  {audioFile && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  CNN-GRU-Attention Architecture | MFCC Feature Extraction | Transfer Learning
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <Label
                    htmlFor="audio-upload"
                    className="block text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-4"
                  >
                    Upload Audio File
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Analyzed using Convolutional Neural Networks with Bidirectional GRU and Attention Mechanism
                  </p>
                  <Input
                    id="audio-upload"
                    type="file"
                    accept=".wav,.mp3,.m4a,.webm"
                    onChange={handleAudioUpload}
                    className="p-3 sm:p-4 text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                  />
                  {audioFile && (
                    <p className="text-green-600 mt-2 font-medium text-sm sm:text-base flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{audioFile.name} uploaded</span>
                    </p>
                  )}
                </div>

                {audioURL && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <audio
                        ref={audioRef}
                        src={audioURL}
                        controls
                        className="flex-1"
                      />
                      <Button
                        onClick={clearAudio}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Click play to verify your audio file before submitting
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DASS-21 Questionnaire */}
            <Card className="check-section border-0 shadow-lg sm:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl md:text-2xl">
                  <span>DASS-21 Questionnaire</span>
                  {dass21Responses.some((response) => response > 0) && (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  )}
                </CardTitle>
                <p className="text-gray-600 font-medium text-sm sm:text-base">
                  Rate each statement: 0 = Never, 1 = Sometimes, 2 = Often, 3 = Almost Always
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Processed by Stacking Classifier Ensemble with Feature Scaling
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 max-h-80 sm:max-h-96 overflow-y-auto">
                {DASS21_QUESTIONS.map((question, index) => (
                  <div key={index} className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <Label className="font-medium text-gray-800 text-sm sm:text-base">
                      {index + 1}. {question}
                    </Label>
                    <div className="flex space-x-2 sm:space-x-3">
                      {[0, 1, 2, 3].map((value) => (
                        <Button
                          key={value}
                          variant={dass21Responses[index] === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleDass21Change(index, value)}
                          className="w-10 h-8 sm:w-12 sm:h-10 md:w-16 md:h-12 text-sm sm:text-base md:text-lg font-semibold rounded-lg sm:rounded-xl"
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis & Results */}
          <div className="space-y-6 sm:space-y-8">
            {/* Analysis Button */}
            <Card className="check-section border-0 shadow-lg sm:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8 text-center">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>{statusMessage}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3 sm:h-4 w-full bg-gray-100" indicatorClassName="bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 transition-all duration-500" />
                    <p className="text-sm text-gray-500">
                      Estimated time remaining: {timeLeft} seconds
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={analyzeAllModalities}
                    disabled={!allDataReady}
                    className="w-full py-4 sm:py-6 text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 hover:from-blue-700 hover:via-teal-700 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                  >
                    Run AI Stress Analysis
                  </Button>
                )}
                {!allDataReady && (
                  <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">
                    Complete Physiological Data and Questionnaire to enable multi-modal machine learning analysis
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Powered by: Late Fusion Architecture | Ensemble Learning | Explainable AI (XAI)
                </p>
              </CardContent>
            </Card>

            {/* Results */}
            <Results result={stressResult} isLoading={isLoading} />


          </div>
        </div>
      </div>
    </main>
  )
}
