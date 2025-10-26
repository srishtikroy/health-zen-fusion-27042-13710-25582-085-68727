import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import WellnessChatbot from "@/components/WellnessChatbot";
import { Activity, Apple, Brain, Heart, Sparkles, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-wellness.jpg";
import { toast } from "sonner";
import type { User, Session } from "@supabase/supabase-js";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [insights, setInsights] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [healthGoals, setHealthGoals] = useState("");
  const [healthConditions, setHealthConditions] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [completions, setCompletions] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setSession(session);
      setUser(session.user);
      
      // Fetch profile
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profileData) {
        setProfile(profileData);
        const profile = profileData as any;
        if (profile.weight) setWeight(profile.weight.toString());
        if (profile.height) setHeight(profile.height.toString());
        if (profile.health_goals) setHealthGoals(profile.health_goals);
        if (profile.dietary_preferences) setDietaryPreferences(profile.dietary_preferences);
        if (profile.bmi) setBmi(profile.bmi);
      }

      // Fetch active meal and workout plans
      const { data: mealPlanData } = await (supabase as any)
        .from('meal_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (mealPlanData) setMealPlan(mealPlanData);

      const { data: workoutPlanData } = await (supabase as any)
        .from('workout_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (workoutPlanData) setWorkoutPlan(workoutPlanData);

      // Fetch completions
      const { data: completionsData } = await (supabase as any)
        .from('daily_completions')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (completionsData) {
        const completionsMap: { [key: string]: boolean } = {};
        completionsData.forEach((c: any) => {
          completionsMap[`${c.plan_type}-${c.day_number}`] = c.completed;
        });
        setCompletions(completionsMap);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (session) {
        setSession(session);
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (profile && !insights) {
      fetchPersonalizedInsights();
    }
  }, [profile]);

  const fetchPersonalizedInsights = async () => {
    if (!session) return;
    
    setLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('personalized-insights', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setInsights(data.insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error("Could not load insights. Please try refreshing the page.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const calculateBMI = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100;
    if (weightNum > 0 && heightNum > 0) {
      const calculatedBmi = weightNum / (heightNum * heightNum);
      setBmi(calculatedBmi);
      toast.success(`Your BMI is ${calculatedBmi.toFixed(1)}`);
    } else {
      toast.error("Please enter valid weight and height values");
    }
  };

  const generateWellnessPlan = async () => {
    if (!weight || !height) {
      toast.error("Please enter your weight and height first");
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100;
    const calculatedBmi = weightNum / (heightNum * heightNum);

    setLoadingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-wellness-plan', {
        body: {
          weight: weightNum,
          height: parseFloat(height),
          bmi: calculatedBmi.toFixed(1),
          healthGoals,
          healthConditions,
          dietaryPreferences
        }
      });

      if (error) throw error;
      
      // Save BMI to profile
      await (supabase as any)
        .from('profiles')
        .update({ bmi: calculatedBmi })
        .eq('id', user?.id);

      // Parse the plan to extract meals and workouts
      const planText = data.plan;
      
      // Deactivate old plans
      await (supabase as any)
        .from('meal_plans')
        .update({ is_active: false })
        .eq('user_id', user?.id);
      
      await (supabase as any)
        .from('workout_plans')
        .update({ is_active: false })
        .eq('user_id', user?.id);

      // Save new meal plan
      const { data: newMealPlan } = await (supabase as any)
        .from('meal_plans')
        .insert({
          user_id: user?.id,
          plan_data: { plan: planText }
        })
        .select()
        .single();

      // Save new workout plan
      const { data: newWorkoutPlan } = await (supabase as any)
        .from('workout_plans')
        .insert({
          user_id: user?.id,
          plan_data: { plan: planText }
        })
        .select()
        .single();

      setBmi(calculatedBmi);
      setMealPlan(newMealPlan);
      setWorkoutPlan(newWorkoutPlan);
      
      // Reset completions
      setCompletions({});
      
      toast.success("Your personalized wellness plan is ready!");
    } catch (error) {
      console.error("Error generating wellness plan:", error);
      toast.error("Failed to generate wellness plan. Please try again.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const toggleDayCompletion = async (dayNumber: number, planType: 'meal' | 'workout') => {
    const key = `${planType}-${dayNumber}`;
    const isCompleted = completions[key] || false;

    try {
      if (isCompleted) {
        // Delete completion
        await (supabase as any)
          .from('daily_completions')
          .delete()
          .eq('user_id', user?.id)
          .eq('day_number', dayNumber)
          .eq('plan_type', planType);
        
        setCompletions(prev => ({ ...prev, [key]: false }));
      } else {
        // Insert completion
        await (supabase as any)
          .from('daily_completions')
          .insert({
            user_id: user?.id,
            day_number: dayNumber,
            plan_type: planType,
            completed: true,
            completed_at: new Date().toISOString()
          });
        
        setCompletions(prev => ({ ...prev, [key]: true }));
      }
      toast.success(`Day ${dayNumber} marked as ${isCompleted ? 'incomplete' : 'complete'}!`);
    } catch (error) {
      console.error("Error toggling completion:", error);
      toast.error("Failed to update completion status.");
    }
  };

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { text: "Underweight", color: "text-blue-600" };
    if (bmiValue < 25) return { text: "Normal weight", color: "text-green-600" };
    if (bmiValue < 30) return { text: "Overweight", color: "text-yellow-600" };
    return { text: "Obese", color: "text-red-600" };
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden rounded-lg">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Wellness journey" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/60" />
        </div>
        <div className="relative z-10 text-center text-white space-y-6 px-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Welcome back, {profile.first_name}!
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Your personalized wellness insights are ready
          </p>
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="container mx-auto px-4 my-12">
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Personalized Wellness Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingInsights ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-line text-foreground">{insights}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Current Weight"
            value={profile.weight ? `${profile.weight} kg` : "Not set"}
            subtitle={profile.health_goals || "Set your goals"}
            icon={Activity}
          />
          <StatsCard
            title="Fitness Level"
            value={profile.fitness_level || "Not set"}
            subtitle="Update your profile"
            icon={Heart}
          />
          <StatsCard
            title="Dietary Preference"
            value={profile.dietary_preferences || "Not set"}
            subtitle="Customize your diet"
            icon={Apple}
          />
          <StatsCard
            title="Wellness Journey"
            value="Active"
            subtitle="Keep going!"
            icon={Brain}
          />
        </div>
      </section>

      {/* Health Information & Wellness Plan Generator */}
      <section className="container mx-auto px-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Your Personalized Wellness Plan
            </CardTitle>
            <CardDescription>
              Enter your details to get a customized meal and workout plan based on your BMI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="healthGoals">Health Goals</Label>
                <Input
                  id="healthGoals"
                  placeholder="e.g., Weight loss, muscle gain, general fitness"
                  value={healthGoals}
                  onChange={(e) => setHealthGoals(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
                <Input
                  id="dietaryPreferences"
                  placeholder="e.g., Vegetarian, vegan, no restrictions"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="healthConditions">Health Conditions</Label>
                <Input
                  id="healthConditions"
                  placeholder="e.g., Diabetes, high blood pressure, none"
                  value={healthConditions}
                  onChange={(e) => setHealthConditions(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={calculateBMI} variant="outline" className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Calculate BMI Only
              </Button>
              <Button onClick={generateWellnessPlan} disabled={loadingPlan} className="flex-1">
                {loadingPlan ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Full Plan
                  </>
                )}
              </Button>
            </div>

            {bmi !== null && !mealPlan && !workoutPlan && (
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your BMI</p>
                  <p className="text-4xl font-bold mb-2">{bmi.toFixed(1)}</p>
                  <p className={`text-lg font-semibold ${getBMICategory(bmi).color}`}>
                    {getBMICategory(bmi).text}
                  </p>
                </div>
              </div>
            )}

            {(mealPlan || workoutPlan) && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Your 7-Day Wellness Plan</h3>
                  {bmi !== null && (
                    <div className="text-center px-4 py-2 rounded-lg bg-card">
                      <p className="text-xs text-muted-foreground">BMI</p>
                      <p className="text-2xl font-bold">{bmi.toFixed(1)}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Meal Plan */}
                  {mealPlan && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Apple className="h-5 w-5 text-primary" />
                          7-Day Meal Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                          <div key={day} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <input
                              type="checkbox"
                              checked={completions[`meal-${day}`] || false}
                              onChange={() => toggleDayCompletion(day, 'meal')}
                              className="h-5 w-5 rounded cursor-pointer"
                            />
                            <span className={`font-medium ${completions[`meal-${day}`] ? 'line-through text-muted-foreground' : ''}`}>
                              Day {day}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Workout Plan */}
                  {workoutPlan && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          7-Day Workout Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                          <div key={day} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <input
                              type="checkbox"
                              checked={completions[`workout-${day}`] || false}
                              onChange={() => toggleDayCompletion(day, 'workout')}
                              className="h-5 w-5 rounded cursor-pointer"
                            />
                            <span className={`font-medium ${completions[`workout-${day}`] ? 'line-through text-muted-foreground' : ''}`}>
                              Day {day}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Full Plan Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Plan Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line text-foreground">
                        {mealPlan?.plan_data?.plan || workoutPlan?.plan_data?.plan}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      * This is AI-generated guidance. Please consult healthcare professionals for medical advice.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </section>


      {/* AI Wellness Chatbot */}
      <WellnessChatbot />
    </div>
  );
};

export default Dashboard;