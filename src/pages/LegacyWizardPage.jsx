// src/pages/LegacyWizardPage.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const LegacyWizardPage = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    bio: "",
    photo: null,
    memories: [],
    voiceRecordings: [],
    personalityTraits: {
      warmth: 70,
      humor: 50,
      wisdom: 80,
      patience: 60,
      curiosity: 40,
    },
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const fileInputRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [waveformData, setWaveformData] = useState(new Array(128).fill(0));

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 60 + 200, // Blue to purple range
    }));
    setParticles(newParticles);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: (p.y + p.speed) % 100,
          x: p.x + Math.sin(Date.now() * 0.001 + p.id) * 0.1,
        }))
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Initialize audio context for visualization
  useEffect(() => {
    if (isRecording) {
      audioContextRef.current = new (window.AudioContext ||
        window.webAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      // Simulate audio data for demo
      const simulateAudio = () => {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          analyserRef.current.getByteFrequencyData(dataArray);
          // Add some randomness to simulate real audio
          const newData = Array.from(dataArray, () => Math.random() * 255);
          setWaveformData(newData.slice(0, 128));
          animationFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
      };

      simulateAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

  // Timer for recording
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle file drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const newMemories = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      type: file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("audio")
        ? "audio"
        : file.type.startsWith("video")
        ? "video"
        : "text",
      progress: 0,
      status: "uploading",
    }));

    setFormData((prev) => ({
      ...prev,
      memories: [...prev.memories, ...newMemories],
    }));

    // Simulate upload progress
    newMemories.forEach((memory) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFormData((prev) => ({
            ...prev,
            memories: prev.memories.map((m) =>
              m.id === memory.id
                ? { ...m, progress: 100, status: "complete" }
                : m
            ),
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            memories: prev.memories.map((m) =>
              m.id === memory.id ? { ...m, progress } : m
            ),
          }));
        }
      }, 300 + Math.random() * 500);
    });
  };

  // Handle personality trait changes
  const handleTraitChange = (trait, value) => {
    setFormData((prev) => ({
      ...prev,
      personalityTraits: {
        ...prev.personalityTraits,
        [trait]: value,
      },
    }));
  };

  // Next step

  const nextStep = async () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // FINAL STEP: Save to backend
      setIsProcessing(true);

      try {
        // Prepare JSON payload — NO FormData!
        const payload = {
          name: formData.name.trim(),
          relationship: formData.relationship,
          bio: formData.bio || "",
          photo: formData.photo ? URL.createObjectURL(formData.photo) : null, // temporary URL for preview
          personalityTraits: formData.personalityTraits,
          memories: formData.memories.map((memory) => ({
            id: memory.id,
            name: memory.name,
            type: memory.type,
            size: memory.file?.size || 0,
            status: memory.status,
          })),
          voiceRecordings: formData.voiceRecordings.map((recording) => ({
            id: recording.id,
            name: recording.name,
            duration: recording.duration,
            quality: recording.quality,
            status: recording.status,
          })),
        };

        const response = await fetch("/api/legacy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 👈 CRITICAL — sends session cookie
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save legacy");
        }

        const result = await response.json();
        console.log("✅ Legacy saved:", result.legacy);

        // Show success and redirect
        setIsProcessing(false);
        setShowCelebration(true);

        setTimeout(() => {
          window.location.href = "/dashboard"; // Redirect to dashboard
        }, 3000);
      } catch (error) {
        console.error("Failed to save legacy:", error);
        let message = "Failed to save your legacy. Please try again.";
        if (error.message === "Authentication required") {
          message = "Please log in again to create a legacy.";
        } else if (error.message.includes("Cast to ObjectId failed")) {
          message = "Session expired. Please log in again.";
        }
        alert(message);
        setIsProcessing(false);
      }
    }
  };

  // Previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Start recording
  const startRecording = () => {
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Add to recordings
    const newRecording = {
      id: Date.now(),
      name: `Recording ${formData.voiceRecordings.length + 1}`,
      duration: recordingTime,
      quality: Math.floor(Math.random() * 30) + 70, // 70-100% quality
      status: "processing",
    };

    setFormData((prev) => ({
      ...prev,
      voiceRecordings: [...prev.voiceRecordings, newRecording],
    }));

    // Simulate processing
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        voiceRecordings: prev.voiceRecordings.map((r) =>
          r.id === newRecording.id ? { ...r, status: "complete" } : r
        ),
      }));
    }, 1500);
  };

  // Step titles and colors
  const steps = [
    {
      title: "Basic Information",
      color: "from-amber-400 to-orange-500",
      icon: "👤",
    },
    { title: "Memory Upload", color: "from-blue-400 to-cyan-500", icon: "📤" },
    {
      title: "Voice Training",
      color: "from-purple-400 to-pink-500",
      icon: "🎙️",
    },
    {
      title: "Personality Configuration",
      color: "from-emerald-400 to-teal-500",
      icon: "🧠",
    },
  ];

  return (
    <Layout>
      <div className="relative min-h-screen bg-black overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.3), transparent 50%),
                linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)
              `,
            }}
          />

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full pointer-events-none animate-pulse"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  background: `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`,
                  boxShadow: `0 0 ${particle.size * 4}px hsla(${
                    particle.hue
                  }, 70%, 60%, ${particle.opacity * 0.5})`,
                  animation: `float ${
                    3 + Math.random() * 4
                  }s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Interactive Mouse Glow */}
          <div
            className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* Progress Visualization */}
        <div className="max-w-4xl mx-auto px-6 mb-8 pt-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                    idx + 1 <= currentStep
                      ? "bg-gradient-to-r " +
                        step.color +
                        " text-white shadow-lg"
                      : "bg-white bg-opacity-30 text-white/50"
                  }`}
                >
                  {idx + 1 < currentStep ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 transition-all duration-1000 ${
                      idx + 1 < currentStep
                        ? "bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500"
                        : "bg-white bg-opacity-30"
                    }`}
                    style={{
                      width: idx + 1 < currentStep ? "100%" : "0%",
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <h1 className="text-3xl font-serif text-white text-center">
            {steps[currentStep - 1].title}
          </h1>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <div
            className={`bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 transition-all duration-500 ${
              showCelebration ? "scale-105 shadow-2xl shadow-violet-500/20" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), linear-gradient(135deg, ${
                steps[currentStep - 1].color.split(" ")[1]
              }, transparent)`,
            }}
          >
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-white mb-2">
                    Let's Begin the Sacred Ritual
                  </h2>
                  <p className="text-white/70">
                    Tell us about the person you wish to preserve
                  </p>
                </div>

                {/* Photo Upload Zone */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-violet-400 bg-violet-50 bg-opacity-20"
                      : "border-white/30 hover:border-white/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl">
                    📷
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    Upload a Profile Photo
                  </h3>
                  <p className="text-white/70 mb-4">
                    Drag & drop or click to select a photo
                  </p>
                  <p className="text-sm text-white/50">
                    JPG, PNG, GIF up to 10MB
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Full Name"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-violet-400 focus:outline-none transition-all text-white placeholder-white/50"
                    />
                    <label className="absolute left-4 top-3 text-white/50 transition-all duration-300 focus-within:text-xs focus-within:top-2 focus-within:text-violet-400"></label>
                  </div>

                  <div className="relative">
                    <select
                      value={formData.relationship}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          relationship: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-violet-400 focus:outline-none transition-all text-white"
                    >
                      <option value="">Select Relationship</option>
                      <option
                        value="grandparent"
                        style={{
                          backgroundColor: "rgba(255, 119, 198, 0.1)",
                          color: "black",
                        }}
                      >
                        Grandparent
                      </option>
                      <option
                        value="parent"
                        style={{
                          backgroundColor: "rgba(255, 119, 198, 0.1)",
                          color: "black",
                        }}
                      >
                        Parent
                      </option>
                      <option
                        value="sibling"
                        style={{
                          backgroundColor: "rgba(255, 119, 198, 0.1)",
                          color: "black",
                        }}
                      >
                        Sibling
                      </option>
                      <option
                        value="partner"
                        style={{
                          backgroundColor: "rgba(255, 119, 198, 0.1)",
                          color: "black",
                        }}
                      >
                        Partner
                      </option>
                      <option
                        value="friend"
                        style={{
                          backgroundColor: "rgba(255, 119, 198, 0.1)",
                          color: "black",
                        }}
                      >
                        Friend
                      </option>
                      <option
                        value="mentor"
                        style={{
                          backgroundColor: "rgba(255, 119, 198, 0.1)",
                          color: "black",
                        }}
                      >
                        Mentor
                      </option>
                      <option
                        value="other"
                        style={{
                          backgroundColor: "rgba(255, 119, 198, 0.1)",
                          color: "black",
                        }}
                      >
                        Other
                      </option>
                    </select>
                    <label className="absolute left-4 top-3 text-white/50 transition-all duration-300"></label>
                  </div>

                  <div className="relative">
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Share a special memory or story about them"
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-violet-400 focus:outline-none transition-all resize-none text-white placeholder-white/50"
                    ></textarea>
                    <label className="absolute left-4 top-3 text-white/50 transition-all duration-300 focus-within:text-xs focus-within:top-2 focus-within:text-violet-400"></label>
                    <div className="flex justify-between mt-1 text-xs text-white/50">
                      <span>{formData.bio?.length || 0}/1000</span>
                      <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              ((formData.bio?.length || 0) / 1000) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Memory Upload */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-white mb-2">
                    Preserve Their Essence
                  </h2>
                  <p className="text-white/70">
                    Upload memories that capture their spirit
                  </p>
                </div>

                {/* Drag & Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-blue-400 bg-blue-50 bg-opacity-20"
                      : "border-white/30 hover:border-white/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white text-3xl">
                    📤
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-4">
                    Drag & Drop Memories Here
                  </h3>
                  <p className="text-white/70 mb-6">
                    Or click to browse your files
                  </p>
                  <p className="text-sm text-white/50">
                    Supports photos, audio, video, and documents
                  </p>
                </div>

                {/* File Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white">
                      📖
                    </div>
                    <div className="text-sm font-medium text-white">Text</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white">
                      🎵
                    </div>
                    <div className="text-sm font-medium text-white">Voice</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white">
                      🖼️
                    </div>
                    <div className="text-sm font-medium text-white">Photos</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white">
                      🎬
                    </div>
                    <div className="text-sm font-medium text-white">Videos</div>
                  </div>
                </div>

                {/* Upload Progress */}
                {formData.memories.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">
                      Upload Progress
                    </h3>
                    {formData.memories.map((memory) => (
                      <div
                        key={memory.id}
                        className="p-4 rounded-xl bg-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm">
                              {memory.type === "image"
                                ? "🖼️"
                                : memory.type === "audio"
                                ? "🎵"
                                : memory.type === "video"
                                ? "🎬"
                                : "📖"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {memory.name}
                              </p>
                              <p className="text-xs text-white/50 capitalize">
                                {memory.type} • {memory.file.size} bytes
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-white/50">
                            {memory.status === "complete" ? (
                              <span className="text-emerald-400">
                                ✓ Complete
                              </span>
                            ) : (
                              `${Math.round(memory.progress)}%`
                            )}
                          </div>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              memory.status === "complete"
                                ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                                : "bg-gradient-to-r from-blue-400 to-cyan-500"
                            }`}
                            style={{ width: `${memory.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Voice Training */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-white mb-2">
                    Capture Their Voice
                  </h2>
                  <p className="text-white/70">
                    Record samples to preserve their unique vocal essence
                  </p>
                </div>

                {/* Recording Interface */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl transition-all duration-300 transform ${
                        isRecording
                          ? "bg-gradient-to-r from-red-400 to-red-600 animate-pulse scale-105"
                          : "bg-gradient-to-r from-purple-400 to-pink-500 hover:scale-105"
                      }`}
                    >
                      {isRecording ? "●" : "●"}
                    </button>
                    {isRecording && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-400 animate-ping"></div>
                    )}
                  </div>

                  {isRecording && (
                    <div className="mt-4 text-2xl font-mono text-white animate-pulse">
                      {formatTime(recordingTime)}
                    </div>
                  )}
                </div>

                {/* Audio Visualization */}
                {isRecording && (
                  <div className="p-6 bg-white/10 rounded-2xl">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Real-time Audio Visualization
                    </h3>
                    <div className="flex items-end justify-center h-32 space-x-1">
                      {waveformData.map((value, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-t from-purple-400 to-pink-500 rounded-t transition-all duration-75 ease-out"
                          style={{
                            height: `${(value / 255) * 100}%`,
                            width: "4px",
                            minHeight: "2px",
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Quality Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/10 text-center">
                    <div className="text-2xl mb-2">🔊</div>
                    <div className="text-sm font-medium text-white mb-2">
                      Volume
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                    <div className="text-xs text-white/50 mt-1">Good</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="text-sm font-medium text-white mb-2">
                      Clarity
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                    <div className="text-xs text-white/50 mt-1">Excellent</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 text-center">
                    <div className="text-2xl mb-2">🌡️</div>
                    <div className="text-sm font-medium text-white mb-2">
                      Consistency
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                    <div className="text-xs text-white/50 mt-1">Good</div>
                  </div>
                </div>

                {/* Recordings List */}
                {formData.voiceRecordings.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">
                      Your Recordings
                    </h3>
                    {formData.voiceRecordings.map((recording) => (
                      <div
                        key={recording.id}
                        className="p-4 rounded-xl bg-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">
                              {recording.name}
                            </h4>
                            <p className="text-sm text-white/50">
                              {formatTime(recording.duration)} •{" "}
                              {recording.quality}% quality
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {recording.status === "processing" ? (
                              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-emerald-400"></div>
                            )}
                            <button className="text-white/50 hover:text-white">
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Training Progress */}
                <div className="p-6 bg-white/10 rounded-2xl">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Voice Training Progress
                  </h3>
                  <div className="space-y-4">
                    {[
                      { stage: "Analysis", complete: true, icon: "🔍" },
                      { stage: "Processing", complete: true, icon: "⚙️" },
                      {
                        stage: "Training",
                        complete: formData.voiceRecordings.length > 0,
                        icon: "🧠",
                      },
                      { stage: "Completion", complete: false, icon: "✅" },
                    ].map((stage, idx) => (
                      <div key={idx} className="flex items-center space-x-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                            stage.complete
                              ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                              : "bg-white/30 text-white/50"
                          }`}
                        >
                          {stage.complete ? "✓" : stage.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {stage.stage}
                          </div>
                          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full transition-all duration-1000 ${
                                stage.complete
                                  ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                                  : "bg-gradient-to-r from-purple-400 to-pink-500"
                              }`}
                              style={{
                                width: stage.complete
                                  ? "100%"
                                  : idx === 2 &&
                                    formData.voiceRecordings.length > 0
                                  ? "50%"
                                  : "0%",
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Personality Configuration */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-white mb-2">
                    Shape Their Digital Soul
                  </h2>
                  <p className="text-white/70">
                    Fine-tune personality traits to match their essence
                  </p>
                </div>

                {/* Personality Sliders */}
                <div className="space-y-6">
                  {Object.entries(formData.personalityTraits).map(
                    ([trait, value]) => (
                      <div key={trait} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-white capitalize">
                            {trait}
                          </label>
                          <span className="text-sm text-white/50">
                            {value}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) =>
                            handleTraitChange(trait, parseInt(e.target.value))
                          }
                          className="w-full h-2 bg-white/20 rounded-full appearance-none slider"
                          style={{
                            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${value}%, rgba(255,255,255,0.2) ${value}%, rgba(255,255,255,0.2) 100%)`,
                          }}
                        />
                        <div className="flex justify-between text-xs text-white/50">
                          <span>Reserved</span>
                          <span>Expressive</span>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Personality Radar Chart */}
                <div className="p-6 bg-white/10 rounded-2xl">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Personality Profile
                  </h3>
                  <div className="flex items-center justify-center h-64">
                    <div className="relative w-48 h-48">
                      {/* Radar chart background */}
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute inset-0"
                          style={{
                            transform: `rotate(${i * 72}deg)`,
                          }}
                        >
                          <div className="w-0.5 h-full bg-white/30 mx-auto"></div>
                        </div>
                      ))}

                      {/* Radar chart data */}
                      <div
                        className="absolute inset-0"
                        style={{
                          clipPath: `polygon(
                          50% ${
                            50 - (formData.personalityTraits.warmth / 100) * 40
                          }%, 
                          ${
                            50 +
                            (formData.personalityTraits.humor / 100) *
                              40 *
                              Math.cos((2 * Math.PI) / 5)
                          }% ${
                            50 -
                            (formData.personalityTraits.humor / 100) *
                              40 *
                              Math.sin((2 * Math.PI) / 5)
                          }%, 
                          ${
                            50 +
                            (formData.personalityTraits.wisdom / 100) *
                              40 *
                              Math.cos((4 * Math.PI) / 5)
                          }% ${
                            50 -
                            (formData.personalityTraits.wisdom / 100) *
                              40 *
                              Math.sin((4 * Math.PI) / 5)
                          }%, 
                          ${
                            50 +
                            (formData.personalityTraits.patience / 100) *
                              40 *
                              Math.cos((6 * Math.PI) / 5)
                          }% ${
                            50 -
                            (formData.personalityTraits.patience / 100) *
                              40 *
                              Math.sin((6 * Math.PI) / 5)
                          }%, 
                          ${
                            50 +
                            (formData.personalityTraits.curiosity / 100) *
                              40 *
                              Math.cos((8 * Math.PI) / 5)
                          }% ${
                            50 -
                            (formData.personalityTraits.curiosity / 100) *
                              40 *
                              Math.sin((8 * Math.PI) / 5)
                          }%
                        )`,
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-teal-500 bg-opacity-30 rounded-full"></div>
                      </div>

                      {/* Trait labels */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-white/70">
                        Warmth
                      </div>
                      <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-xs text-white/70">
                        Humor
                      </div>
                      <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-xs text-white/70">
                        Wisdom
                      </div>
                      <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 text-xs text-white/70">
                        Patience
                      </div>
                      <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 text-xs text-white/70">
                        Curiosity
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Chat */}
                <div className="p-6 bg-white/10 rounded-2xl">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Preview Conversation
                  </h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xs">
                        AI
                      </div>
                      <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-sm rounded-2xl px-4 py-2">
                        <p className="text-sm text-white">
                          Based on the personality traits you've set, I would
                          respond with warmth and wisdom. How are you feeling
                          today?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 backdrop-blur-sm rounded-2xl px-4 py-2">
                        <p className="text-sm text-white">
                          I'm doing well, just missing them today.
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs">
                        You
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xs">
                        AI
                      </div>
                      <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-sm rounded-2xl px-4 py-2">
                        <p className="text-sm text-white">
                          I understand. Some days the memories feel closer than
                          others. Would you like to hear one of their favorite
                          stories?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {!showCelebration && (
              <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
                {currentStep > 1 ? (
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-white/70 hover:text-white"
                  >
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  onClick={nextStep}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : currentStep === 4 ? (
                    "Complete Ritual"
                  ) : (
                    "Next Step"
                  )}
                </button>
              </div>
            )}

            {/* Completion Ceremony */}
            {showCelebration && (
              <div className="text-center py-12">
                <div className="mb-8">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-4xl font-serif text-white mb-4">
                    Your Legacy Is Now Ready
                  </h2>
                  <p className="text-xl text-white/70">
                    The sacred ritual is complete. Their digital essence now
                    lives on.
                  </p>
                </div>

                {/* Particle Celebration */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 animate-celebration"
                      style={{
                        left: "50%",
                        top: "50%",
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "2s",
                        transform: `rotate(${i * 18}deg) translate(0, 0)`,
                      }}
                    ></div>
                  ))}
                </div>

                <div className="text-lg text-white/70 mb-8">
                  Redirecting to your Memory Mission Control...
                </div>

                <div className="w-64 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 animate-progress"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Styles */}
        <style jsx global>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #a855f7;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #a855f7;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          @keyframes celebration {
            0% {
              transform: rotate(0deg) translate(0, 0);
              opacity: 1;
            }
            100% {
              transform: rotate(var(--rotation)) translate(0, -150px);
              opacity: 0;
            }
          }

          .animate-celebration {
            animation: celebration 2s ease-out forwards;
            --rotation: 360deg;
          }

          @keyframes progress {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }

          .animate-progress {
            animation: progress 3s ease-out forwards;
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-10px) rotate(180deg);
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default LegacyWizardPage;
