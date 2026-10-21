import { NextResponse } from 'next/server';
import { PlatformId } from '@/types/dashboard';

interface GenerateRequest {
  topic: string;
  platform: PlatformId;
  mode: 'caption' | 'hooks' | 'hashtags' | 'ideas' | 'description';
  style: 'professional' | 'casual' | 'business' | 'personal';
  language: 'english' | 'roman_urdu' | 'bilingual';
}

export async function POST(req: Request) {
  try {
    const body: GenerateRequest = await req.json();
    const { topic, platform, mode, style, language } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: 'Topic or content prompt is required.' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // Build system instruction according to platform, style, mode, and language
    const systemPrompt = `You are SocialHub AI, an expert social media manager and copywriter.
Target Platform: ${platform}
Output Mode: ${mode}
Writing Style: ${style}
Language: ${language} (Note: if Roman Urdu, write Urdu in Latin/English alphabet phonetically, e.g., 'Yeh naya feature aapke kaam ko bohot asaan bana dega').

Platform specific rules:
- LinkedIn: Focus on industry insights, professional storytelling, clean line breaks, high-converting hook, 3-5 relevant hashtags.
- X (Twitter): STRICTLY limit post to under 270 characters, punchy, high-engagement hook.
- Instagram: Engaging first line, conversational story, spaced paragraphs, relevant hashtag block (8-12 tags).
- Facebook: Friendly community tone, encourage discussion, question at the end.
- YouTube: Engaging video title, structured description with key takeaways, timestamps placeholders, and tags.

Generate structured, ready-to-publish content based on the user topic.`;

    // If Gemini API key is configured, call official Gemini 2.0 / 1.5 Flash
    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: systemPrompt },
                    { text: `Topic/Prompt: ${topic}` },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText =
            data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (generatedText) {
            return NextResponse.json({
              content: generatedText,
              provider: 'Google Gemini 2.0 Flash',
              isLiveAi: true,
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to smart generator', geminiErr);
      }
    }

    // Intelligent built-in generator when API keys are not yet configured in .env
    const fallbackContent = generateSmartContent(topic, platform, mode, style, language);

    return NextResponse.json({
      content: fallbackContent,
      provider: 'SocialHub AI Smart Engine (Demo Mode)',
      isLiveAi: false,
      notice: 'Configure GEMINI_API_KEY in your local .env file to enable live model inference.',
    });
  } catch (error) {
    console.error('Error generating AI content:', error);
    return NextResponse.json(
      { error: 'Failed to process AI generation request.' },
      { status: 500 }
    );
  }
}

