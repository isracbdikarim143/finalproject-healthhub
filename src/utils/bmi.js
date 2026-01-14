export function calculateBMI(height, weight) {
  // height in cm, weight in kg
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi >= 18.5 && bmi < 25) return 'Normal';
  if (bmi >= 25 && bmi < 30) return 'Overweight';
  return 'Obese';
}

export function getBMICategoryColor(category) {
  switch (category) {
    case 'Underweight':
      return 'text-blue-600 dark:text-blue-400';
    case 'Normal':
      return 'text-green-600 dark:text-green-400';
    case 'Overweight':
      return 'text-orange-600 dark:text-orange-400';
    case 'Obese':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}
