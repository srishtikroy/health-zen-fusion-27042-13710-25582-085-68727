import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Apple, Dumbbell, Droplets, Play, Clock, Flame, Leaf, TrendingUp } from "lucide-react";
import nutritionImage from "@/assets/nutrition-hero.jpg";
import { toast } from "sonner";

const DietFitness = () => {
  const [waterIntake, setWaterIntake] = useState(5);
  const dailyWaterGoal = 8;

  const healthyMeals = [
    {
      id: 1,
      name: "Green Smoothie Bowl",
      category: "Breakfast",
      time: "7:00 - 8:00 AM",
      calories: 320,
      protein: "12g",
      carbs: "45g",
      fats: "8g",
      image: "🥗",
      description: "Spinach, kale, banana, and chia seeds",
      benefits: ["High in fiber", "Rich in antioxidants"]
    },
    {
      id: 2,
      name: "Fresh Carrot Juice",
      category: "Juice",
      time: "10:00 AM",
      calories: 95,
      protein: "2g",
      carbs: "22g",
      fats: "0g",
      image: "🥕",
      description: "Fresh pressed carrots with ginger",
      benefits: ["Vitamin A", "Boosts immunity"]
    },
    {
      id: 3,
      name: "Quinoa Buddha Bowl",
      category: "Lunch",
      time: "12:30 - 1:30 PM",
      calories: 450,
      protein: "18g",
      carbs: "52g",
      fats: "15g",
      image: "🥙",
      description: "Quinoa, kale, chickpeas, avocado",
      benefits: ["Complete protein", "High fiber"]
    },
    {
      id: 4,
      name: "Green Detox Juice",
      category: "Juice",
      time: "3:00 PM",
      calories: 85,
      protein: "2g",
      carbs: "18g",
      fats: "0g",
      image: "🥤",
      description: "Cucumber, celery, green apple, lemon",
      benefits: ["Hydrating", "Detoxifying"]
    },
    {
      id: 5,
      name: "Grilled Salmon with Greens",
      category: "Dinner",
      time: "7:00 - 8:00 PM",
      calories: 520,
      protein: "42g",
      carbs: "28g",
      fats: "22g",
      image: "🐟",
      description: "Salmon, spinach, broccoli, olive oil",
      benefits: ["Omega-3", "Lean protein"]
    },
    {
      id: 6,
      name: "Kale & Avocado Salad",
      category: "Salad",
      time: "12:00 - 2:00 PM",
      calories: 280,
      protein: "8g",
      carbs: "25g",
      fats: "18g",
      image: "🥗",
      description: "Fresh kale, avocado, lemon dressing",
      benefits: ["Heart healthy", "Anti-inflammatory"]
    }
  ];

  const dietVideos = [
    {
      id: 1,
      title: "5 Healthy Smoothie Recipes",
      duration: "8:45",
      thumbnail: "🥤",
      category: "Recipes"
    },
    {
      id: 2,
      title: "Meal Prep for Busy Week",
      duration: "12:30",
      thumbnail: "🍱",
      category: "Tips"
    },
    {
      id: 3,
      title: "Benefits of Green Leafy Vegetables",
      duration: "6:20",
      thumbnail: "🥬",
      category: "Education"
    },
    {
      id: 4,
      title: "Hydration Tips & Tricks",
      duration: "5:15",
      thumbnail: "💧",
      category: "Wellness"
    }
  ];

  const workoutRoutines = [
    {
      id: 1,
      name: "Morning HIIT Workout",
      duration: "20 min",
      calories: 280,
      level: "Intermediate",
      exercises: ["Burpees", "Jump Squats", "Mountain Climbers", "High Knees"],
      thumbnail: "🏃"
    },
    {
      id: 2,
      name: "Full Body Strength",
      duration: "45 min",
      calories: 420,
      level: "Advanced",
      exercises: ["Deadlifts", "Bench Press", "Squats", "Pull-ups"],
      thumbnail: "💪"
    },
    {
      id: 3,
      name: "Yoga Flow for Flexibility",
      duration: "30 min",
      calories: 150,
      level: "Beginner",
      exercises: ["Sun Salutation", "Warrior Poses", "Tree Pose", "Child's Pose"],
      thumbnail: "🧘"
    },
    {
      id: 4,
      name: "Core Strengthening",
      duration: "15 min",
      calories: 120,
      level: "Beginner",
      exercises: ["Plank", "Russian Twists", "Leg Raises", "Bicycle Crunches"],
      thumbnail: "🎯"
    }
  ];

  const fitnessVideos = [
    {
      id: 1,
      title: "10-Minute Ab Workout",
      duration: "10:00",
      thumbnail: "🎯",
      category: "Core"
    },
    {
      id: 2,
      title: "Proper Squat Form",
      duration: "7:30",
      thumbnail: "🏋️",
      category: "Technique"
    },
    {
      id: 3,
      title: "Stretching Routine",
      duration: "12:15",
      thumbnail: "🤸",
      category: "Recovery"
    },
    {
      id: 4,
      title: "Cardio Fat Burn",
      duration: "25:00",
      thumbnail: "🔥",
      category: "Cardio"
    }
  ];

  const handleAddWater = () => {
    if (waterIntake < dailyWaterGoal) {
      setWaterIntake(prev => prev + 1);
      if (waterIntake + 1 === dailyWaterGoal) {
        toast.success("🎉 Daily water goal achieved!");
      } else {
        toast.success("Water intake logged!");
      }
    } else {
      toast.info("Daily goal already met! Keep hydrating.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={nutritionImage}
            alt="Nutrition"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/40" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Diet & Fitness Tracker
            </h1>
            <p className="text-lg text-muted-foreground">
              Monitor your nutrition and exercise for optimal health
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="diet" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="diet" className="gap-2">
              <Apple className="h-4 w-4" />
              Diet & Nutrition
            </TabsTrigger>
            <TabsTrigger value="fitness" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              Fitness & Exercise
            </TabsTrigger>
          </TabsList>

          {/* Diet Tab */}
          <TabsContent value="diet" className="space-y-6 mt-6">
            {/* Water Intake Tracker */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  Daily Water Intake
                </CardTitle>
                <CardDescription>Stay hydrated throughout the day</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{waterIntake} / {dailyWaterGoal}</p>
                    <p className="text-sm text-muted-foreground">glasses today</p>
                  </div>
                  <Button onClick={handleAddWater} size="lg" className="gap-2">
                    <Droplets className="h-4 w-4" />
                    Add Glass
                  </Button>
                </div>
                <Progress value={(waterIntake / dailyWaterGoal) * 100} className="h-3" />
                <p className="text-xs text-muted-foreground text-center">
                  {dailyWaterGoal - waterIntake > 0 
                    ? `${dailyWaterGoal - waterIntake} more glass${dailyWaterGoal - waterIntake > 1 ? 'es' : ''} to reach your goal!`
                    : "Great job! You've reached your daily goal! 🎉"}
                </p>
              </CardContent>
            </Card>

            {/* Healthy Meals Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Healthy Meal Plan</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthyMeals.map((meal) => (
                  <Card key={meal.id} className="group hover:shadow-lg transition-all overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="text-5xl mb-2">{meal.image}</div>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {meal.time}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{meal.name}</CardTitle>
                      <CardDescription className="text-xs">{meal.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {meal.calories} cal
                        </span>
                        <Badge variant="outline">{meal.category}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="font-semibold text-primary">{meal.protein}</p>
                          <p className="text-muted-foreground">Protein</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="font-semibold text-primary">{meal.carbs}</p>
                          <p className="text-muted-foreground">Carbs</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="font-semibold text-primary">{meal.fats}</p>
                          <p className="text-muted-foreground">Fats</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-medium mb-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          Benefits:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {meal.benefits.map((benefit, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Diet Videos Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Diet Tips & Recipes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dietVideos.map((video) => (
                  <Card key={video.id} className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden">
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-6xl">{video.thumbnail}</div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="rounded-full bg-primary/90 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-6 w-6 text-primary-foreground" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2">{video.duration}</Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm line-clamp-2">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="space-y-6 mt-6">
            {/* Workout Routines Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Workout Routines</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workoutRoutines.map((routine) => (
                  <Card key={routine.id} className="group hover:shadow-lg transition-all overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-5xl mb-2">{routine.thumbnail}</div>
                        <Badge 
                          variant={routine.level === "Beginner" ? "secondary" : routine.level === "Intermediate" ? "default" : "destructive"}
                        >
                          {routine.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{routine.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {routine.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            {routine.calories} cal
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Exercises:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {routine.exercises.map((exercise, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="text-xs">{exercise}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full mt-4 gap-2">
                        <Play className="h-4 w-4" />
                        Start Workout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Fitness Videos Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Fitness Guides & Demos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fitnessVideos.map((video) => (
                  <Card key={video.id} className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden">
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-6xl">{video.thumbnail}</div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="rounded-full bg-primary/90 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-6 w-6 text-primary-foreground" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2">{video.duration}</Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm line-clamp-2">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Fitness Tips Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Quick Fitness Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Warm up for 5-10 minutes before every workout</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Stay consistent - aim for at least 30 minutes of exercise daily</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Rest days are essential for muscle recovery and growth</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Combine cardio and strength training for best results</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default DietFitness;
