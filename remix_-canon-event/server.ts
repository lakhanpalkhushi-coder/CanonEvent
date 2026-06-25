import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not defined in the environment. AI features will run on local mock fallback.");
}

const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Simulate Future Timelines based on task data
  app.post("/api/timeline/simulate", async (req, res) => {
    const { title, description, deadline, progress } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required." });
    }

    if (!ai) {
      // Return high-quality mock fallback if API key is missing
      return res.json(getMockTimelines(title, deadline, progress));
    }

    try {
      const prompt = `Perform an ambient temporal multi-timeline simulation for a task with:
Title: "${title}"
Description: "${description || "None provided"}"
Deadline: "${deadline}"
Current Progress: ${progress}%

Generate 3 alternative futures based on procrastination degrees:
1. Timeline A (The Sacred Timeline): Starting immediately. High success, low stress, optimized efficiency.
2. Timeline B (The Nexus Path): Delayed start (procrastinated slightly). Moderate success, elevated stress, compressed work quality.
3. Timeline C (The Absolute Point - Canon Event): Extreme procrastination, leaving all work to the final minutes. High risk of catastrophic failure, ultimate stress, panic details.

Be vivid, realistic, slightly dramatic (in a gamified science-fiction temporal way), and highly practical. Provide a day-by-day or step-by-step stress progression for each timeline.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a Temporal Chrono-Navigator AI. You predict task failure probabilities and project future stress levels with hyper-realistic granularity. Always respond in valid JSON matching the specified schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Array of exactly 3 simulated timelines (type A, B, and C)",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Must be 'A', 'B', or 'C' exactly" },
                name: { type: Type.STRING, description: "A creative sci-fi sounding timeline title (e.g., 'The Optimized Path', 'The Compressed Pivot', 'The Timeline Fracture')" },
                probability: { type: Type.INTEGER, description: "Probability percentage of successful task completion (0 to 100)" },
                stressLevel: { type: Type.INTEGER, description: "Average subjective stress level percentage (0 to 100)" },
                description: { type: Type.STRING, description: "A high-level summary of how this timeline unfolds" },
                consequences: { type: Type.STRING, description: "What happens to the user's reputation, sleep, mental state, and final deliverable in this future" },
                dayByDayPlan: {
                  type: Type.ARRAY,
                  description: "A chronological timeline of milestones or days showing the action and stress spike",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING, description: "Milestone or timeframe label (e.g., 'Day 1', 'Day 3', '12 Hours left', 'The Eleventh Hour')" },
                      action: { type: Type.STRING, description: "The specific state of activity or panic" },
                      stressLevel: { type: Type.INTEGER, description: "Stress level on this specific milestone (0 to 100)" }
                    },
                    required: ["day", "action", "stressLevel"]
                  }
                }
              },
              required: ["type", "name", "probability", "stressLevel", "description", "consequences", "dayByDayPlan"]
            }
          }
        }
      });

      const responseText = response.text || "[]";
      const timelines = JSON.parse(responseText.trim());
      res.json(timelines);
    } catch (error) {
      console.error("Gemini Timeline Simulation Error:", error);
      res.status(500).json({ error: "Failed to simulate timelines. Please verify your Gemini API Key or try again later.", details: String(error) });
    }
  });

  // API 2: Subdivide task into micro-missions ("Lock In")
  app.post("/api/task/subdivide", async (req, res) => {
    const { title, description, timelineType } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required." });
    }

    if (!ai) {
      return res.json(getMockMissions(title));
    }

    try {
      const prompt = `The user is 'Locking In' to complete the task: "${title}".
Description: "${description || "None"}"
Timeline Focus: Timeline ${timelineType || 'A'} (A: Sacred, B: Nexus, C: Extreme Crisis).

Break this major task down into exactly 4 or 5 bite-sized, actionable 'Micro-Missions'. Each mission should be an extremely concrete action that takes less than an hour, designed to completely bypass procrastination freeze.

For Timeline C, make the missions look like 'Emergency Damage Control' steps.
For Timeline A, make them look like 'Sovereign Mastery' milestones.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a tactical operations commander that breaks major blocks into instantly executable high-vibe missions. Respond ONLY with a valid JSON array matching the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "An actionable, punchy command (e.g. 'Setup database schema with 3 collections')" },
                difficulty: { type: Type.STRING, description: "Must be 'Easy', 'Medium', or 'Hard' only" },
                estimatedMinutes: { type: Type.INTEGER, description: "Estimated time in minutes (15 to 90)" }
              },
              required: ["title", "difficulty", "estimatedMinutes"]
            }
          }
        }
      });

      const responseText = response.text || "[]";
      const missions = JSON.parse(responseText.trim());
      res.json(missions);
    } catch (error) {
      console.error("Gemini Task Subdivide Error:", error);
      res.status(500).json({ error: "Failed to generate micro-missions.", details: String(error) });
    }
  });

  // API 3: Daily Reflection Replay & Coaching Module
  app.post("/api/reflection/generate", async (req, res) => {
    const { completedCount, totalCount, activeTasks } = req.body;

    if (!ai) {
      return res.json(getMockReflection(completedCount, totalCount));
    }

    try {
      const prompt = `Analyze the user's temporal activity state for their active projects:
Completed Micro-Missions: ${completedCount} out of ${totalCount}.
Active Tasks context: ${JSON.stringify(activeTasks || [])}

Provide a deep temporal diagnostic reflection. Speak as an ancient, incredibly perceptive, slightly sassy yet deeply encouraging Temporal Overseer who watches their timelines. Explain how their current actions are shifting their timeline trajectory (e.g. are they heading towards Timeline C collapse, or locked into the Sacred Timeline?). Give a specific, deeply wise, actionable piece of advice to dodge tomorrow's canon event.
Additionally, include an AI-powered coaching module analysis identifying their procrastination triggers, personalized empathetic advice, short actionable tips, and a motivational message.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a vintage sci-fi Terminal Observer and psychological behavioral coach analyzing human temporal drifts. Always return a valid JSON object matching the exact schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              procrastinationIndex: { type: Type.INTEGER, description: "A calculated score from 0 (Perfect execution) to 100 (Absolute procrastination disaster)" },
              futureSelfLog: { type: Type.STRING, description: "A highly immersive, deeply engaging log written as a cosmic terminal or future-self diary entry" },
              actionableTip: { type: Type.STRING, description: "One single killer psychological hack or tip to completely bypass current friction" },
              coachingAdvice: {
                type: Type.OBJECT,
                properties: {
                  procrastinationTriggers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Procrastination triggers identified in current behavior (e.g., 'Imposter Syndrome', 'Perfectionist Paralysis', 'Micro-distractions')"
                  },
                  personalizedAdvice: { type: Type.STRING, description: "Personalized, deeply empathetic advice to help them stay on track" },
                  actionableTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Short, highly actionable tips"
                  },
                  motivationalMessage: { type: Type.STRING, description: "Encouraging, inspiring motivational message tailored to their specific blockages" }
                },
                required: ["procrastinationTriggers", "personalizedAdvice", "actionableTips", "motivationalMessage"]
              }
            },
            required: ["procrastinationIndex", "futureSelfLog", "actionableTip", "coachingAdvice"]
          }
        }
      });

      const responseText = response.text || "{}";
      const reflection = JSON.parse(responseText.trim());
      res.json(reflection);
    } catch (error) {
      console.error("Gemini Reflection Error:", error);
      res.status(500).json({ error: "Failed to generate reflection.", details: String(error) });
    }
  });

  // API 3.5: AI Temporal Diagnostics Hub (Comprehensive analysis)
  app.post("/api/temporal/diagnostics", async (req, res) => {
    const { title, description, deadline, progress } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required." });
    }

    if (!ai) {
      return res.json(getMockDiagnostics(title, deadline, progress));
    }

    try {
      const prompt = `Perform a profound multi-perspective temporal diagnostic evaluation for the task:
Title: "${title}"
Description: "${description || "None provided"}"
Deadline: "${deadline}"
Current Progress: ${progress}%

You are NOT an AI assistant. You must generate content from multiple specialized sub-engines:
1. "Future Self Transmission": Communicating from an alternate failed timeline that already exists. First person, mention specific consequences, emotionally believable, avoid generic motivation, include details that make the future feel real, remembers exactly how the failure happened. Include timelineId, currentDate, transmission text, the mistake, what they feel, and what can still be changed today, and a chilling warning.
2. "Temporal Failure Prediction Engine": Identify the single most likely Canon Event that will occur if they continue current trajectory. Include canonEventName, pointOfNoReturn, chainOfDecisions, temporalConsequences, emotionalConsequences, projectConsequences, successProbabilityAfterEvent. Make it feel inevitable, tracing the exact chain of decisions.
3. "Observer Unit O-17": Cold, scientific, slightly sarcastic classified observer report looking from outside linear time. Include observedBehavior, timelineDrift, riskIndicators, predictedFailureModes, anomalies, recommendedIntervention.
4. "Temporal Replay Engine": Reconstruct the exact sequence of decisions that led to failure (e.g. Day 1, Day 2, Day 3) with decisionTaken, immediateEffect, hiddenConsequence.
5. "Timeline Recovery AI": Emergency mission control plan to prevent timeline collapse. Break tasks into absurdly small, executable actions for next 15 mins, next 60 mins, next 24 hours, non-essential tasks to eliminate, and success probability after intervention.
6. "Urgent Spoken Message": A conversational urgent message of strictly 50-80 words from future self trying to alter past.
7. "Canon Core": Cinematic live-stage temporal analysis with currentTrajectory, timelineStability, primaryThreat, projectedCanonEvent, futureSelfWarning, recoveryProbability.
8. "Coaching Advice": empathetic coach advice, triggers, short tips, motivational message.
9. "Salvaged Resources": Offer 3 real, highly relevant resources (libraries, articles, tutorials, official documentation) based on their specific task, with titles, descriptions, and helpful advice on how they reduce perceived workload.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          futureSelfTransmission: {
            type: Type.OBJECT,
            properties: {
              timelineId: { type: Type.STRING, description: "A unique sci-fi timeline ID (e.g., Timeline C-104.9)" },
              currentDate: { type: Type.STRING, description: "Future date of failure" },
              transmission: { type: Type.STRING, description: "A transmission from the future self. First person, mention specific consequences, emotionally believable, avoid generic motivation." },
              mistake: { type: Type.STRING, description: "A specific concrete mistake they remember making" },
              feeling: { type: Type.STRING, description: "What they are feeling in that failed future" },
              changeable: { type: Type.STRING, description: "What can still be changed by the user today" },
              warning: { type: Type.STRING, description: "A chilling warning to end the transmission" }
            },
            required: ["timelineId", "currentDate", "transmission", "mistake", "feeling", "changeable", "warning"]
          },
          failurePrediction: {
            type: Type.OBJECT,
            properties: {
              canonEventName: { type: Type.STRING, description: "A dramatic, inevitable-sounding name for the Canon Event" },
              pointOfNoReturn: { type: Type.STRING, description: "The specific moment/date of no return" },
              chainOfDecisions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exact sequential decisions leading to failure" },
              temporalConsequences: { type: Type.STRING, description: "What happens to time and stability" },
              emotionalConsequences: { type: Type.STRING, description: "How the user is affected emotionally" },
              projectConsequences: { type: Type.STRING, description: "What happens to the final project deliverables" },
              successProbabilityAfterEvent: { type: Type.INTEGER, description: "Percentage from 0 to 100" }
            },
            required: ["canonEventName", "pointOfNoReturn", "chainOfDecisions", "temporalConsequences", "emotionalConsequences", "projectConsequences", "successProbabilityAfterEvent"]
          },
          observerReport: {
            type: Type.OBJECT,
            properties: {
              observedBehavior: { type: Type.STRING },
              timelineDrift: { type: Type.STRING },
              riskIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              predictedFailureModes: { type: Type.ARRAY, items: { type: Type.STRING } },
              anomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedIntervention: { type: Type.STRING }
            },
            required: ["observedBehavior", "timelineDrift", "riskIndicators", "predictedFailureModes", "anomalies", "recommendedIntervention"]
          },
          replayLog: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "e.g. Day 1, Day 2" },
                decisionTaken: { type: Type.STRING },
                immediateEffect: { type: Type.STRING },
                hiddenConsequence: { type: Type.STRING }
              },
              required: ["day", "decisionTaken", "immediateEffect", "hiddenConsequence"]
            }
          },
          recoveryPlan: {
            type: Type.OBJECT,
            properties: {
              criticalPath: { type: Type.ARRAY, items: { type: Type.STRING } },
              next15Minutes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Absurdly small actions that are executable immediately" },
              next60Minutes: { type: Type.ARRAY, items: { type: Type.STRING } },
              next24Hours: { type: Type.ARRAY, items: { type: Type.STRING } },
              nonEssentialTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
              successProbabilityAfterIntervention: { type: Type.INTEGER }
            },
            required: ["criticalPath", "next15Minutes", "next60Minutes", "next24Hours", "nonEssentialTasks", "successProbabilityAfterIntervention"]
          },
          spokenMessage: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "A spoken conversational urgent message, strictly 50-80 words" }
            },
            required: ["text"]
          },
          canonCore: {
            type: Type.OBJECT,
            properties: {
              currentTrajectory: { type: Type.STRING },
              timelineStability: { type: Type.INTEGER },
              primaryThreat: { type: Type.STRING },
              projectedCanonEvent: { type: Type.STRING },
              futureSelfWarning: { type: Type.STRING },
              recoveryProbability: { type: Type.INTEGER }
            },
            required: ["currentTrajectory", "timelineStability", "primaryThreat", "projectedCanonEvent", "futureSelfWarning", "recoveryProbability"]
          },
          coachingAdvice: {
            type: Type.OBJECT,
            properties: {
              procrastinationTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
              personalizedAdvice: { type: Type.STRING },
              actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              motivationalMessage: { type: Type.STRING }
            },
            required: ["procrastinationTriggers", "personalizedAdvice", "actionableTips", "motivationalMessage"]
          },
          salvagedResources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Resource title (e.g. documentation, template, API ref)" },
                url: { type: Type.STRING, description: "A real helpful URL (e.g., official docs, npm package site, standard reference)" },
                description: { type: Type.STRING },
                value: { type: Type.STRING, description: "Why this reduces perceived workload" }
              },
              required: ["title", "url", "description", "value"]
            }
          }
        },
        required: [
          "futureSelfTransmission", 
          "failurePrediction", 
          "observerReport", 
          "replayLog", 
          "recoveryPlan", 
          "spokenMessage", 
          "canonCore", 
          "coachingAdvice", 
          "salvagedResources"
        ]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a Temporal Failure Prediction Engine and Multiverse Simulation System. Generate all diagnostics matching the responseSchema.",
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      const responseText = response.text || "{}";
      const diagnostics = JSON.parse(responseText.trim());
      res.json(diagnostics);
    } catch (error) {
      console.error("Gemini Diagnostics Error:", error);
      res.status(500).json({ error: "Failed to generate comprehensive diagnostics.", details: String(error) });
    }
  });

  // API 4: Pitch deck custom judge response
  app.post("/api/judge/qa", async (req, res) => {
    const { question, category } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    if (!ai) {
      return res.json({
        answer: "This is a pre-baked response: In Canon Event, we secure our API keys completely server-side. We use a full-stack architecture with standard Express endpoints proxying to Gemini. This keeps credentials hidden from the client, resolving a key risk other standard hackathon teams neglect.",
        keyTakeaway: "Security is baked into the foundation, not bolted on."
      });
    }

    try {
      const prompt = `A tough hackathon judge is asking a question in the category: "${category || "General"}".
Question: "${question}"

Provide a world-class, punchy, confident startup founder pitch-response that completely wins over the judges. Optimize for clarity, technical authority, and business feasibility. Highlight how Canon Event uses the Gemini API on the server side securely to solve a massive cognitive and behavioral issue (procrastination panic). Keep it under 100 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a legendary Silicon Valley pitch coach and serial hackathon champion. Always respond with a valid JSON object with 'answer' and 'keyTakeaway' fields.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING, description: "The ultimate 1-paragraph verbal response to the judge." },
              keyTakeaway: { type: Type.STRING, description: "A 1-sentence killer takeaway or bumper sticker quote." }
            },
            required: ["answer", "keyTakeaway"]
          }
        }
      });

      const responseText = response.text || "{}";
      const qaResponse = JSON.parse(responseText.trim());
      res.json(qaResponse);
    } catch (error) {
      console.error("Gemini Judge Q&A Error:", error);
      res.status(500).json({ error: "Failed to generate pitch response." });
    }
  });

  // Serve static assets or mount Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Canon Event Server] Running securely on port ${PORT}`);
  });
}

