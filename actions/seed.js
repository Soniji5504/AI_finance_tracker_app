import { db } from "@/lib/db";


export async function seedTransactions() {
  console.log("Seeding transactions...");
  
  try {
    // Your transaction seeding logic goes here
    // Example:
    // await db.transaction.createMany({ data: [...] });
    
    console.log("Transactions seeded successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}

// Keep the original seed function for backward compatibility
export async function seed() {
  return seedTransactions();
}
