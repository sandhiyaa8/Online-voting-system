
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/user');
const Taluk = require('./models/taluk');
const Election = require('./models/election');
const Candidate = require('./models/candidate');

const MONGO = process.env.MONGO_URI;


const tamilNaduData = {
  'Chennai': ['Alandur', 'Ambattur', 'Aminjikarai', 'Egmore', 'Guindy', 'Madhavaram', 'Maduravoyal', 'Mambalam', 'Mylapore', 'Perambur', 'Purasawalkam', 'Sholinganallur', 'Thiruvottiyur', 'Tondiarpet', 'Velachery'],
  'Coimbatore': ['Anaimalai', 'Coimbatore North', 'Coimbatore South', 'Mettupalayam', 'Perur', 'Pollachi', 'Sulur', 'Valparai'],
  'Madurai': ['Madurai North', 'Madurai South', 'Madurai East', 'Madurai West', 'Melur', 'Peraiyur', 'Thirumangalam', 'Usilampatti', 'Vadipatti'],
  'Tiruchirappalli': ['Lalgudi', 'Manapparai', 'Marungapuri', 'Musiri', 'Srirangam', 'Thottiyam', 'Tiruchirappalli', 'Thuraiyur'],
  'Salem': ['Attur', 'Edappadi', 'Gangavalli', 'Kadaiyampatti', 'Mettur', 'Omalur', 'Salem', 'Sankagiri', 'Vazhapadi', 'Yercaud'],
  'Tirunelveli': ['Ambasamudram', 'Cheranmahadevi', 'Manur', 'Nanguneri', 'Palayamkottai', 'Radhapuram', 'Thisayanvilai', 'Tirunelveli'],
  'Erode': ['Anthiyur', 'Bhavani', 'Erode', 'Gobichettipalayam', 'Kodumudi', 'Modakkurichi', 'Perundurai', 'Sathyamangalam', 'Thalavadi'],
  'Vellore': ['Arakkonam', 'Arcot', 'Gudiyatham', 'Katpadi', 'Pernambut', 'Sholinghur', 'Vellore', 'Walajah'],
  'Thanjavur': ['Budalur', 'Kumbakonam', 'Orathanadu', 'Papanasam', 'Pattukottai', 'Peravurani', 'Thanjavur', 'Thiruvaiyaru', 'Thiruvidaimarudur'],
  'Kanyakumari': ['Agastheeswaram', 'Kalkulam', 'Killiyoor', 'Thovalai', 'Vilavancode'],
  'Dindigul': ['Athoor', 'Dindigul East', 'Dindigul West', 'Guziliyamparai', 'Kodaikanal', 'Natham', 'Nilakottai', 'Oddanchatram', 'Palani', 'Vedasandur'],
  'Tiruppur': ['Avinashi', 'Dharapuram', 'Kangeyam', 'Madathukulam', 'Palladam', 'Tiruppur North', 'Tiruppur South', 'Udumalaipettai', 'Uthukuli'],
  'Namakkal': ['Kolli Hills', 'Kumarapalayam', 'Mohanur', 'Namakkal', 'Paramathi Velur', 'Rasipuram', 'Senthamangalam', 'Tiruchengode'],
  'Sivaganga': ['Devakottai', 'Ilayangudi', 'Karaikudi', 'Manamadurai', 'Sivaganga', 'Singampunari', 'Thirupathur', 'Tirupuvanam'],
  'Virudhunagar': ['Aruppukkottai', 'Kariyapatti', 'Rajapalayam', 'Sattur', 'Sivakasi', 'Srivilliputhur', 'Tiruchuli', 'Vembakottai', 'Virudhunagar'],
  'Cuddalore': ['Bhuvanagiri', 'Chidambaram', 'Cuddalore', 'Kattumannarkoil', 'Kurinjipadi', 'Panruti', 'Tittakudi', 'Veppur', 'Virudhachalam'],
  'Ramanathapuram': ['Kadaladi', 'Kamuthi', 'Paramakudi', 'Rajasingamangalam', 'Ramanathapuram', 'Rameswaram', 'Tiruvadanai', 'Mudukulathur'],
  'Karur': ['Aravakurichi', 'Kadavur', 'Karur', 'Krishnarayapuram', 'Kulithalai', 'Manmangalam', 'Pugalur'],
  'Pudukkottai': ['Alangudi', 'Aranthangi', 'Avudaiyarkoil', 'Gandarvakottai', 'Illuppur', 'Karambakudi', 'Kulathur', 'Manamelkudi', 'Ponnamaravathi', 'Pudukkottai', 'Thirumayam', 'Viralimalai'],
  'Krishnagiri': ['Bargur', 'Denkanikottai', 'Hosur', 'Kaveripattinam', 'Krishnagiri', 'Pochampalli', 'Shoolagiri', 'Uthangarai'],
  'Dharmapuri': ['Dharmapuri', 'Harur', 'Karimangalam', 'Nallampalli', 'Palacode', 'Pappireddipatti', 'Pennagaram'],
  'Villupuram': ['Gingee', 'Kallakurichi', 'Kandachipuram', 'Marakkanam', 'Melmalaiyanur', 'Sankarapuram', 'Thiruvennainallur', 'Tindivanam', 'Vanur', 'Vikravandi', 'Villupuram'],
  'Tiruvannamalai': ['Arani', 'Arni', 'Chengam', 'Cheyyar', 'Chetpet', 'Jamunamarathur', 'Kalasapakkam', 'Kilpennathur', 'Polur', 'Thandrampattu', 'Thandarampattu', 'Tiruvannamalai', 'Vandavasi', 'Vembakkam'],
  'Nagapattinam': ['Keelakarai', 'Kilvelur', 'Mayiladuthurai', 'Nagapattinam', 'Sirkali', 'Tharangambadi', 'Thirukkuvalai', 'Vedaranyam'],
  'Ariyalur': ['Andimadam', 'Ariyalur', 'Jayankondam', 'Sendurai', 'Udayarpalayam'],
  'Perambalur': ['Alathur', 'Kunnam', 'Perambalur', 'Veppanthattai'],
  'Tiruvarur': ['Koothanallur', 'Kudavasal', 'Mannargudi', 'Nannilam', 'Needamangalam', 'Thiruthuraipoondi', 'Tiruvarur', 'Valangaiman'],
  'Nilgiris': ['Coonoor', 'Gudalur', 'Kotagiri', 'Kundah', 'Panthalur', 'Udhagamandalam'],
  'Tenkasi': ['Alangulam', 'Kadayanallur', 'Sankarankovil', 'Shenkottai', 'Sivagiri', 'Tenkasi', 'Veerakeralampudur'],
  'Theni': ['Aandipatti', 'Bodinayakanur', 'Periyakulam', 'Theni', 'Uthamapalayam'],
  'Tirupattur': ['Ambur', 'Natrampalli', 'Tirupattur', 'Vaniyambadi'],
  'Ranipet': ['Arakkonam', 'Arcot', 'Nemili', 'Ranipet', 'Sholingur', 'Walajah'],
  'Kallakurichi': ['Chinnaselam', 'Kallakurichi', 'Sankarapuram', 'Tirukoilur', 'Ulundurpet'],
  'Chengalpattu': ['Chengalpattu', 'Cheyyur', 'Kanchipuram', 'Maduranthakam', 'Pallavaram', 'Tambaram', 'Thirukkalukundram', 'Tiruporur', 'Uthiramerur'],
  'Kancheepuram': ['Kundrathur', 'Sriperumbudur', 'Uthiramerur', 'Walajabad'],
  'Tiruvallur': ['Avadi', 'Gummidipoondi', 'Pallipattu', 'Ponneri', 'Poonamallee', 'RK Pet', 'Tiruttani', 'Tiruvallur', 'Uthukottai']
};


