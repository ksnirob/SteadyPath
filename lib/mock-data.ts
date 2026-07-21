export const weeklyAnxiety = [
  { day: "Mon", anxiety: 7, mood: 4, erp: 20 },
  { day: "Tue", anxiety: 6, mood: 5, erp: 35 },
  { day: "Wed", anxiety: 8, mood: 3, erp: 25 },
  { day: "Thu", anxiety: 5, mood: 6, erp: 50 },
  { day: "Fri", anxiety: 4, mood: 7, erp: 75 },
  { day: "Sat", anxiety: 5, mood: 6, erp: 80 },
  { day: "Sun", anxiety: 3, mood: 8, erp: 90 }
];

export const recentEpisodes = [
  { trigger: "Leaving the apartment", compulsion: "Door checking", anxiety: 7, resisted: true, time: "8:15 AM" },
  { trigger: "Email from work", compulsion: "Re-reading", anxiety: 6, resisted: false, time: "12:40 PM" },
  { trigger: "Cooking dinner", compulsion: "Hand washing", anxiety: 5, resisted: true, time: "7:05 PM" }
];

export const erpExercises = [
  { title: "Touch doorknob, delay washing", difficulty: 6, completion: 80, status: "In progress" },
  { title: "Send message without re-reading", difficulty: 5, completion: 60, status: "Planned" },
  { title: "One stove check only", difficulty: 7, completion: 40, status: "In progress" }
];

export const triggers = [
  { label: "Contamination", count: 12, change: "-18%" },
  { label: "Uncertainty", count: 9, change: "-8%" },
  { label: "Responsibility", count: 7, change: "+4%" },
  { label: "Symmetry", count: 3, change: "-12%" }
];

export const journalEntries = [
  { date: "Today", title: "Chose response prevention twice", mood: "Good" },
  { date: "Yesterday", title: "Hard morning, steady evening", mood: "Neutral" },
  { date: "Monday", title: "ERP felt possible after timer", mood: "Good" }
];
