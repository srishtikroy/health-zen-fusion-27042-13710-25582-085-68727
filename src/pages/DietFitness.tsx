import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Drumstick } from "lucide-react";
import dietBowl1 from "@/assets/diet-bowl-1.jpg";
import dietBowl2 from "@/assets/diet-bowl-2.jpg";
import dietBowl3 from "@/assets/diet-bowl-3.jpg";
import pushups from "@/assets/pushups-exercise.jpg";
import lunges from "@/assets/lunges-exercise.jpg";
import mountainClimbers from "@/assets/mountain-climbers.jpg";
import burpees from "@/assets/burpees-exercise.jpg";

const DietFitness = () => {
  const [dietPreference, setDietPreference] = useState<"vegetarian" | "non-vegetarian">("vegetarian");

  const meals = [
    {
      id: 1,
      name: "Yogurt Granola Bowl",
      image: dietBowl1,
      description: "Greek yogurt topped with granola, fresh blueberries, banana slices, and almonds for a protein-rich breakfast"
    },
    {
      id: 2,
      name: "Oatmeal Berry Bowl",
      image: dietBowl2,
      description: "Creamy oatmeal with sliced strawberries, nuts, and a drizzle of honey for sustained energy"
    },
    {
      id: 3,
      name: "Salmon Poke Bowl",
      image: dietBowl3,
      description: "Fresh salmon with corn, broccoli, edamame, and colorful vegetables for complete nutrition"
    }
  ];

  const exercises = [
    {
      id: 1,
      name: "Push-ups",
      sets: "3 sets of 15 reps",
      image: pushups,
      description: "Classic upper body exercise that targets chest, shoulders, and triceps. Great for building strength and endurance.",
      videoId: "IODxDxX7oi4"
    },
    {
      id: 2,
      name: "Lunges",
      sets: "3 sets of 12 reps per leg",
      image: lunges,
      description: "Dynamic leg exercise that strengthens balance and strengthens lower body muscles uniformly.",
      videoId: "_l3ySVKYVJ8"
    },
    {
      id: 3,
      name: "Mountain Climbers",
      sets: "3 sets of 30 seconds",
      image: mountainClimbers,
      description: "High intensity cardio exercise that combines core strength with cardiovascular endurance.",
      videoId: "nmwgirgXLYM"
    },
    {
      id: 4,
      name: "Burpees",
      sets: "3 sets of 10 reps",
      image: burpees,
      description: "Full body exercise that builds strength and burns calories. Combines squat, plank, and jump.",
      videoId: "dZgVxmf6jkA"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="diet" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
            <TabsTrigger value="diet">Diet</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
          </TabsList>

          {/* Diet Tab */}
          <TabsContent value="diet" className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">Diet Plan 🍽️</h1>
              <p className="text-muted-foreground">High-protein nutritious meal options</p>
            </div>

            {/* Diet Preference */}
            <Card>
              <CardHeader>
                <CardTitle>Diet Preference</CardTitle>
                <CardDescription>Switch between dietary preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={dietPreference === "vegetarian" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setDietPreference("vegetarian")}
                  >
                    <Leaf className="mr-2 h-4 w-4" />
                    Vegetarian
                    <span className="ml-2 text-xs opacity-70">Plant-based meals</span>
                  </Button>
                  <Button
                    variant={dietPreference === "non-vegetarian" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setDietPreference("non-vegetarian")}
                  >
                    <Drumstick className="mr-2 h-4 w-4" />
                    Non-Vegetarian
                    <span className="ml-2 text-xs opacity-70">Includes meat & poultry</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Meal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {meals.map((meal) => (
                <Card key={meal.id} className="overflow-hidden">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-48 object-cover"
                  />
                  <CardHeader>
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {meal.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">Fitness Routine 💪</h1>
              <p className="text-muted-foreground">Personalized exercises for your fitness level</p>
            </div>

            {/* Exercise Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="overflow-hidden">
                  <img
                    src={exercise.image}
                    alt={exercise.name}
                    className="w-full h-56 object-cover"
                  />
                  <CardHeader>
                    <CardTitle>{exercise.name}</CardTitle>
                    <p className="text-sm text-primary font-medium">{exercise.sets}</p>
                    <CardDescription className="text-sm mt-2">
                      {exercise.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${exercise.videoId}`}
                        title={exercise.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default DietFitness;