const parties = [
  'Dravida Munnetra Kazhagam (DMK)',
  'All India Anna Dravida Munnetra Kazhagam (AIADMK)',
  'Bharatiya Janata Party (BJP)',
  'Indian National Congress (INC)',
  'Pattali Makkal Katchi (PMK)',
  'Marumalarchi Dravida Munnetra Kazhagam (MDMK)',
  'Viduthalai Chiruthaigal Katchi (VCK)',
  'Naam Tamilar Katchi (NTK)',
  'Communist Party of India (Marxist) (CPI-M)',
  'Independent'
];


const tamilNames = {
  male: ['Rajkumar', 'Murugan', 'Senthil', 'Karthik', 'Prakash', 'Ramesh', 'Suresh', 'Vijay', 'Arun', 'Dinesh', 'Kumar', 'Ganesh', 'Mahesh', 'Selvan', 'Arumugam', 'Vignesh', 'Rajesh', 'Saravanan', 'Pandian', 'Durai'],
  female: ['Lakshmi', 'Priya', 'Deepa', 'Kavitha', 'Malathi', 'Revathi', 'Sangeetha', 'Divya', 'Janaki', 'Meena', 'Shakila', 'Gomathi', 'Vasanthi', 'Padmini', 'Saranya', 'Anitha', 'Vijayalakshmi', 'Rajeswari', 'Sumathi', 'Kala']
};

const lastNames = ['Kumar', 'Raj', 'Pandian', 'Selvam', 'Murugan', 'Nadar', 'Thevar', 'Gounder', 'Pillai', 'Rajan', 'Moorthy', 'Swamy', 'Nathan', 'Velmurugan', 'Manickam'];