// ======================== LOCAL FALLBACKS ========================

function getMockTimelines(title: string, deadline: string, progress: number) {
  return [
    {
      type: "A",
      name: "The Sacred Timeline (Optimized Path)",
      probability: 95,
      stressLevel: 15,
      description: "You start the task immediately in a structured cadence. Your cognitive load remains optimal, giving you deep flow states and ample buffer for revisions.",
      consequences: "A high-quality, polished product. No sleep loss, flawless presentation, and 100% confidence from stakeholders. You've conquered the resistance.",
      dayByDayPlan: [
        { day: "Phase 1: Setup", action: "Establish core directories and structure. Energy is high.", stressLevel: 10 },
        { day: "Phase 2: Core Logic", action: "Flesh out business models and database queries with room to spare.", stressLevel: 15 },
        { day: "Phase 3: Visual Polish", action: "Apply Tailwind transitions, micro-interactions, and color contrast passes.", stressLevel: 20 },
        { day: "Deadline Eve", action: "Deploy, run full lint passes, and record a flawless demo. Early sleep.", stressLevel: 10 }
      ]
    },
    {
      type: "B",
      name: "The Nexus Path (Delayed Pivot)",
      probability: 65,
      stressLevel: 55,
      description: "You stall for a few days, convincing yourself 'I work better under pressure.' You start midway. Minor compromises are made on visual aesthetics and edge-case error handling.",
      consequences: "A functional but average deliverable. High caffeine intake, moderate sleep deprivation (4-5 hours), and nagging anxiety that you could have done better.",
      dayByDayPlan: [
        { day: "Phase 1: Delay", action: "You tell yourself you have plenty of time. Code is untouched.", stressLevel: 15 },
        { day: "Phase 2: Wakeup", action: "Panic sets in. You build the MVP in a single sitting, missing edge cases.", stressLevel: 45 },
        { day: "Deadline Eve", action: "Deploying last minute. Some CSS alignment is off, but it runs.", stressLevel: 75 }
      ]
    },
    {
      type: "C",
      name: "The Absolute Point (Canon Event Collapse)",
      probability: 25,
      stressLevel: 98,
      description: "Procrastination freeze holds you until the absolute last 12 hours. You are forced into a blind, panic-fueled coding marathon with zero testing, leading to severe code entropy.",
      consequences: "High probability of complete submission failure (e.g. server crash during live evaluation, missing files). Critical sleep loss, cognitive impairment, and immense dread.",
      dayByDayPlan: [
        { day: "Phase 1: Freeze", action: "Complete denial. Scrolling social media. Absolute deadline paralysis.", stressLevel: 40 },
        { day: "12 Hours Left", action: "Adrenaline spike. Typing code furiously while drinking energy drinks. Logic errors emerge.", stressLevel: 85 },
        { day: "The Eleventh Hour", action: "Build fails with missing imports! Trying to hotfix while the form closing timer ticks down.", stressLevel: 99 }
      ]
    }
  ];
}

