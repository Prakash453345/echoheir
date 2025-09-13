import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const AuthPage = () => {
  const { user, login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    relationship: "Other",
    privacyLevel: "private",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [memoryFragments, setMemoryFragments] = useState([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

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

  // Memory fragments for emotional left side
  useEffect(() => {
    const fragments = [
      {
        img: "",
        text: "Her laugh still echoes in the kitchen...",
        top: "10%",
        left: "10%",
        delay: "0s",
      },
      {
        img: "https://i.ibb.co/353ZgPJ5/unnamed.png",
        text: "He always said 'family is everything'...",
        top: "40%",
        left: "20%",
        delay: "0.5s",
      },
      {
        img: "https://i.ibb.co/RG8zH1gy/unnamed.png",
        text: "Sunday mornings, pancakes and stories...",
        top: "70%",
        left: "15%",
        delay: "1s",
      },
    ];
    setMemoryFragments(fragments);
  }, []);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      bio: "",
      relationship: "Other",
      privacyLevel: "private",
    });
    setErrors({});
    setApiError("");
    setCurrentStep(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError("");
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRelationshipSelect = (relationship) => {
    setFormData((prev) => ({ ...prev, relationship }));
  };

  const handlePrivacySelect = (level) => {
    setFormData((prev) => ({ ...prev, privacyLevel: level }));
  };

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = (field) => setTimeout(() => setFocusedField(null), 200);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!isLogin) {
      if (currentStep === 1) {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm password";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const newErrors = {};
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setApiError("Please fix the errors above before continuing");
        return;
      }
    }

    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (currentStep === 3) {
          result = await register({
            email: formData.email,
            password: formData.password,
            bio: formData.bio,
            relationship: formData.relationship,
            privacyLevel: formData.privacyLevel,
          });
        } else {
          nextStep();
          setIsSubmitting(false);
          return;
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Auth error:", error);
      setApiError(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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

        <div className="flex h-screen">
          {/* Emotional Left Side (Hidden on mobile) */}
          <div className="hidden md:block md:w-2/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-pink-900/50"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541771186248-9b367457e315?w=800&h=800&fit=crop')] bg-center bg-cover opacity-20"></div>
            {/* Floating Memory Fragments */}
            {memoryFragments.map((fragment, idx) => (
              <div
                key={idx}
                className="absolute p-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl text-sm text-white max-w-xs animate-float"
                style={{
                  top: fragment.top,
                  left: fragment.left,
                  animationDelay: fragment.delay,
                  height: "200px",
                  animationDuration: `${3 + idx}s`,
                }}
              >
                {fragment.img && (
                  <img
                    src={fragment.img}
                    alt="Memory"
                    className="mt-2 w-full h-24 object-cover rounded-lg"
                    style={{
                      borderRadius: "12px",
                      height: "155px",
                      width: "250px",
                    }}
                  />
                )}
              </div>
            ))}
            {/* Parallax Effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 50%)",
                backgroundSize: "1000% 1000%",
              }}
              onMouseMove={(e) => {
                const x = (e.clientX / window.innerWidth) * 100;
                const y = (e.clientY / window.innerHeight) * 100;
                e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
                e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
              }}
            ></div>
          </div>

          {/* Form Right Side */}
          <div className="w-full md:w-3/5 flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-md md:max-w-2xl">
              {isLogin ? (
                <form
                  onSubmit={handleSubmit}
                  className="w-full max-w-md mx-auto p-8 space-y-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl"
                >
                  <h2 className="text-3xl font-serif text-white mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-white/70 mb-8">
                    Continue preserving what matters most.
                  </p>
                  {apiError && (
                    <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                      {apiError}
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => handleFocus("email")}
                      onBlur={() => handleBlur("email")}
                      placeholder=" "
                      className={`w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border text-black transition-all duration-300 ${
                        focusedField === "email"
                          ? "border-violet-400 shadow-lg shadow-violet-400/20"
                          : errors.email
                          ? "border-red-400 animate-shake"
                          : "border-white border-opacity-30 hover:border-opacity-60"
                      }`}
                    />
                    <label
                      className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                        focusedField === "email" || formData.email
                          ? "top-2 text-xs text-violet-400"
                          : "top-4 text-gray-400"
                      }`}
                    >
                      Email Address
                    </label>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1 animate-fadeIn">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => handleFocus("password")}
                      onBlur={() => handleBlur("password")}
                      placeholder=" "
                      className={`w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border text-black transition-all duration-300 ${
                        focusedField === "password"
                          ? "border-violet-400 shadow-lg shadow-violet-400/20"
                          : errors.password
                          ? "border-red-400 animate-shake"
                          : "border-white border-opacity-30 hover:border-opacity-60"
                      }`}
                    />
                    <label
                      className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                        focusedField === "password" || formData.password
                          ? "top-2 text-xs text-violet-400"
                          : "top-4 text-gray-400"
                      }`}
                    >
                      Password
                    </label>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1 animate-fadeIn">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white font-medium hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
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
                        Signing In...
                      </span>
                    ) : showSuccess ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 mr-2"
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
                        Success!
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                  <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-white bg-opacity-30"></div>
                    <span className="px-4 text-sm text-white/50">
                      or continue with
                    </span>
                    <div className="flex-1 h-px bg-white bg-opacity-30"></div>
                  </div>
                  <div className="flex justify-center">
                    <a
                      href="http://localhost:5000/auth/google"
                      className="py-3 px-8 rounded-xl bg-gray-900 bg-opacity-70 backdrop-blur-sm border border-transparent hover:border-violet-400 hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center space-x-3 min-w-[220px] shadow-lg shadow-violet-500/10"
                      style={{
                        fontFamily: "Roboto, Arial, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {/* Custom "G" using Unicode + CSS */}
                      <span
                        className="w-6 h-6 flex items-center justify-center rounded-full text-white text-sm font-bold bg-gradient-to-br from-violet-400 to-pink-500 shadow-md"
                        style={{
                          boxShadow: "0 2px 6px rgba(147, 51, 234, 0.3)",
                          lineHeight: 1,
                        }}
                      >
                        G
                      </span>
                      <span className="text-white font-medium text-base tracking-wide">
                        Google
                      </span>
                    </a>
                  </div>
                  <p className="text-center text-white/50 mt-8">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                    >
                      Start your legacy
                    </button>
                  </p>
                </form>
              ) : (
                <div className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-center mb-12 px-4">
                    {[
                      { title: "Basic Info", icon: "👤" },
                      { title: "About Your Loved One", icon: "❤️" },
                      { title: "Privacy Settings", icon: "🔒" },
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                            idx + 1 <= currentStep
                              ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg"
                              : "bg-white bg-opacity-20 text-gray-400"
                          }`}
                        >
                          {idx + 1 < currentStep ? (
                            <svg
                              className="w-5 h-5"
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
                        {idx < 2 && (
                          <div
                            className={`h-1 flex-1 mx-2 transition-all duration-500 ${
                              idx + 1 < currentStep
                                ? "bg-gradient-to-r from-violet-500 to-pink-500"
                                : "bg-white bg-opacity-20"
                            }`}
                            style={{
                              animation:
                                idx + 1 < currentStep
                                  ? "fillProgress 0.8s ease-out forwards"
                                  : "none",
                              width: idx + 1 < currentStep ? "100%" : "0%",
                            }}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {apiError && (
                    <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                      {apiError}
                    </div>
                  )}

                  {/* Step Content */}
                  <div className="space-y-6">
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-serif text-white">
                          Let's Begin
                        </h2>
                        <p className="text-white/70">Tell us about yourself</p>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={() => handleFocus("email")}
                            onBlur={() => handleBlur("email")}
                            placeholder=" "
                            className={`w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border text-black transition-all duration-300 ${
                              focusedField === "email"
                                ? "border-violet-400 shadow-lg shadow-violet-400/20"
                                : errors.email
                                ? "border-red-400 animate-shake"
                                : "border-white border-opacity-30 hover:border-opacity-60"
                            }`}
                          />
                          <label
                            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                              focusedField === "email" || formData.email
                                ? "top-2 text-xs text-violet-400"
                                : "top-4 text-gray-400"
                            }`}
                          >
                            Email Address
                          </label>
                          {errors.email && (
                            <p className="text-red-400 text-sm mt-1 animate-fadeIn">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onFocus={() => handleFocus("password")}
                            onBlur={() => handleBlur("password")}
                            placeholder=" "
                            className={`w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border text-black transition-all duration-300 ${
                              focusedField === "password"
                                ? "border-violet-400 shadow-lg shadow-violet-400/20"
                                : errors.password
                                ? "border-red-400 animate-shake"
                                : "border-white border-opacity-30 hover:border-opacity-60"
                            }`}
                          />
                          <label
                            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                              focusedField === "password" || formData.password
                                ? "top-2 text-xs text-violet-400"
                                : "top-4 text-gray-400"
                            }`}
                          >
                            Create Password
                          </label>
                          {errors.password && (
                            <p className="text-red-400 text-sm mt-1 animate-fadeIn">
                              {errors.password}
                            </p>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            onFocus={() => handleFocus("confirmPassword")}
                            onBlur={() => handleBlur("confirmPassword")}
                            placeholder=" "
                            className={`w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border text-black transition-all duration-300 ${
                              focusedField === "confirmPassword"
                                ? "border-violet-400 shadow-lg shadow-violet-400/20"
                                : errors.confirmPassword
                                ? "border-red-400 animate-shake"
                                : "border-white border-opacity-30 hover:border-opacity-60"
                            }`}
                          />
                          <label
                            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                              focusedField === "confirmPassword" ||
                              formData.confirmPassword
                                ? "top-2 text-xs text-violet-400"
                                : "top-4 text-gray-400"
                            }`}
                          >
                            Confirm Password
                          </label>
                          {errors.confirmPassword && (
                            <p className="text-red-400 text-sm mt-1 animate-fadeIn">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-serif text-white">
                          About Your Loved One
                        </h2>
                        <p className="text-white/70">
                          Help us understand who you're preserving
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              icon: "👵",
                              label: "Grandparent",
                              value: "Grandparent",
                            },
                            { icon: "👨‍👩‍👧", label: "Parent", value: "Parent" },
                            { icon: "🧑‍🤝‍🧑", label: "Sibling", value: "Sibling" },
                            { icon: "💑", label: "Partner", value: "Partner" },
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                handleRelationshipSelect(item.value)
                              }
                              className={`p-4 rounded-xl transition-all border flex flex-col items-center space-y-2 ${
                                formData.relationship === item.value
                                  ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white border-transparent shadow-lg"
                                  : "bg-white bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-30 text-black"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl">
                                {item.icon}
                              </div>
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="relative">
                          <textarea
                            name="bio"
                            value={formData.bio || ""}
                            onChange={handleInputChange}
                            onFocus={() => handleFocus("bio")}
                            onBlur={() => handleBlur("bio")}
                            placeholder=" "
                            rows="4"
                            className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 hover:border-opacity-60 transition-all focus:border-violet-400 focus:shadow-lg focus:shadow-violet-400/20 resize-none text-black"
                          ></textarea>
                          <label
                            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                              focusedField === "bio" ||
                              (formData.bio && formData.bio.length > 0)
                                ? "top-2 text-xs text-violet-400"
                                : "top-4 text-gray-400"
                            }`}
                          >
                            Share a special memory or story (optional)
                          </label>
                          <div className="flex justify-between mt-1 text-xs text-white/50">
                            <span>{formData.bio?.length || 0}/500</span>
                            <div className="w-32 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((formData.bio?.length || 0) / 500) * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-serif text-white">
                          Privacy & Preferences
                        </h2>
                        <p className="text-white/80">
                          Choose how your legacy will be shared
                        </p>
                        <div className="space-y-4">
                          {[
                            {
                              label: "Private Legacy",
                              desc: "Only you can access this memory",
                              value: "private",
                              color: "from-gray-400 to-gray-600",
                              baseBg: "bg-gray-800",
                            },
                            {
                              label: "Family Access",
                              desc: "Share with immediate family",
                              value: "family",
                              color: "from-violet-400 to-pink-500",
                              baseBg: "bg-gray-800",
                            },
                            {
                              label: "Public Tribute",
                              desc: "Create a public memorial page",
                              value: "public",
                              color: "from-gray-400 to-gray-600",
                              baseBg: "bg-gray-800",
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-4 rounded-xl cursor-pointer hover:bg-gray-850 transition-all border border-gray-700"
                              style={{
                                backgroundColor: "rgba(30, 41, 59, 0.8)",
                              }}
                              onClick={() => handlePrivacySelect(item.value)}
                            >
                              <div>
                                <h3 className="font-medium text-white mb-1">
                                  {item.label}
                                </h3>
                                <p className="text-xs text-gray-300">
                                  {item.desc}
                                </p>
                              </div>
                              <div
                                className={`relative w-12 h-6 rounded-full ${item.baseBg} flex items-center justify-between px-1 shadow-lg`}
                              >
                                <div
                                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                                    item.color
                                  } transition-all duration-300 opacity-0 ${
                                    formData.privacyLevel === item.value
                                      ? "opacity-100"
                                      : ""
                                  }`}
                                />
                                <div
                                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 transform ${
                                    formData.privacyLevel === item.value
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 rounded-xl bg-gray-900 border border-gray-700">
                          <h3 className="font-medium text-white mb-2">
                            Auto-save is enabled
                          </h3>
                          <p className="text-xs text-gray-300">
                            Your progress is saved as you go
                          </p>
                          <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse mt-2"></div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                      {currentStep > 1 ? (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="px-6 py-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all border border-white border-opacity-30 text-black hover:text-violet-600 font-medium"
                        >
                          Previous
                        </button>
                      ) : (
                        <div></div>
                      )}
                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-xl hover:scale-105 transition-all font-medium"
                        >
                          Next Step
                        </button>
                      ) : (
                        <button
                          type="submit"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-xl hover:scale-105 transition-all relative overflow-hidden disabled:opacity-50 font-medium"
                        >
                          {isSubmitting ? (
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
                              Creating Account...
                            </span>
                          ) : showSuccess ? (
                            <span className="flex items-center">
                              <svg
                                className="w-5 h-5 mr-2"
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
                              Success!
                            </span>
                          ) : (
                            "Complete Setup"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Animations */}
        <style jsx global>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(2deg);
            }
          }
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            75% {
              transform: translateX(5px);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fillProgress {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default AuthPage;
