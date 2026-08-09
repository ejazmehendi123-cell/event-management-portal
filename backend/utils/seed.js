// Populates the database with demo accounts, a mix of upcoming + completed
// events, and enough registration history to make every bonus feature
// (participation streak, registration trends, favorites, reminders) show
// real data on first run.
// Run with: npm run seed  (make sure MONGO_URI is set in .env first)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany(), Event.deleteMany(), Registration.deleteMany()]);

  const admin = await User.create({ name: 'Admin User', email: 'admin@eventhub.com', password: 'admin123', role: 'admin' });
  const demoUser = await User.create({ name: 'Demo Attendee', email: 'user@eventhub.com', password: 'user1234', role: 'user' });
  const attendee2 = await User.create({ name: 'Priya Nair', email: 'priya@eventhub.com', password: 'user1234', role: 'user' });
  const attendee3 = await User.create({ name: 'Diego Alvarez', email: 'diego@eventhub.com', password: 'user1234', role: 'user' });

  const upcomingEventsData = [
    {
      title: 'TechFusion Hackathon 2026',
      description:
        '24-hour hackathon bringing together developers, designers, and product thinkers to build working prototypes around this year\'s theme: AI for everyday life. Mentors, food, and prizes provided.',
      category: 'Technology',
      date: daysFromNow(6),
      time: '09:00 AM',
      location: 'Ramdeobaba University, Innovation Hall',
      capacity: 120,
    },
    {
      title: 'Startup Pitch Night',
      description:
        'Early-stage founders pitch their ideas to a panel of investors and mentors. Open networking session follows with refreshments.',
      category: 'Business',
      date: daysFromNow(11),
      time: '05:30 PM',
      location: 'City Convention Center, Hall B',
      capacity: 80,
    },
    {
      title: 'Acoustic Sessions: Live in the Park',
      description:
        'An evening of live acoustic music from local artists. Bring a blanket and enjoy the sunset with good music and food trucks.',
      category: 'Music',
      date: daysFromNow(3),
      time: '06:00 PM',
      location: 'Central Park Amphitheatre',
      capacity: 200,
    },
    {
      title: 'Inter-College Basketball League Finals',
      description: 'The championship match of this season\'s inter-college basketball league. Come cheer for your team.',
      category: 'Sports',
      date: daysFromNow(9),
      time: '04:00 PM',
      location: 'University Sports Complex',
      capacity: 300,
    },
    {
      title: 'Intro to Machine Learning Workshop',
      description:
        'A hands-on weekend workshop covering the fundamentals of machine learning with Python, from linear regression to a first neural network.',
      category: 'Education',
      date: daysFromNow(15),
      time: '10:00 AM',
      location: 'Computer Science Block, Lab 3',
      capacity: 50,
    },
    {
      title: 'Campus Art & Design Exhibition',
      description: 'A showcase of student artwork spanning painting, digital art, and sculpture, curated by the Fine Arts Society.',
      category: 'Arts',
      date: daysFromNow(20),
      time: '11:00 AM',
      location: 'University Art Gallery',
      capacity: 150,
    },
  ];

  const completedEventsData = [
    {
      title: 'Winter Code Sprint 2026',
      description: 'A 48-hour open-source contribution sprint across campus teams, wrapped up with a lightning talk showcase.',
      category: 'Technology',
      date: daysFromNow(-18),
      time: '10:00 AM',
      location: 'Innovation Hall',
      capacity: 100,
    },
    {
      title: 'Alumni Networking Mixer',
      description: 'An evening connecting current students with alumni across engineering, product, and design careers.',
      category: 'Business',
      date: daysFromNow(-9),
      time: '06:00 PM',
      location: 'City Convention Center',
      capacity: 90,
    },
    {
      title: 'Spring Jazz Evening',
      description: 'A relaxed evening of live jazz performances from the university music ensemble.',
      category: 'Music',
      date: daysFromNow(-30),
      time: '07:00 PM',
      location: 'Central Park Amphitheatre',
      capacity: 150,
    },
  ];

  const upcoming = await Event.insertMany(upcomingEventsData.map((e) => ({ ...e, createdBy: admin._id })));
  const completed = await Event.insertMany(completedEventsData.map((e) => ({ ...e, createdBy: admin._id })));

  // --- Demo attendee's own registration history: built to show a live
  // 3-month participation streak, upcoming reminders, and a completed ticket.
  const now = new Date();
  const monthsAgo = (n) => new Date(now.getFullYear(), now.getMonth() - n, 10);

  const demoRegs = [
    { user: demoUser._id, event: upcoming[0]._id, createdAt: monthsAgo(0) },
    { user: demoUser._id, event: upcoming[2]._id, createdAt: monthsAgo(0) },
    { user: demoUser._id, event: upcoming[3]._id, createdAt: monthsAgo(1) },
    { user: demoUser._id, event: completed[0]._id, createdAt: monthsAgo(2) },
  ];
  await Registration.insertMany(demoRegs);

  demoUser.favorites = [upcoming[1]._id, upcoming[4]._id];
  await demoUser.save();

  // --- Other attendees: spread registrations across the last 14 days so
  // the admin "Registration trends" chart and "Most popular events" have
  // real data on first login.
  const trendRegs = [];
  const allEvents = [...upcoming, ...completed];
  for (let i = 0; i < 14; i += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const regsToday = i % 3 === 0 ? 2 : 1; // a little variation
    for (let j = 0; j < regsToday; j += 1) {
      const attendee = (i + j) % 2 === 0 ? attendee2 : attendee3;
      const event = allEvents[(i + j) % allEvents.length];
      trendRegs.push({ user: attendee._id, event: event._id, createdAt: day });
    }
  }
  await Registration.insertMany(trendRegs);

  console.log('Seed data created:');
  console.log('  Admin login     -> admin@eventhub.com / admin123');
  console.log('  Attendee login  -> user@eventhub.com / user1234  (has streak + favorites + a completed ticket)');
  console.log('  Extra attendees -> priya@eventhub.com / diego@eventhub.com (password: user1234)');
  console.log(`  ${upcoming.length} upcoming + ${completed.length} completed events created`);
  console.log(`  ${demoRegs.length + trendRegs.length} registrations created`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
