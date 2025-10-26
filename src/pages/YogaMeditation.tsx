import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, Clock, Star, HandMetal, Sparkles, Loader2 } from "lucide-react";
import meditationBg from "@/assets/meditation-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const YogaMeditation = () => {
  const { toast } = useToast();
  const [aiSuggestions, setAiSuggestions] = useState<string>("");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const yogaPoses = [
    { 
      name: "Mountain Pose (Tadasana)", 
      duration: "5 min", 
      difficulty: "Beginner", 
      benefits: "Improves posture and balance",
      steps: ["Stand with feet hip-width apart", "Ground through all four corners of feet", "Engage thighs and lift kneecaps", "Draw shoulders back and down", "Breathe deeply for 5-10 breaths"],
      videoUrl: "https://www.youtube.com/embed/vqJPE3dSymg"
    },
    { 
      name: "Downward Dog (Adho Mukha Svanasana)", 
      duration: "3 min", 
      difficulty: "Beginner", 
      benefits: "Stretches spine and strengthens arms",
      steps: ["Start on hands and knees", "Lift hips up and back", "Straighten legs as much as comfortable", "Press palms into ground", "Hold for 5-8 breaths"],
      videoUrl: "https://www.youtube.com/embed/kFbYVZHsa2c"
    },
    { 
      name: "Warrior I (Virabhadrasana I)", 
      duration: "4 min", 
      difficulty: "Intermediate", 
      benefits: "Builds strength and stability",
      steps: ["Step right foot forward, left back", "Bend right knee to 90 degrees", "Keep left leg straight", "Raise arms overhead", "Hold 5 breaths each side"],
      videoUrl: "https://www.youtube.com/embed/MbZmxtGQ0aI"
    },
    { 
      name: "Tree Pose (Vrksasana)", 
      duration: "5 min", 
      difficulty: "Beginner", 
      benefits: "Improves balance and focus",
      steps: ["Stand on left foot", "Place right foot on inner left thigh", "Press palms together at heart", "Focus gaze on one point", "Hold 5-10 breaths each side"],
      videoUrl: "https://www.youtube.com/embed/vHJOBjh_rEE"
    },
    { 
      name: "Child's Pose (Balasana)", 
      duration: "3 min", 
      difficulty: "Beginner", 
      benefits: "Relaxation and stress relief",
      steps: ["Kneel on floor, big toes touching", "Sit back on heels", "Lower forehead to ground", "Extend arms forward or alongside body", "Breathe deeply for 1-3 minutes"],
      videoUrl: "https://www.youtube.com/embed/2MN9vrMVlNk"
    },
    { 
      name: "Cobra Pose (Bhujangasana)", 
      duration: "4 min", 
      difficulty: "Intermediate", 
      benefits: "Opens chest and strengthens back",
      steps: ["Lie face down, hands under shoulders", "Press palms to lift chest", "Keep elbows slightly bent", "Draw shoulders away from ears", "Hold for 5-8 breaths"],
      videoUrl: "https://www.youtube.com/embed/JUP_YdYyfQw"
    },
  ];

  const mudras = [
    {
      name: "Gyan Mudra",
      meaning: "Gesture of Knowledge",
      benefits: "Enhances concentration and memory",
      howTo: "Touch tip of thumb to tip of index finger, keep other fingers extended",
      uses: "Meditation, studying, mental clarity"
    },
    {
      name: "Prana Mudra",
      meaning: "Life Force Gesture",
      benefits: "Boosts vitality and reduces fatigue",
      howTo: "Touch tips of thumb, ring finger, and little finger together",
      uses: "Energy boost, immune system support"
    },
    {
      name: "Apana Mudra",
      meaning: "Gesture of Digestion",
      benefits: "Aids digestion and detoxification",
      howTo: "Touch tips of thumb, middle finger, and ring finger together",
      uses: "Digestive issues, elimination, detox"
    },
    {
      name: "Dhyana Mudra",
      meaning: "Meditation Gesture",
      benefits: "Promotes deep meditation and inner peace",
      howTo: "Place right hand on left palm, both facing up, thumbs touching",
      uses: "Deep meditation, spiritual practices"
    },
  ];

  const meditations = [
    { 
      name: "Morning Mindfulness", 
      duration: "10 min", 
      type: "Guided", 
      instructor: "Sarah Chen",
      videoUrl: "https://www.youtube.com/embed/inpok4MKVLM"
    },
    { 
      name: "Stress Relief Breathing", 
      duration: "15 min", 
      type: "Breathing", 
      instructor: "Mark Johnson",
      videoUrl: "https://www.youtube.com/embed/aEqlQvczMJQ"
    },
    { 
      name: "Sleep Better Body Scan", 
      duration: "20 min", 
      type: "Body Scan", 
      instructor: "Emma Wilson",
      videoUrl: "https://www.youtube.com/embed/1vx8iUvfyCY"
    },
    { 
      name: "Focus & Clarity", 
      duration: "12 min", 
      type: "Guided", 
      instructor: "David Lee",
      videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU"
    },
  ];

  const herbalRemedies = [
    { 
      name: "Chamomile Tea", 
      use: "Better sleep and relaxation", 
      preparation: "Steep 1-2 teaspoons dried flowers in hot water for 5-10 minutes",
      benefits: "Reduces anxiety, promotes sleep, aids digestion",
      image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop"
    },
    { 
      name: "Ginger Root", 
      use: "Digestion and nausea relief", 
      preparation: "Slice fresh ginger and boil with water or steep in tea for 10 minutes",
      benefits: "Reduces inflammation, aids digestion, boosts immunity",
      image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop"
    },
    { 
      name: "Turmeric", 
      use: "Anti-inflammatory and antioxidant", 
      preparation: "Mix 1/2 tsp powder with warm milk and honey, drink before bed",
      benefits: "Reduces inflammation, supports brain health, improves joint health",
      image: "https://images.unsplash.com/photo-1615485290001-c8c9f8f38e1e?w=400&h=300&fit=crop"
    },
    { 
      name: "Ashwagandha", 
      use: "Stress relief and energy", 
      preparation: "Take 300-500mg supplement twice daily or steep powder in hot water",
      benefits: "Reduces stress and anxiety, improves focus, boosts energy",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=300&fit=crop"
    },
    { 
      name: "Holy Basil (Tulsi)", 
      use: "Respiratory health and immunity", 
      preparation: "Steep fresh or dried leaves in hot water for 5-7 minutes",
      benefits: "Boosts immunity, reduces stress, supports respiratory system",
      image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&h=300&fit=crop"
    },
    { 
      name: "Peppermint", 
      use: "Digestive comfort and mental clarity", 
      preparation: "Steep fresh or dried leaves in boiling water for 5-10 minutes",
      benefits: "Relieves digestive discomfort, improves focus, reduces headaches",
      image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&h=300&fit=crop"
    },
  ];

  const fetchAISuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to get personalized suggestions",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('yoga-wellness-suggestions', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      setAiSuggestions(data.suggestions);
      toast({
        title: "Suggestions Generated",
        description: "Your personalized yoga and wellness tips are ready!",
      });
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate suggestions",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchAISuggestions();
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={meditationBg}
            alt="Meditation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/30" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Yoga & Meditation
            </h1>
            <p className="text-lg text-muted-foreground">
              Find your inner peace and strengthen your mind-body connection
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 space-y-8">
        {/* AI Personalized Suggestions */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Personalized Wellness Suggestions
            </CardTitle>
            <CardDescription>
              AI-powered recommendations based on your health goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : aiSuggestions ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{aiSuggestions}</p>
              </div>
            ) : (
              <Button onClick={fetchAISuggestions} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Get Personalized Suggestions
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Yoga Poses */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Yoga Postures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yogaPoses.map((pose, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-[var(--shadow-wellness)] transition-all">
                <CardHeader className="bg-[image:var(--vitality-gradient)] text-primary-foreground">
                  <CardTitle className="text-lg">{pose.name}</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    {pose.difficulty}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{pose.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{pose.benefits}</p>
                  </div>
                  
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      width="100%"
                      height="100%"
                      src={pose.videoUrl}
                      title={pose.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Steps:</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                      {pose.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mudras Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Healing Mudras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mudras.map((mudra, index) => (
              <Card key={index} className="hover:shadow-[var(--shadow-wellness)] transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HandMetal className="h-5 w-5 text-primary" />
                    {mudra.name}
                  </CardTitle>
                  <CardDescription className="italic">{mudra.meaning}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-semibold text-sm">Benefits: </span>
                    <span className="text-sm text-muted-foreground">{mudra.benefits}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-sm">How to: </span>
                    <span className="text-sm text-muted-foreground">{mudra.howTo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-sm">Best for: </span>
                    <span className="text-sm text-muted-foreground">{mudra.uses}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Meditation Sessions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Guided Meditation Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meditations.map((meditation, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-[var(--shadow-wellness)] transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[image:var(--meditation-gradient)]">
                          <Brain className="h-5 w-5 text-primary-foreground" />
                        </div>
                        {meditation.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {meditation.type} • {meditation.instructor}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      width="100%"
                      height="100%"
                      src={meditation.videoUrl}
                      title={meditation.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{meditation.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Herbal Remedies */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Herbal & Organic Remedies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {herbalRemedies.map((remedy, index) => (
              <Card key={index} className="hover:shadow-[var(--shadow-soft)] transition-all overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img 
                    src={remedy.image} 
                    alt={remedy.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    {remedy.name}
                  </CardTitle>
                  <CardDescription>For {remedy.use}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-semibold text-sm">Benefits: </span>
                    <p className="text-sm text-muted-foreground">{remedy.benefits}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-sm">How to use: </span>
                    <p className="text-sm text-muted-foreground">{remedy.preparation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default YogaMeditation;
