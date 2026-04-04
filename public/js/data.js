/* ============================================
   MediCap — Sample Data & Seed Database
   ============================================ */

const SPECIALTIES = [
    'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics',
    'Orthopedics', 'Neurology', 'Gynecology', 'ENT',
    'Ophthalmology', 'Psychiatry', 'Dentistry', 'Urology'
];

const CITIES = [
    { name: 'Ahmedabad', state: 'Gujarat', icon: '🏛️' },
    { name: 'Surat', state: 'Gujarat', icon: '💎' },
    { name: 'Vadodara', state: 'Gujarat', icon: '🏰' },
    { name: 'Rajkot', state: 'Gujarat', icon: '🎭' },
    { name: 'Gandhinagar', state: 'Gujarat', icon: '🌿' },
    { name: 'Bhavnagar', state: 'Gujarat', icon: '⚓' },
    { name: 'Junagadh', state: 'Gujarat', icon: '🏔️' },
    { name: 'Anand', state: 'Gujarat', icon: '🥛' }
];

const TIME_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

const SEED_DOCTORS = [
    {
        id: 'doc-001',
        name: 'Dr. Priya Sharma',
        specialty: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: 15,
        city: 'Ahmedabad',
        hospital: 'Sterling Hospital',
        fee: 800,
        rating: 4.9,
        reviews: 312,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Dr. Priya Sharma is a renowned cardiologist with over 15 years of experience in interventional cardiology and heart failure management.'
    },
    {
        id: 'doc-002',
        name: 'Dr. Rajesh Patel',
        specialty: 'General Medicine',
        qualification: 'MBBS, MD (Medicine)',
        experience: 20,
        city: 'Ahmedabad',
        hospital: 'Apollo Hospital',
        fee: 500,
        rating: 4.8,
        reviews: 548,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Dr. Rajesh Patel is a highly experienced general physician known for his comprehensive approach to patient care and preventive medicine.'
    },
    {
        id: 'doc-003',
        name: 'Dr. Anita Desai',
        specialty: 'Dermatology',
        qualification: 'MBBS, MD (Dermatology)',
        experience: 12,
        city: 'Surat',
        hospital: 'SMIMER Hospital',
        fee: 700,
        rating: 4.7,
        reviews: 214,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Dr. Anita Desai specializes in cosmetic dermatology, skin allergies, and advanced laser treatments.'
    },
    {
        id: 'doc-004',
        name: 'Dr. Vikram Singh',
        specialty: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: 18,
        city: 'Vadodara',
        hospital: 'SSG Hospital',
        fee: 900,
        rating: 4.8,
        reviews: 387,
        available: true,
        languages: ['English', 'Hindi'],
        about: 'Dr. Vikram Singh is an expert orthopedic surgeon specializing in joint replacement and sports medicine.'
    },
    {
        id: 'doc-005',
        name: 'Dr. Meera Joshi',
        specialty: 'Pediatrics',
        qualification: 'MBBS, DCH, MD (Pediatrics)',
        experience: 10,
        city: 'Rajkot',
        hospital: 'Rajkot Civil Hospital',
        fee: 400,
        rating: 4.9,
        reviews: 623,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Dr. Meera Joshi is a compassionate pediatrician with expertise in newborn care, childhood vaccinations, and developmental disorders.'
    },
    {
        id: 'doc-006',
        name: 'Dr. Amit Trivedi',
        specialty: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: 14,
        city: 'Ahmedabad',
        hospital: 'SAL Hospital',
        fee: 1000,
        rating: 4.6,
        reviews: 178,
        available: false,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Dr. Amit Trivedi is a leading neurologist specializing in stroke management, epilepsy, and neurodegenerative diseases.'
    },
    {
        id: 'doc-007',
        name: 'Dr. Kavita Mehta',
        specialty: 'Gynecology',
        qualification: 'MBBS, MS (OB-GYN)',
        experience: 16,
        city: 'Surat',
        hospital: 'Mahavir Hospital',
        fee: 600,
        rating: 4.8,
        reviews: 445,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Dr. Kavita Mehta is an experienced gynecologist and obstetrician with expertise in high-risk pregnancies and minimally invasive surgery.'
    },
    {
        id: 'doc-008',
        name: 'Dr. Suresh Nair',
        specialty: 'ENT',
        qualification: 'MBBS, MS (ENT)',
        experience: 11,
        city: 'Gandhinagar',
        hospital: 'GCS Medical College',
        fee: 550,
        rating: 4.5,
        reviews: 156,
        available: true,
        languages: ['English', 'Hindi'],
        about: 'Dr. Suresh Nair is an ENT specialist with focus on cochlear implants, sinus surgery, and voice disorders.'
    },
    {
        id: 'doc-009',
        name: 'Dr. Pallavi Bhatt',
        specialty: 'Ophthalmology',
        qualification: 'MBBS, MS (Ophthalmology)',
        experience: 9,
        city: 'Vadodara',
        hospital: 'Baroda Eye Hospital',
        fee: 650,
        rating: 4.7,
        reviews: 198,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Dr. Pallavi Bhatt specializes in cataract surgery, LASIK, and retinal disorders with a patient-first approach.'
    },
    {
        id: 'doc-010',
        name: 'Dr. Hardik Shah',
        specialty: 'Psychiatry',
        qualification: 'MBBS, MD (Psychiatry)',
        experience: 8,
        city: 'Ahmedabad',
        hospital: 'Mind Wellness Clinic',
        fee: 750,
        rating: 4.8,
        reviews: 234,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Dr. Hardik Shah is a caring psychiatrist specializing in anxiety, depression, OCD, and addiction medicine.'
    },
    {
        id: 'doc-011',
        name: 'Dr. Ritu Agrawal',
        specialty: 'Dentistry',
        qualification: 'BDS, MDS (Orthodontics)',
        experience: 13,
        city: 'Rajkot',
        hospital: 'Smile Care Dental',
        fee: 350,
        rating: 4.6,
        reviews: 412,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Dr. Ritu Agrawal is an orthodontics specialist offering braces, aligners, and cosmetic dental procedures.'
    },
    {
        id: 'doc-012',
        name: 'Dr. Nikhil Raval',
        specialty: 'Urology',
        qualification: 'MBBS, MS, MCh (Urology)',
        experience: 17,
        city: 'Surat',
        hospital: 'Kiran Hospital',
        fee: 850,
        rating: 4.7,
        reviews: 167,
        available: true,
        languages: ['English', 'Hindi'],
        about: 'Dr. Nikhil Raval is a senior urologist with expertise in kidney stones, prostate disorders, and robotic surgery.'
    }
];

