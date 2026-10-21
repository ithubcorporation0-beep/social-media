import { NextResponse } from 'next/server';

interface TailorRequest {
  role: string;
  company: string;
  description?: string;
  language?: 'english' | 'roman_urdu';
}

export async function POST(req: Request) {
  try {
    const body: TailorRequest = await req.json();
    const { role, company, description, language = 'english' } = body;

    if (!role || !company) {
      return NextResponse.json(
        { error: 'Role and Company are required to draft tailored application assets.' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const prompt = `You are SocialHub AI Career Assistant.
Generate 3 tailored job search assets for this role:
Role: ${role}
Company: ${company}
Job Description: ${description || 'Standard senior full-stack AI development'}
Language: ${language}

Format your output strictly as a JSON object with these 3 keys:
- "cvSummary": A string with 3-4 bullet points highlighting relevant technical achievements for this role.
- "coverLetter": A complete, modern 3-paragraph cover letter tailored to the company.
- "recruiterMessage": A punchy, polite 80-word direct message to a recruiter or engineering manager.

Do not include markdown code block backticks in your output, return raw JSON only.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              cvSummary: parsed.cvSummary,
              coverLetter: parsed.coverLetter,
              recruiterMessage: parsed.recruiterMessage,
              provider: 'Google Gemini 2.0 Flash',
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini career tailor call failed, falling back to smart generator', geminiErr);
      }
    }

    // Default: Smart Tailor Generator (Zero-Friction Sandbox)
    const isRomanUrdu = language === 'roman_urdu';

    const cvSummary = isRomanUrdu
      ? `• Full-Stack AI Engineer jis ke paas Next.js 16, TypeScript aur Supabase PostgreSQL mein 4+ saal ka practical tajurba hai.
• ${company} ke ${role} role ke mutabiq server-side OAuth 2.0 aur Row-Level Security ka certified experience.
• 5+ multi-platform APIs (Meta Graph, LinkedIn REST, YouTube Data v3) ko zero secret leak architecture ke sath deploy kiya.
• Continuous integration aur clean software design ke sath scalable web apps build karne ka record.`
      : `• Senior Full-Stack Engineer with proven expertise building scalable Next.js 16, TypeScript, and Supabase cloud applications tailored for ${company}.
• Architected zero-leak server-side OAuth 2.0 integrations and multi-tenant Row-Level Security (RLS) data models.
• Built and shipped high-performance AI orchestration pipelines leveraging Gemini, Groq, and official social REST APIs.
• Strong focus on developer ergonomics, automated testing, and clean, accessible user interfaces.`;

    const coverLetter = isRomanUrdu
      ? `Dear Hiring Team at ${company},

Main ${company} mein ${role} position ke liye apply kar raha hoon. Aapki team ka technical standard aur innovative approach hamesha se inspiring raha hai.

Mere paas Next.js App Router, TypeScript, aur cloud databases ke sath scalable web applications design karne ka comprehensive tajurba hai. SocialHub AI project par kaam kartay huay maine server-side secret isolation, multi-platform OAuth token lifecycles, aur strict row-level security ko kamiyabi se implement kiya hai—jo ke ${company} ke engineering goals ke bilkul mutabiq hain.

Mujhe khushi hogi agar hum is role ke baray mein mazeed baat karein. Aapke waqt aur consideration ka bohot shukriya.

Sincerely,
Demo Operator`
      : `Dear Hiring Team at ${company},

I am writing to express my strong enthusiasm for the ${role} position at ${company}. Having followed your team's engineering work and product momentum, I am excited about the opportunity to contribute to your core platforms.

Throughout my recent work building SocialHub AI, I have focused heavily on building resilient full-stack architectures: implementing server-side OAuth 2.0 flows, enforcing multi-tenant PostgreSQL Row-Level Security (RLS), and architecting background schedulers with duplicate-job prevention. These patterns directly map to the scale and technical standards required for the ${role} position at ${company}.

I would welcome the opportunity to discuss how my background in modern web engineering and secure API integration can add immediate value to your team. Thank you for your time and consideration.

Sincerely,
Demo Operator`;

    const recruiterMessage = isRomanUrdu
      ? `Hi! Maine dekha ke aap ${company} mein ${role} ke liye hire kar rahe hain. Mere paas Next.js, TypeScript aur secure API architecture mein strong background hai. Kiya hum 10 minutes ki quick call arrange kar saktay hain? Shukriya!`
      : `Hi! I noticed you are recruiting for the ${role} position at ${company}. I specialize in full-stack Next.js, TypeScript, and secure multi-platform API systems. I would love to connect and share how my background aligns with your engineering goals!`;

    return NextResponse.json({
      cvSummary,
      coverLetter,
      recruiterMessage,
      provider: 'SocialHub AI Smart Career Engine',
    });
  } catch (error) {
    console.error('Tailor assets error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tailored application documents.' },
      { status: 500 }
    );
  }
}
