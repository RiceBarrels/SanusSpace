export function getUserBMI(userData) {
    if (!userData || !userData.weight || !userData.height) return null;

    const { weight, height } = userData;

    // Convert height from cm to meters for BMI calculation
    const heightInMeters = height / 100;
    
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
}

export function getUserBMR(userData) {
    if (!userData || !userData.weight || !userData.height || !userData.dateOfBirth || !userData.biologicalSex) return null;

    const { weight, height, dateOfBirth, biologicalSex } = userData;

    // Calculate age more accurately using full dates
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    // Mifflin-St Jeor Equation: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + sex_factor
    // For males (xy): +5, For females (xx): -161
    const bmr = 10 * weight + 6.25 * height - 5 * age + (biologicalSex === "xy" ? 5 : -161);
    return Math.round(bmr * 10) / 10;
}

// Helper function to calculate BMI category
export function getBMICategory(bmi) {
    if (!bmi) return null;
    
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
}