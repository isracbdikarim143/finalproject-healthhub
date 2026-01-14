export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  height?: number;
  weight?: number;
  last_login?: string;
  last_logout?: string;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  exercise_name: string;
  duration: number;
  calories_burned: number;
  date: string;
  created_at: string;
}

export interface Nutrition {
  id: string;
  user_id: string;
  food_name: string;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  date: string;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  date: string;
  created_at: string;
}

export interface BMILog {
  id: string;
  user_id: string;
  height: number;
  weight: number;
  bmi: number;
  category: string;
  created_at: string;
}

export interface DashboardStats {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  totalWaterIntake: number;
  totalNutritionCalories: number;
  latestBMI?: BMILog;
}

export interface FoodItem {
  name: string;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type ThemeMode = 'light' | 'dark';
