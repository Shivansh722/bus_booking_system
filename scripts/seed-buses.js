const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-booking');

// Bus Schema (simplified version)
const BusSchema = new mongoose.Schema({
  name: String,
  busNumber: String,
  operator: String,
  origin: String,
  destination: String,
  departureTime: Date,
  arrivalTime: Date,
  duration: String,
  price: Number,
  busType: String,
  amenities: [String],
  totalSeats: Number,
  availableSeats: Number,
  bookings: [],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Bus = mongoose.models.Bus || mongoose.model('Bus', BusSchema);

const sampleBuses = [
  {
    name: "Express Deluxe",
    busNumber: "DL01AB1234",
    operator: "Delhi Transport Corp",
    origin: "Delhi",
    destination: "Mumbai",
    departureTime: new Date("2024-01-15T08:00:00Z"),
    arrivalTime: new Date("2024-01-16T06:00:00Z"),
    duration: "22h 0m",
    price: 1200,
    busType: "AC",
    amenities: ["WiFi", "AC", "Charging Point", "Entertainment"],
    totalSeats: 40,
    availableSeats: 40,
    bookings: [],
    isActive: true
  },
  {
    name: "Comfort Plus",
    busNumber: "MH02CD5678",
    operator: "Maharashtra State Transport",
    origin: "Mumbai",
    destination: "Pune",
    departureTime: new Date("2024-01-15T14:30:00Z"),
    arrivalTime: new Date("2024-01-15T18:00:00Z"),
    duration: "3h 30m",
    price: 450,
    busType: "Semi-Sleeper",
    amenities: ["AC", "Charging Point", "Water Bottle"],
    totalSeats: 35,
    availableSeats: 35,
    bookings: [],
    isActive: true
  },
  {
    name: "Night Rider",
    busNumber: "KA03EF9012",
    operator: "Karnataka State Transport",
    origin: "Bangalore",
    destination: "Chennai",
    departureTime: new Date("2024-01-15T22:00:00Z"),
    arrivalTime: new Date("2024-01-16T05:30:00Z"),
    duration: "7h 30m",
    price: 800,
    busType: "Sleeper",
    amenities: ["AC", "Blanket", "Pillow", "Reading Light"],
    totalSeats: 30,
    availableSeats: 30,
    bookings: [],
    isActive: true
  }
];

async function seedBuses() {
  try {
    // Clear existing buses
    await Bus.deleteMany({});
    console.log('Cleared existing buses');

    // Insert sample buses
    await Bus.insertMany(sampleBuses);
    console.log('Sample buses inserted successfully');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding buses:', error);
    process.exit(1);
  }
}

seedBuses();