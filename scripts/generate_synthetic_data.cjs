
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../server/data/users.json');
const READINGS_FILE = path.join(__dirname, '../server/data/readings.json');

// Helper to get random item
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Tarot Deck Mock for generation
const majorArcana = [
  { id: 0, name: "The Fool", suit: "major", symbol: "◌", meaning: "New beginnings & pure potential" },
  { id: 1, name: "The Magician", suit: "major", symbol: "✦", meaning: "Willpower, skill & manifestation" },
  { id: 2, name: "The High Priestess", suit: "major", symbol: "☽", meaning: "Intuition, mystery & the subconscious" },
  { id: 3, name: "The Empress", suit: "major", symbol: "❋", meaning: "Fertility, abundance & nurturing energy" },
  { id: 13, name: "Death", suit: "major", symbol: "⊗", meaning: "Transformation, endings & profound transition" },
  { id: 19, name: "The Sun", suit: "major", symbol: "☀", meaning: "Joy, clarity, success & vital energy" }
];

const categories = ["career", "love", "friendship", "general", "finance", "health", "spiritual", "family"];
const questions = {
  career: ["Will I get a promotion?", "Should I change careers?"],
  love: ["Will I find true love?", "How can I improve my relationship?"],
  general: ["What should I focus on now?", "What is blocking my progress?"]
};

function generateInterpretation(cards, category, question) {
  const [past, present, future] = cards;
  return `## Reading for ${category}\n\n*Question: "${question}"*\n\nPast: ${past.name}, Present: ${present.name}, Future: ${future.name}`;
}

async function run() {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const readings = JSON.parse(fs.readFileSync(READINGS_FILE, 'utf-8'));

  const startDate = new Date('2025-05-04T00:00:00Z');
  const endDate = new Date('2026-05-04T00:00:00Z');
  const totalDays = 365;

  const newUsers = [];
  const newReadings = [];

  // Generate 100 users across the year
  for (let i = 0; i < 100; i++) {
    const randomDay = Math.floor(Math.random() * totalDays);
    const date = new Date(startDate.getTime() + randomDay * 24 * 60 * 60 * 1000);
    const id = date.getTime().toString() + i;
    const email = `user_${i}_${randomDay}@example.com`;
    
    newUsers.push({
      _id: id,
      username: email,
      password: "$2b$10$BC0u2cQiORHm7LCJI.lZneobKzJY7qnAIXhPSvBQg7voM34gPC/ey", // Dummy hash
      dateOfBirth: "1990-01-01",
      status: "offline",
      createdAt: date.toISOString()
    });
  }

  // Generate 500 readings across the year (approx 1-2 per day)
  for (let i = 0; i < 500; i++) {
    const randomDay = Math.floor(Math.random() * totalDays);
    const date = new Date(startDate.getTime() + randomDay * 24 * 60 * 60 * 1000 + Math.random() * 86400000);
    const timestamp = date.getTime();
    const id = timestamp.toString() + i;
    
    const category = randomItem(categories);
    const question = randomItem(questions[category] || questions["general"]);
    const user = randomItem([...users, ...newUsers]);

    const selectedCards = [];
    for (let j = 0; j < 3; j++) {
      const card = { ...randomItem(majorArcana) };
      card.orientation = Math.random() > 0.5 ? "upright" : "reversed";
      card.image = `/assets/cards/card_${card.id}.jpg`;
      selectedCards.push(card);
    }

    newReadings.push({
      id: id,
      email: user.username,
      category: category,
      question: question,
      cards: selectedCards,
      summary: generateInterpretation(selectedCards, category, question),
      timestamp: timestamp
    });
  }

  // Combine and sort by date/timestamp to keep it somewhat clean (though append only is requested)
  // Actually the user said "Append Only", so I will just push them at the end.
  const finalUsers = [...users, ...newUsers];
  const finalReadings = [...readings, ...newReadings];

  fs.writeFileSync(USERS_FILE, JSON.stringify(finalUsers, null, 2));
  fs.writeFileSync(READINGS_FILE, JSON.stringify(finalReadings, null, 2));

  console.log(`Successfully generated 100 users and 500 readings over 365 days.`);
}

run().catch(console.error);
