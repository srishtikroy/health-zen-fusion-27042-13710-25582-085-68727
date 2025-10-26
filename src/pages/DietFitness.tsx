import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apple, Dumbbell, Plus, Calendar } from "lucide-react";
import nutritionImage from "@/assets/nutrition-hero.jpg";
import { toast } from "sonner";

const DietFitness = () => {
  const [meals, setMeals] = useState([
    { id: 1, name: "Oatmeal with Berries", calories: 350, time: "08:00 AM", type: "Breakfast" },
    { id: 2, name: "Grilled Chicken Salad", calories: 450, time: "01:00 PM", type: "Lunch" },
  ]);

  const [workouts, setWorkouts] = useState([
    { id: 1, name: "Morning Run", duration: "30 min", calories: 300, time: "07:00 AM" },
    { id: 2, name: "Strength Training", duration: "45 min", calories: 400, time: "06:00 PM" },
  ]);

  const handleAddMeal = () => {
    toast.success("Meal logged successfully!");
  };

  const handleAddWorkout = () => {
    toast.success("Workout logged successfully!");
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
              Diet
            </TabsTrigger>
            <TabsTrigger value="fitness" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              Fitness
            </TabsTrigger>
          </TabsList>

          {/* Diet Tab */}
          <TabsContent value="diet" className="space-y-6 mt-6">
            {/* Add Meal Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Log Meal
                </CardTitle>
                <CardDescription>Record your food intake</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meal-name">Meal Name</Label>
                    <Input id="meal-name" placeholder="e.g., Chicken Salad" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input id="calories" type="number" placeholder="450" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meal-type">Meal Type</Label>
                    <Select>
                      <SelectTrigger id="meal-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddMeal} className="w-full">
                      Add Meal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meal History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Meals
                </CardTitle>
                <CardDescription>Your food intake for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[image:var(--vitality-gradient)]">
                          <Apple className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{meal.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {meal.type} • {meal.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{meal.calories}</p>
                        <p className="text-xs text-muted-foreground">calories</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="space-y-6 mt-6">
            {/* Add Workout Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Log Workout
                </CardTitle>
                <CardDescription>Track your exercise session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workout-name">Workout Name</Label>
                    <Input id="workout-name" placeholder="e.g., Morning Run" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input id="duration" type="number" placeholder="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workout-calories">Calories Burned</Label>
                    <Input id="workout-calories" type="number" placeholder="300" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddWorkout} className="w-full">
                      Add Workout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workout History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Workouts
                </CardTitle>
                <CardDescription>Your exercise sessions for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[image:var(--wellness-gradient)]">
                          <Dumbbell className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{workout.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {workout.duration} • {workout.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{workout.calories}</p>
                        <p className="text-xs text-muted-foreground">kcal burned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default DietFitness;