const SEED_APPOINTMENTS = [
    {
        id: 'apt-001',
        doctorId: 'doc-001',
        patientName: 'Rahul Verma',
        date: '2026-04-07',
        time: '10:00 AM',
        type: 'Consultation',
        status: 'confirmed',
        notes: 'Follow-up for chest pain evaluation'
    },
    {
        id: 'apt-002',
        doctorId: 'doc-005',
        patientName: 'Sneha Patel',
        date: '2026-04-08',
        time: '11:30 AM',
        type: 'Checkup',
        status: 'confirmed',
        notes: 'Child vaccination - 6 months'
    },
    {
        id: 'apt-003',
        doctorId: 'doc-003',
        patientName: 'Amit Kumar',
        date: '2026-04-05',
        time: '02:00 PM',
        type: 'Follow-up',
        status: 'completed',
        notes: 'Skin allergy follow-up'
    },
    {
        id: 'apt-004',
        doctorId: 'doc-002',
        patientName: 'Priya Shah',
        date: '2026-04-10',
        time: '09:30 AM',
        type: 'Consultation',
        status: 'pending',
        notes: 'General health checkup'
    },
    {
        id: 'apt-005',
        doctorId: 'doc-004',
        patientName: 'Vikash Mehta',
        date: '2026-04-03',
        time: '03:00 PM',
        type: 'Follow-up',
        status: 'completed',
        notes: 'Post knee surgery review'
    }
];

const SEED_RECORDS = [
    {
        id: 'rec-001',
        date: '2026-03-28',
        doctorName: 'Dr. Priya Sharma',
        doctorSpecialty: 'Cardiology',
        diagnosis: 'Mild Hypertension',
        notes: 'Blood pressure readings slightly elevated. Recommended lifestyle modifications including reduced salt intake, regular exercise (30 min daily walking), and stress management techniques.',
        vitals: {
            bp: '140/90',
            heartRate: '82 bpm',
            weight: '75 kg',
            temperature: '98.4°F'
        },
        medications: [
            { name: 'Amlodipine 5mg', dosage: 'Once daily', duration: '30 days' },
            { name: 'Aspirin 75mg', dosage: 'Once daily', duration: '30 days' }
        ],
        tests: ['ECG', 'Lipid Profile', 'Blood Sugar Fasting']
    },
    {
        id: 'rec-002',
        date: '2026-03-15',
        doctorName: 'Dr. Rajesh Patel',
        doctorSpecialty: 'General Medicine',
        diagnosis: 'Seasonal Flu',
        notes: 'Patient presented with fever, body ache, and nasal congestion for 3 days. No signs of pneumonia. Prescribed symptomatic treatment and advised rest for 5 days.',
        vitals: {
            bp: '120/80',
            heartRate: '78 bpm',
            weight: '75 kg',
            temperature: '101.2°F'
        },
        medications: [
            { name: 'Paracetamol 650mg', dosage: 'Thrice daily', duration: '5 days' },
            { name: 'Cetirizine 10mg', dosage: 'Once daily', duration: '5 days' },
            { name: 'Vitamin C 500mg', dosage: 'Once daily', duration: '15 days' }
        ],
        tests: ['CBC', 'Throat Swab']
    },
    {
        id: 'rec-003',
        date: '2026-02-20',
        doctorName: 'Dr. Anita Desai',
        doctorSpecialty: 'Dermatology',
        diagnosis: 'Contact Dermatitis',
        notes: 'Rash on both forearms, likely due to new detergent. Advised to change detergent and use prescribed topical cream. Follow-up in 2 weeks.',
        vitals: {
            bp: '118/76',
            heartRate: '72 bpm',
            weight: '74 kg',
            temperature: '98.6°F'
        },
        medications: [
            { name: 'Betamethasone Cream', dosage: 'Apply twice daily', duration: '14 days' },
            { name: 'Hydroxyzine 25mg', dosage: 'Once at night', duration: '10 days' }
        ],
        tests: ['Patch Test']
    }
];

// Seed data function
function seedDatabase() {
    if (!localStorage.getItem('medicap_doctors')) {
        localStorage.setItem('medicap_doctors', JSON.stringify(SEED_DOCTORS));
    }
    if (!localStorage.getItem('medicap_appointments')) {
        localStorage.setItem('medicap_appointments', JSON.stringify(SEED_APPOINTMENTS));
    }
    if (!localStorage.getItem('medicap_records')) {
        localStorage.setItem('medicap_records', JSON.stringify(SEED_RECORDS));
    }
}