function getMockMissions(title: string) {
  return [
    { title: "Define a clean state engine for your timeline metrics", difficulty: "Easy", estimatedMinutes: 20 },
    { title: "Craft an interactive timeline rendering card in Tailwind", difficulty: "Medium", estimatedMinutes: 40 },
    { title: "Connect server-side Express endpoints to handle predictions", difficulty: "Medium", estimatedMinutes: 45 },
    { title: "Implement a vintage sci-fi styling aesthetic wrapper", difficulty: "Hard", estimatedMinutes: 60 }
  ];
}

function getMockReflection(completed: number, total: number) {
  const index = total > 0 ? Math.round(((total - completed) / total) * 100) : 50;
  let log = "";
  let tip = "";

  if (index < 30) {
    log = "OBSERVER REPORT: User is locked onto the Sacred Timeline. Cognitive performance is standard-optimal. The timeline barrier remains stable. Your future self is nodding in quiet approval.";
    tip = "Maintain the velocity. Avoid taking a massive break that triggers momentum loss.";
  } else if (index < 70) {
    log = "WARNING: Temporal drift detected. The Nexus Path is pulling you. Minor compromises in timeline integrity are accumulating. Starting 1 hour earlier tomorrow will push success rate back up by 30%.";
    tip = "Apply the '10-Minute Rule': Open the file and edit exactly two lines of code, then allow yourself to stop if needed.";
  } else {
    log = "ALERT: CRITICAL CHRONO-FRACTURE! Procrastination freeze is triggering a Timeline C collapse sequence. Tomorrow's Canon Event is in absolute motion. Urgent intervention required.";
    tip = "Delete your tabs. Shut down your phone. Open a blank document and complete just ONE micro-mission immediately.";
  }

  return {
    procrastinationIndex: index,
    futureSelfLog: `[SYSTEM DIAGNOSTIC Log: T-Minus 2 Days]\n${log}`,
    actionableTip: tip,
    coachingAdvice: {
      procrastinationTriggers: [
        "Aesthetic perfectionism",
        "Scope anxiety",
        "Task initiation friction"
      ],
      personalizedAdvice: "You are doing great, but the timeline shows a slight hesitation. Remember, shipping an imperfect draft is the only way to build confidence. We are in this together.",
      actionableTips: [
        "Complete just one small micro-task right now.",
        "Turn off phone notifications for the next 25 minutes."
      ],
      motivationalMessage: "Your future self remembers this exact moment as the pivot point where we chose to focus and win. You can do this!"
    }
  };
}

