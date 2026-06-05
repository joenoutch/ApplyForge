export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-8">
          AI Disclaimer
        </h1>

        <div className="space-y-6 text-slate-300 leading-relaxed">

          <p>
            ApplyForge uses artificial intelligence to assist users in
            improving their resumes and cover letters.
          </p>

          <p>
            While we strive for accuracy, our AI may occasionally generate:
          </p>

          <ul className="list-disc pl-8">
            <li>Incorrect wording</li>
            <li>Formatting issues</li>
            <li>Irrelevant recommendations</li>
            <li>Missing context</li>
            <li>Occasional factual inaccuracies</li>
          </ul>

          <p className="font-semibold text-red-400">
            Users are strongly encouraged to carefully review all generated
            documents before submitting them to recruiters or employers.
          </p>

          <p>
            ApplyForge is an assistance platform and does not guarantee:
          </p>

          <ul className="list-disc pl-8">
            <li>Job offers</li>
            <li>Interviews</li>
            <li>Recruiter responses</li>
            <li>Hiring decisions</li>
          </ul>

          <p>
            By using ApplyForge, you acknowledge that final responsibility
            for submitted documents remains with the user.
          </p>

        </div>
      </div>
    </main>
  );
}