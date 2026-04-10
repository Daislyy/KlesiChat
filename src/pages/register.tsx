import { useState } from "react";
import {supabase } from "../lib/supabase";

export default function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

      const form = e.currentTarget;
      const username = (form.elements.namedItem("username") as HTMLInputElement).value;
      const email = (form.elements.namedItem("email") as HTMLInputElement).value;
      const password = (form.elements.namedItem("password") as HTMLInputElement).value;

      const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              data: {
                  username,
              }
          }
      });

      if (error) {
          setError(error.message);
      } else { window.location.href = "/login"; }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "sans-serif" }}>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float5 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .b1 { animation: float1 6s ease-in-out infinite; }
        .b2 { animation: float2 8s ease-in-out infinite 1s; }
        .b3 { animation: float3 7s ease-in-out infinite 2s; }
        .b4 { animation: float4 9s ease-in-out infinite 0.5s; }
        .b5 { animation: float5 5s ease-in-out infinite 1.5s; }

        @keyframes slideChat1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.18; }
          50% { transform: translateY(-10px) translateX(4px); opacity: 0.28; }
        }
        @keyframes slideChat2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.12; }
          50% { transform: translateY(-14px) translateX(-4px); opacity: 0.22; }
        }
        .chat1 { animation: slideChat1 7s ease-in-out infinite; }
        .chat2 { animation: slideChat2 9s ease-in-out infinite 2s; }
        .chat3 { animation: slideChat1 8s ease-in-out infinite 1s; }
      `}</style>

      {/* Left Panel */}
      <div
        className="hidden md:flex flex-1 items-center justify-center p-8 relative overflow-hidden"
        style={{ background: "#2e2e2e" }}
      >
        {/* Floating circles */}
        <div
          className="b1 absolute top-12 left-10 w-16 h-16 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="b2 absolute top-20 right-14 w-24 h-24 rounded-full"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
        <div
          className="b3 absolute bottom-20 left-20 w-12 h-12 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
        <div
          className="b4 absolute bottom-16 right-10 w-20 h-20 rounded-full"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
        <div
          className="b5 absolute top-1/2 left-6 w-8 h-8 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="b1 absolute top-1/3 right-6 w-10 h-10 rounded-full"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
        <div
          className="b3 absolute bottom-1/3 right-20 w-6 h-6 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        {/* Floating chat bubbles */}
        <div className="chat1 absolute top-1/4 left-8">
          <div
            className="rounded-2xl rounded-bl-none px-4 py-2 text-xs text-gray-400"
            style={{
              background: "rgba(255,255,255,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            but i need tell you something my heart just can't be faithful
          </div>
        </div>
        <div className="chat2 absolute bottom-1/3 left-10">
          <div
            className="rounded-2xl rounded-br-none px-4 py-2 text-xs text-gray-400"
            style={{
              background: "rgba(255,255,255,0.06)",
              whiteSpace: "nowrap",
            }}
          >
            Glimpse Of Us
          </div>
        </div>
        <div className="chat3 absolute bottom-1/4 right-8">
          <div
            className="rounded-2xl rounded-bl-none px-4 py-2 text-xs text-gray-400"
            style={{
              background: "rgba(255,255,255,0.07)",
              whiteSpace: "nowrap",
            }}
          >
            K.
          </div>
        </div>

        {/* Center content */}
        <div className="text-center relative z-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "#444" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                fill="white"
                opacity="0.8"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">KlesiChat</h1>
          <div className="w-10 h-1 bg-gray-500 mx-auto"></div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">KlesiChat</h1>
            <div className="w-10 h-1 bg-gray-400 mx-auto mt-2"></div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Username*
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                type="text"
                name="username"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Email*
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Password*
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                type="password"
                name="password"
                placeholder="Min. 8 karakter"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimal 8 karakter, huruf besar, kecil & angka
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                Register User
              </h3>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 text-base"
              >
                {isLoading ? "Processing..." : "Register"}
              </button>
            </div>
          </form>

          <div className="text-center mt-5">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-gray-700 hover:text-gray-500 font-semibold"
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