function getMockDiagnostics(title: string, deadline: string, progress: number) {
  return {
    futureSelfTransmission: {
      timelineId: "Timeline C-824.1",
      currentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      transmission: `I am writing this from a dark, silent room in the post-deadline timeline. If you are reading this, there is still time. I remember sitting exactly where you are, scrolling through tabs, thinking 'I have plenty of time to finish "${title}".' But you don't. Within 48 hours, the deadline arrived. I panicked, stayed up for 38 hours straight, and the final build broke on deployment due to a single missing API proxy key. It was a humiliating collapse.`,
      mistake: "Sinking 4 hours into re-organizing your CSS files instead of setting up the server routes.",
      feeling: "A mixture of bitter exhaustion and total regret. You see others ship their clean demos while your screen sits empty.",
      changeable: "You still have time to build the API proxy correctly right now. Don't touch the styles yet.",
      warning: "Do not close your editor tonight without completing at least one server route. The drift has already begun."
    },
    failurePrediction: {
      canonEventName: `The Eleventh-Hour ${title.substring(0, 15)} Deployment Freeze`,
      pointOfNoReturn: `${deadline} at 11:30 PM`,
      chainOfDecisions: [
        "Snoozing the calendar event twice because 'inspiration hasn't hit yet'",
        "Spending 2 hours browsing UI components on Twitter instead of coding",
        "Writing 200 lines of complex client-side code without running a local compile test",
        "Experiencing a dependency conflict 30 minutes before submission with no time left to debug"
      ],
      temporalConsequences: "Timeline collapse. The Sacred trajectory diverges into 98% panic load.",
      emotionalConsequences: "Extreme burnout, severe sleep loss, and lingering impostor syndrome.",
      projectConsequences: "The applet refuses to render inside the frame, causing judges to pass immediately.",
      successProbabilityAfterEvent: 12
    },
    observerReport: {
      observedBehavior: "Subject spent 52 minutes adjusting visual borders while the core data handler was missing.",
      timelineDrift: "Divergence from Sacred Path currently stands at +42.4%.",
      riskIndicators: [
        "High degree of tab accumulation",
        "Repeated manual calendar cancellations",
        "Caffeine consumption exceeding baseline safety metrics"
      ],
      predictedFailureModes: [
        "Compilation failure on Vite build phase due to uncaught TypeScript types",
        "Stale dev server hanging"
      ],
      anomalies: [
        "A sudden, unexplained burst of energy spent cleaning the desk"
      ],
      recommendedIntervention: "Execute immediate chronological locking. Subdivide current step into a 15-minute micro-mission."
    },
    replayLog: [
      {
        day: "Day 1",
        decisionTaken: "Postponed setting up the Express backend, deciding to focus on polishing the dashboard header styles first.",
        immediateEffect: "A highly aesthetically pleasing navigation header, giving a false sense of immense progress.",
        hiddenConsequence: "The core data engine remained non-existent, leaving zero time to test the Gemini API call integration."
      },
      {
        day: "Day 2",
        decisionTaken: "Decided to start coding after midnight because 'that is when my brain works best.'",
        immediateEffect: "Wrote complex state managers while highly fatigued, introducing 3 subtle type conflicts.",
        hiddenConsequence: "Wakeup time delayed by 4 hours, losing a full day of active deployment assistance."
      },
      {
        day: "Submission Eve",
        decisionTaken: "Tried to bundle the application using custom scripts without testing the standard npm run build command.",
        immediateEffect: "Vite build crashed with three unhandled import errors.",
        hiddenConsequence: "Absolute panic. The submission window closed while trying to troubleshoot package versions."
      }
    ],
    recoveryPlan: {
      criticalPath: [
        "Initialize the Express server routes and bind to host 0.0.0.0",
        "Import types.ts and verify there are zero compile errors"
      ],
      next15Minutes: [
        "Shut down Slack, Discord, and all background browser tabs",
        "Write exactly one simple function declaration in your component"
      ],
      next60Minutes: [
        "Implement the form submit handler and link it to the backend",
        "Run 'npm run build' once to ensure compiler is green"
      ],
      next24Hours: [
        "Complete the secondary visual panels",
        "Record a draft 3-minute demo video to lock in your submission"
      ],
      nonEssentialTasks: [
        "Redesigning the logo illustration",
        "Adding a 4th dark-mode preset palette options",
        "Re-organizing local files"
      ],
      successProbabilityAfterIntervention: 95
    },
    spokenMessage: {
      text: "Listen to me very carefully. You are about to close this editor and tell yourself you will finish the backend tomorrow. Do not do it. Tomorrow, you will wake up with a migraine, and the internet will go down for three hours. Open server.ts right now and complete the route. Just that one route. Alter the timeline while you still can."
    },
    canonCore: {
      currentTrajectory: "Highly unstable. Procrastination indexes are rising steadily.",
      timelineStability: 38,
      primaryThreat: "The deadline freeze paralysis loop.",
      projectedCanonEvent: "A catastrophic Vite compilation error 15 minutes before the submission form closes.",
      futureSelfWarning: "I woke up in a timeline where we didn't submit. The regret is heavy. Fix this now.",
      recoveryProbability: 78
    },
    coachingAdvice: {
      procrastinationTriggers: [
        "Overwhelm paralysis from high project scope",
        "Perfectionism leading to visual stalling",
        "Action bias towards low-value style tasks"
      ],
      personalizedAdvice: "You are experiencing high anxiety because you care deeply about shipping a brilliant project. That is beautiful, but do not let it freeze you. A working, simple draft is infinitely superior to a perfect, non-existent masterpiece.",
      actionableTips: [
        "Use the 10-Minute Rule: click 'Subdivide' and complete just one 15-minute mission.",
        "Compile early and compile often to keep the feedback loop tight."
      ],
      motivationalMessage: "I believe in your vision. Your future self is waiting to celebrate a successful submission with you. Let's make it happen."
    },
    salvagedResources: [
      {
        title: "Official Tailwind CSS Guide",
        url: "https://tailwindcss.com/docs",
        description: "Official documentation for fast, responsive utility-first layout styling.",
        value: "Provides direct copy-paste classes to skip custom CSS writing entirely."
      },
      {
        title: "Express v4 Router Documentation",
        url: "https://expressjs.com/en/guide/routing.html",
        description: "Standard guides for defining backend API endpoints securely.",
        value: "Contains robust examples of parsing query bodies without complex setups."
      },
      {
        title: "Lucide React Icon Reference",
        url: "https://lucide.dev/icons",
        description: "A comprehensive list of searchable vector icon imports for UI design.",
        value: "Allows quick visual identity creation without custom SVG assets."
      }
    ]
  };
}

startServer();

