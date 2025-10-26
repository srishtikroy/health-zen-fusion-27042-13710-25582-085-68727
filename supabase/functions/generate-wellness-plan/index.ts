import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weight, height, bmi, healthGoals, healthConditions, dietaryPreferences } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Generate a personalized wellness plan based on the following information:

User Details:
- Weight: ${weight} kg
- Height: ${height} cm
- BMI: ${bmi}
- Health Goals: ${healthGoals || "General wellness"}
- Health Conditions: ${healthConditions || "None specified"}
- Dietary Preferences: ${dietaryPreferences || "No specific preferences"}

Please provide:
1. A brief BMI analysis and what it means for this person
2. A detailed 7-day meal plan with breakfast, lunch, dinner, and snacks (considering dietary preferences)
3. A detailed 7-day workout plan suitable for their BMI and fitness goals
4. Important health tips and recommendations

Format the response in a clear, structured way with headers and bullet points.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert nutritionist and fitness coach. Provide personalized, safe, and effective wellness plans. Always remind users to consult healthcare professionals for medical advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate wellness plan");
    }

    const data = await response.json();
    const plan = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ plan }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating wellness plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
