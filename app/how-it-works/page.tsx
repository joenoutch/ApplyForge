export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-8">
          How ApplyForge Works
        </h1>

        <p className="text-xl text-slate-300 mb-12">
          ApplyForge helps job seekers create stronger applications in minutes.
        </p>

        <div className="space-y-10">

          <section>
            <h2 className="text-2xl font-bold mb-3">
              Step 1 — Upload your CV
            </h2>
            <p className="text-slate-300">
              Upload your current resume in PDF or DOCX format.
              Our system securely extracts your professional information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              Step 2 — Paste the job description
            </h2>
            <p className="text-slate-300">
              Paste the exact job posting you want to apply for.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              Step 3 — AI optimization
            </h2>
            <p className="text-slate-300">
              ApplyForge analyzes your CV against the job description
              and generates:
            </p>

            <ul className="list-disc pl-8 mt-4 text-slate-300">
              <li>ATS score</li>
              <li>Optimized CV</li>
              <li>Tailored cover letter</li>
              <li>Relevant keywords</li>
              <li>Professional summary</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              Step 4 — Download your document
            </h2>
            <p className="text-slate-300">
              Download your optimized application package instantly.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}