function getRandomName(gender = 'male') {
  const firstName = tamilNames[gender][Math.floor(Math.random() * tamilNames[gender].length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function getRandomParty() {
  return parties[Math.floor(Math.random() * parties.length)];
}

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO);
    console.log('✅ Connected to MongoDB Atlas successfully!\n');

    
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Taluk.deleteMany({});
    await Election.deleteMany({});
    await Candidate.deleteMany({});
    
    
    try {
      await Taluk.collection.dropIndex('name_1');
      console.log('✅ Dropped old taluk index');
    } catch (e) {
      
    }
    
    console.log('✅ Database cleared\n');

    
    console.log('📍 Creating Tamil Nadu Taluks...');
    let talukCount = 0;
    for (const [district, taluks] of Object.entries(tamilNaduData)) {
      for (const taluk of taluks) {
        await Taluk.create({ name: taluk, district: district });
        talukCount++;
      }
    }
    console.log(`✅ Created ${talukCount} taluks across ${Object.keys(tamilNaduData).length} districts\n`);

    
    console.log('🗳️  Creating Elections...');
    const majorTaluks = [
      'Chennai North', 'Coimbatore North', 'Madurai North', 'Salem', 'Tiruchirappalli',
      'Thanjavur', 'Tirunelveli', 'Erode', 'Vellore', 'Dindigul'
    ];

    const elections = [];
    for (const taluk of majorTaluks) {
      const election = await Election.create({
        name: `${taluk} Assembly Election 2025`,
        type: 'assembly',
        taluk: taluk,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-31'),
        active: true
      });
      elections.push({ election, taluk });
    }
    console.log(`✅ Created ${elections.length} active elections\n`);

    
    console.log('👥 Creating Candidates...');
    let candidateCount = 0;
    for (const { election, taluk } of elections) {
      const numCandidates = Math.floor(Math.random() * 3) + 3; 
      const usedParties = [];
      
      for (let i = 0; i < numCandidates; i++) {
        const gender = Math.random() > 0.3 ? 'male' : 'female'; 
        let party = getRandomParty();
        
        
        while (usedParties.includes(party) && usedParties.length < parties.length) {
          party = getRandomParty();
        }
        usedParties.push(party);

        await Candidate.create({
          name: getRandomName(gender),
          position: 'MLA',
          party: party,
          taluk: taluk,
          electionId: election._id,
          votes: Math.floor(Math.random() * 100) 
        });
        candidateCount++;
      }
    }
    console.log(`✅ Created ${candidateCount} candidates\n`);

    
    console.log('👤 Creating sample voters...');
    const testUsers = [
      { username: 'chennai_voter', password: 'tamil123', fullname: 'Arjun Kumar', taluk: 'Chennai North' },
      { username: 'coimbatore_voter', password: 'tamil123', fullname: 'Priya Selvam', taluk: 'Coimbatore North' },
      { username: 'madurai_voter', password: 'tamil123', fullname: 'Murugan Pandian', taluk: 'Madurai North' },
      { username: 'salem_voter', password: 'tamil123', fullname: 'Lakshmi Raj', taluk: 'Salem' },
      { username: 'trichy_voter', password: 'tamil123', fullname: 'Senthil Nathan', taluk: 'Tiruchirappalli' }
    ];

    for (const userData of testUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      await User.create({
        fullname: userData.fullname,
        dob: new Date('1990-01-01'),
        age: 35,
        mobile: `98765${Math.floor(Math.random() * 90000) + 10000}`,
        address: `${Math.floor(Math.random() * 100) + 1}, Main Street`,
        country: 'India',
        state: 'Tamil Nadu',
        taluk: userData.taluk,
        username: userData.username,
        passwordHash,
        verified: true
      });
    }
    console.log(`✅ Created ${testUsers.length} test voter accounts\n`);

    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 PRODUCTION DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 Database Statistics:`);
    console.log(`   • Districts: ${Object.keys(tamilNaduData).length}`);
    console.log(`   • Taluks: ${talukCount}`);
    console.log(`   • Active Elections: ${elections.length}`);
    console.log(`   • Candidates: ${candidateCount}`);
    console.log(`   • Test Voters: ${testUsers.length}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🔐 Test Login Credentials (Password: tamil123 for all):');
    console.log('───────────────────────────────────────────────────────');
    testUsers.forEach(user => {
      console.log(`   Username: ${user.username.padEnd(20)} | Taluk: ${user.taluk}`);
    });
    console.log('═══════════════════════════════════════════════════════\n');

    mongoose.disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ SEEDING ERROR:', err.message);
    console.error(err);
    mongoose.disconnect();
    process.exit(1);
  }
}

seed();
