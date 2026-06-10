"use client";

import { useEffect, useState } from "react";

type GenerationResponse = {
  success?: boolean;
  generationId?: string;
  atsScore?: number;
  summary?: string;
  keywords?: string[];
  coverLetter?: string;
  error?: string;
  details?: string;
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cv) {
      setMessage("Please upload your CV.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);
    setDownloadUrl("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("jobDescription", jobDescription);
    formData.append("cv", cv);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const raw = await response.text();

      let data: GenerationResponse = {};
      try {
        data = JSON.parse(raw);
      } catch {
        data = {
          error: "Invalid API response",
          details: raw.slice(0, 300),
        };
      }

      if (!response.ok) {
        setMessage(`${data.error || "Generation failed"}: ${data.details || "No details"}`);
        return;
      }

      setResult(data);

      if (data.generationId) {
        setDownloadUrl(`/api/export/docx?id=${data.generationId}`);
      }

      setMessage("Your application preview is ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight">ApplyForge</h1>
          <p className="mt-4 text-xl text-slate-300">
            Land more interviews. Faster.
          </p>
        </div>

        <form
          onSubmit={submitForm}
          className="mt-10 space-y-6 rounded-2xl bg-white/10 p-6 shadow-2xl"
        >
          <input
            type="email"
            required
            placeholder="Your email"
            className="w-full rounded-xl bg-white p-4 text-black outline-none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <textarea
            required
            minLength={100}
            placeholder="Paste the job description here..."
            className="h-48 w-full rounded-xl bg-white p-4 text-black outline-none"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />

          <input
            type="file"
            required
            accept=".pdf,.docx"
            className="w-full rounded-xl bg-white p-4 text-black"
            onChange={(event) => setCv(event.target.files?.[0] || null)}
          />

          <label className="flex items-start gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1"
            />
            <span>
              I understand that AI-generated documents may contain errors and I will review them before submission.{" "}
              <a href="/disclaimer" className="underline hover:text-white">
                Read the AI disclaimer.
              </a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !accepted}
            className="w-full rounded-xl bg-emerald-400 px-6 py-4 font-bold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating your application..." : "Forge my application"}
          </button>

          {message && (
            <div className="rounded-xl bg-black/40 p-4 text-sm text-emerald-300">
              {message}
            </div>
          )}
        </form>

        {result && (
          <section className="mt-8 space-y-6 rounded-2xl bg-white p-6 text-black">
            <div>
              <h2 className="text-2xl font-bold">Generation Result</h2>
              <p className="mt-2 text-gray-600">
                Your optimized application preview is ready.
              </p>
            </div>

            <div className="rounded-xl bg-emerald-100 p-4">
              <p className="text-sm font-semibold text-emerald-800">ATS Score</p>
              <p className="text-4xl font-bold text-emerald-900">
                {result.atsScore ?? "N/A"}
              </p>
            </div>

            <div>
              <h3 className="font-bold">Professional Summary</h3>
              <p className="mt-2 whitespace-pre-wrap text-gray-700">
                {result.summary}
              </p>
            </div>

            <div>
              <h3 className="font-bold">ATS Keywords</h3>
              <p className="mt-2 text-gray-700">
                {Array.isArray(result.keywords)
                  ? result.keywords.join(", ")
                  : "No keywords returned"}
              </p>
            </div>

            <div>
              <h3 className="font-bold">Cover Letter Preview</h3>
              <p className="mt-2 whitespace-pre-wrap text-gray-700">
                {result.coverLetter}
              </p>
            </div>

            {downloadUrl && (
			  <div className="space-y-3">
				<a
				  href={downloadUrl}
				  className="block w-full rounded-xl bg-black px-6 py-4 text-center font-bold text-white transition hover:bg-gray-800"
				>
				  Download Optimized DOCX — Free Beta 🚀
				</a>

				<p className="text-center text-sm text-gray-500">
				  ApplyForge is currently free during public beta.
				</p>
			  </div>
			)}
          </section>
        )}
      </section>
    </main>
  );
}