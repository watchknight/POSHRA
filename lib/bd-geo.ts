import type { BdDivision } from '@/types'

/**
 * Bangladesh administrative divisions, districts, and thanas.
 */
export const BD_DIVISIONS: BdDivision[] = [
  {
    name: 'Dhaka',
    districts: [
      {
        name: 'Dhaka',
        thanas: [
          'Adabor', 'Badda', 'Bangshal', 'Cantonment', 'Chakbazar',
          'Dakshinkhan', 'Demra', 'Dhanmondi', 'Gendaria', 'Gulshan',
          'Hazaribagh', 'Jatrabari', 'Kadamtali', 'Kafrul', 'Kalabagan',
          'Kamrangirchar', 'Khilgaon', 'Khilkhet', 'Kotwali', 'Lalbagh',
          'Mirpur', 'Mohammadpur', 'Motijheel', 'New Market', 'Pallabi',
          'Paltan', 'Ramna', 'Rayer Bazar', 'Rupnagar', 'Sabujbagh',
          'Shah Ali', 'Shahbagh', 'Sher-e-Bangla Nagar', 'Shyampur',
          'Sutrapur', 'Tejgaon', 'Turag', 'Uttara', 'Uttarkhan', 'Vatara',
          'Wari',
        ],
      },
      {
        name: 'Gazipur',
        thanas: ['Gazipur Sadar', 'Kaliakair', 'Kapasia', 'Sreepur', 'Tongi'],
      },
      {
        name: 'Narayanganj',
        thanas: ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon'],
      },
      {
        name: 'Manikganj',
        thanas: ['Daulatpur', 'Ghior', 'Harirampur', 'Manikganj Sadar', 'Saturia', 'Shivalaya', 'Singair'],
      },
      {
        name: 'Munshiganj',
        thanas: ['Gazaria', 'Lohajang', 'Munshiganj Sadar', 'Shreenagar', 'Sirajdikhan', 'Tongibari'],
      },
      {
        name: 'Tangail',
        thanas: ['Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Tangail Sadar'],
      },
      {
        name: 'Faridpur',
        thanas: ['Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Faridpur Sadar', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'],
      },
    ],
  },
  {
    name: 'Chattogram',
    districts: [
      {
        name: 'Chattogram',
        thanas: [
          'Akbarshah', 'Bakalia', 'Banshkhali', 'Bayazid', 'Boalkhali',
          'Chandgaon', 'Chattogram Sadar', 'Chawkbazar', 'Double Mooring',
          'Fatikchhari', 'Halishahar', 'Hathazari', 'Kotwali', 'Lohagara',
          'Mirsharai', 'Pahartali', 'Panchlaish', 'Patiya', 'Potenga',
          'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda',
        ],
      },
      {
        name: "Cox's Bazar",
        thanas: ["Cox's Bazar Sadar", 'Chakaria', 'Kutubdia', 'Maheshkhali', 'Pekua', 'Ramu', 'Teknaf', 'Ukhia'],
      },
      {
        name: 'Comilla',
        thanas: [
          'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram',
          'Comilla Sadar', 'Comilla Sadar South', 'Daudkandi', 'Debidwar',
          'Homna', 'Laksam', 'Lalmai', 'Manoharganj', 'Meghna', 'Muradnagar',
          'Nangalkot', 'Titas',
        ],
      },
      {
        name: 'Feni',
        thanas: ['Chhagalnaiya', 'Daganbhuiyan', 'Feni Sadar', 'Fulgazi', 'Parshuram', 'Sonagazi'],
      },
      {
        name: 'Noakhali',
        thanas: ['Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Kabirhat', 'Noakhali Sadar', 'Senbagh', 'Sonaimuri', 'Subarnachar'],
      },
      {
        name: 'Brahmanbaria',
        thanas: ['Akhaura', 'Ashuganj', 'Bancharampur', 'Bijoynagar', 'Brahmanbaria Sadar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'],
      },
    ],
  },
  {
    name: 'Rajshahi',
    districts: [
      {
        name: 'Rajshahi',
        thanas: [
          'Bagha', 'Bagmara', 'Boalia', 'Charghat', 'Durgapur', 'Godagari',
          'Matihar', 'Mohanpur', 'Paba', 'Puthia', 'Rajpara', 'Shahid Kamruzzaman',
          'Shahnawazpur', 'Tanore',
        ],
      },
      {
        name: 'Bogura',
        thanas: ['Adamdighi', 'Bogura Sadar', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatola'],
      },
      {
        name: 'Pabna',
        thanas: ['Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Pabna Sadar', 'Santhia', 'Sujanagar'],
      },
      {
        name: 'Natore',
        thanas: ['Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Natore Sadar', 'Singra'],
      },
    ],
  },
  {
    name: 'Khulna',
    districts: [
      {
        name: 'Khulna',
        thanas: [
          'Batiaghata', 'Dacope', 'Daulatpur', 'Dighalia', 'Dumuria',
          'Khalishpur', 'Khan Jahan Ali', 'Khulna Sadar', 'Koyra', 'Paikgacha',
          'Phultala', 'Rupsa', 'Sonadanga', 'Terokhada',
        ],
      },
      {
        name: 'Jessore',
        thanas: [
          'Abhaynagar', 'Bagharpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur',
          'Manirampur', 'Sharsha', 'Jessore Sadar',
        ],
      },
      {
        name: 'Kushtia',
        thanas: ['Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Kushtia Sadar', 'Mirpur'],
      },
    ],
  },
  {
    name: 'Sylhet',
    districts: [
      {
        name: 'Sylhet',
        thanas: [
          'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Dakshin Surma',
          'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat',
          'Osmani Nagar', 'Sylhet Sadar', 'Zakiganj',
        ],
      },
      {
        name: 'Habiganj',
        thanas: ['Ajmiriganj', 'Baniachang', 'Bahubal', 'Chunarughat', 'Habiganj Sadar', 'Lakhai', 'Madhabpur', 'Nabiganj'],
      },
      {
        name: 'Moulvibazar',
        thanas: ['Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Moulvibazar Sadar', 'Rajnagar', 'Sreemangal'],
      },
    ],
  },
  {
    name: 'Barishal',
    districts: [
      {
        name: 'Barishal',
        thanas: [
          'Agailjhara', 'Babuganj', 'Bakerganj', 'Barishal Sadar', 'Banaripara',
          'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur',
        ],
      },
      {
        name: 'Bhola',
        thanas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'],
      },
    ],
  },
  {
    name: 'Rangpur',
    districts: [
      {
        name: 'Rangpur',
        thanas: [
          'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgacha',
          'Pirganj', 'Rangpur Sadar', 'Taraganj',
        ],
      },
      {
        name: 'Dinajpur',
        thanas: ['Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Dinajpur Sadar', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur'],
      },
    ],
  },
  {
    name: 'Mymensingh',
    districts: [
      {
        name: 'Mymensingh',
        thanas: [
          'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur',
          'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Mymensingh Sadar',
          'Nandail', 'Phulpur', 'Tarakanda', 'Trishal',
        ],
      },
      {
        name: 'Jamalpur',
        thanas: ['Baksiganj', 'Dewanganj', 'Islampur', 'Jamalpur Sadar', 'Madarganj', 'Melandaha', 'Sarishabari'],
      },
    ],
  },
]

/** Get all unique districts, with Dhaka first, then others alphabetically */
export function getAllDistricts(): string[] {
  const set = new Set<string>()
  for (const div of BD_DIVISIONS) {
    for (const dist of div.districts) {
      set.add(dist.name)
    }
  }

  const all = Array.from(set).filter((d) => d !== 'Dhaka').sort()
  return ['Dhaka', ...all]
}

/** Get thanas for a specific district */
export function getThanasByDistrict(districtName: string): string[] {
  if (!districtName) return []
  for (const div of BD_DIVISIONS) {
    const d = div.districts.find((dist) => dist.name.toLowerCase() === districtName.toLowerCase())
    if (d) return d.thanas
  }
  return ['Sadar', 'Thana 1', 'Thana 2'] // fallback
}

/** Get a flat list of division names */
export function getDivisionNames(): string[] {
  return BD_DIVISIONS.map((d) => d.name)
}
