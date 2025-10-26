import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Yoga wellness suggestions function called');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey 
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({ error: 'Backend configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    console.log('Attempting to get user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User auth error:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed', details: userError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!user) {
      console.error('No user found');
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('User authenticated:', user.id);

    // Fetch user profile - use default values if profile doesn't exist
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, use default values
    const userProfile = profile || {
      first_name: 'User',
      last_name: '',
      age: 'Not specified',
      height: 'Not specified',
      weight: 'Not specified',
      health_goals: 'General wellness',
      dietary_preferences: 'Not specified',
      fitness_level: 'Beginner'
    };

    console.log('User profile loaded:', { hasProfile: !!profile, userId: user.id });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    console.log('API key check:', { hasApiKey: !!LOVABLE_API_KEY });
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ 
        error: 'AI service configuration missing', 
        suggestions: 'Try refreshing the page or contact support if the issue persists.'
      }), {
        status: 200, // Return 200 with fallback message instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build personalized context
    const userContext = `
User Profile:
- Name: ${userProfile.first_name} ${userProfile.last_name || ''}
- Age: ${userProfile.age || 'Not specified'}
- Height: ${userProfile.height || 'Not specified'} cm
- Weight: ${userProfile.weight || 'Not specified'} kg
- Health Goals: ${userProfile.health_goals || 'Not specified'}
- Dietary Preferences: ${userProfile.dietary_preferences || 'Not specified'}
- Fitness Level: ${userProfile.fitness_level || 'Not specified'}
`;

    console.log('Calling AI gateway for wellness suggestions...');

    const systemPrompt = `You are a wellness AI assistant specializing in yoga, meditation, and herbal remedies. Provide personalized, actionable recommendations based on the user's profile. Keep responses concise, encouraging, and practical.

Focus on:
- Daily yoga routines tailored to fitness level and health goals
- Meditation practices for stress relief and mental clarity
- Herbal remedies and natural supplements
- Mindfulness tips and breathing exercises

Format your response in a clear, structured way with specific recommendations.`;

    let aiResponse;
    try {
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Based on this user's profile, provide personalized yoga routine and herbal wellness tips:\n${userContext}` }
          ],
        }),
      });
    } catch (fetchError) {
      console.error('AI gateway fetch error:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Failed to connect to AI service',
        suggestions: 'Unable to generate personalized suggestions at this time. Please try again later.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error response:', {
        status: aiResponse.status,
        statusText: aiResponse.statusText,
        body: errorText
      });
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Too many requests',
          suggestions: 'Rate limit exceeded. Please wait a moment and try again.'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Service unavailable',
          suggestions: 'AI service temporarily unavailable. Please try again later.'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ 
        error: 'AI service error',
        suggestions: 'Unable to generate suggestions at this time. Please try again later.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    console.log('AI response received:', { 
      hasChoices: !!aiData.choices,
      choicesLength: aiData.choices?.length 
    });
    
    const suggestions = aiData.choices?.[0]?.message?.content || 'Unable to generate suggestions at this time.';
    
    console.log('AI suggestions generated successfully');

    return new Response(JSON.stringify({ suggestions, profile: userProfile }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error in yoga-wellness-suggestions:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(JSON.stringify({ 
      error: 'Service error',
      suggestions: 'An unexpected error occurred. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 200, // Return 200 with error message instead of 500
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