function generateSmartContent(
  topic: string,
  platform: PlatformId,
  mode: string,
  style: string,
  language: string
): string {
  const isRomanUrdu = language === 'roman_urdu';
  const isBilingual = language === 'bilingual';

  if (mode === 'hooks') {
    if (isRomanUrdu) {
      return `Viral Hooks for: ${topic}

1. "90% log ${topic} mein yeh ghalti kartay hain (aur iska hal bohot simple hai)..."
2. "Agar aap 2026 mein ${topic} seekhna chahtay hain, toh pehle yeh 3 baatein zaroor samajh lein:"
3. "Maine pichlay 6 maah mein ${topic} par experiment kiya, aur natija hairan kun tha:"
4. "Kiya aap ko pata hai ke ${topic} ka sabse bara secret kiya hai? Chalein detail mein dekhtay hain:"
5. "Ek aisi strategy jo aapki ${topic} workflow ko 10x behtar bana sakti hai:"`;
    }
    return `Viral Hooks for: ${topic}

1. "90% of creators get ${topic} completely wrong. Here is the framework that changes everything:"
2. "I spent 6 months testing different approaches to ${topic}. The results surprised me:"
3. "If you are starting with ${topic} in 2026, bookmark this 3-step checklist first:"
4. "The uncomfortable truth about ${topic} that most experts refuse to talk about:"
5. "Stop overcomplicating ${topic}. Here is the streamlined system I use daily:"`;
  }

  if (mode === 'hashtags') {
    const cleanTopic = topic.replace(/\s+/g, '');
    if (platform === 'x') {
      return `#${cleanTopic} #Tech #CareerGrowth #Innovation`;
    }
    if (platform === 'instagram') {
      return `#${cleanTopic} #TechTips #ContentCreation #DigitalStrategy #ProductivityHacks #Innovation #${cleanTopic}Community #CareerJourney #DailyInspiration #GrowthMindset`;
    }
    return `#${cleanTopic} #Leadership #Productivity #Technology #ProfessionalDevelopment`;
  }

  if (mode === 'ideas') {
    if (isRomanUrdu) {
      return `Content Calendar Ideas for: ${topic}

💡 Idea 1: Case Study breakdown — "${topic} ki real-world example aur practical implementation."
💡 Idea 2: Common Mistakes — "3 aisi ghaltiyan jo ${topic} mein log aksar kartay hain."
💡 Idea 3: Step-by-Step Guide — "Beginner se advanced tak: ${topic} ka complete roadmap."
💡 Idea 4: Contrarian View — "Kiya ${topic} waqai mushkil hai ya sirf hype hai?"
💡 Idea 5: Quick Tips Checklist — "5 quick hacks jo aap aaj hi apni workflow mein use kar saktay hain."`;
    }
    return `Content Calendar Ideas for: ${topic}

💡 Idea 1: The Breakdown — "How modern workflows solve ${topic} without unnecessary complexity."
💡 Idea 2: The Myth vs. Reality — "3 pervasive myths around ${topic} and the real data behind them."
💡 Idea 3: The Playbook — "A step-by-step roadmap for mastering ${topic} from scratch."
💡 Idea 4: The Tool Stack — "The essential tools and frameworks making ${topic} 10x faster."
💡 Idea 5: Lessons Learned — "What 100+ hours of experience with ${topic} taught our engineering team."`;
  }

  if (mode === 'description') {
    return `📌 Video Title: The Ultimate Guide to ${topic} (2026 Walkthrough)

In this video, we break down everything you need to know about ${topic}. From foundational principles to production-ready workflows, follow along step-by-step.

⏱️ Timestamps:
0:00 - Introduction & Overview
1:30 - Core Architecture of ${topic}
4:15 - Practical Hands-on Demonstration
8:45 - Key Security & Performance Considerations
12:10 - Next Steps & Summary

🔗 Useful Links & Resources:
• Official Documentation: https://socialhub.local/docs
• Follow for weekly deep-dives

#${topic.replace(/\s+/g, '')} #Tutorial #TechGuide`;
  }

  // Default: Captions / Full Post
  if (isRomanUrdu) {
    if (platform === 'x') {
      return `${topic} ke baray mein ek aham baat:\n\nKamiyabi ka raaz consistent practice aur sahi system mein hai. Agar aap daily 1% behtar hotay hain toh natija zabardast hoga!\n\n#${topic.replace(/\s+/g, '')} #Growth`;
    }
    return `Ajj hum baat karenge ${topic} ke baray mein jo har creator aur professional ke liye zaroori hai.\n\nAksar log samjhte hain ke is mein bohot waqt lagta hai, lekin agar aapke paas sahi tools aur ek organized workflow ho toh yeh process bohot aasan ho jata hai.\n\nTeen ahem baatein yaad rakhein:\n1. Hamesha basic principles se shuru karein.\n2. Rozana choti choti progress par focus karein.\n3. Apne workflow ko automate karein taake waqt bache.\n\nAap is baray mein kiya sochtay hain? Comments mein zaroor share karein!\n\n#${topic.replace(/\s+/g, '')} #UrduCreators #Productivity`;
  }

  if (isBilingual) {
    return `English:\nMastering ${topic} is all about having a structured system rather than relying on guesswork. Focus on steady, daily progress.\n\nRoman Urdu:\n${topic} mein kamiyabi ka raaz ek structured system hai. Rozana choti choti progress par focus karein aur consistent rahein.\n\n#${topic.replace(/\s+/g, '')} #BilingualContent #CareerGrowth`;
  }

  // English default by platform
  if (platform === 'x') {
    return `Mastering ${topic} comes down to one principle: consistency beats intensity every time.\n\nFocus on daily 1% compounding and building sustainable habits.\n\nWhat is your biggest focus this week? #${topic.replace(/\s+/g, '')}`;
  }

  if (platform === 'linkedin') {
    return `Transitioning our approach to ${topic} taught our team three invaluable lessons:\n\n1. Strategy precedes execution: Without clear alignment, effort gets dissipated.\n2. Automate the routine: Protect your creative energy for high-leverage decisions.\n3. Measure what matters: Focus on verified outcomes rather than vanity metrics.\n\nAs we head deeper into 2026, how is your team approaching ${topic} in your day-to-day operations?\n\n#${topic.replace(/\s+/g, '')} #Leadership #EngineeringExcellence #ContinuousImprovement`;
  }

  if (platform === 'instagram') {
    return `Everything you need to know about ${topic} in one glance 🚀\n\nWhen we started out, we thought more tools meant better results. The truth? A simplified, focused workflow wins every single time.\n\nSwipe through the carousel for the 3-step breakdown 📲\n\nSave this post for your next planning session!\n\n#${topic.replace(/\s+/g, '')} #ProductivityTips #ContentCreator #DigitalStrategy #TechWorkflow`;
  }

  return `Here is a complete breakdown of ${topic} and why it matters right now:\n\nWhether you are an independent creator or building within an engineering team, having a disciplined framework for ${topic} saves hours of wasted effort.\n\nKey takeaways:\n• Streamlined workflow\n• Verified consistency\n• Continuous feedback loops\n\nWhat has been your experience with this? Share your thoughts below!`;
}
