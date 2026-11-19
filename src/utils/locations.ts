export interface DistrictInfo {
  id: string;
  name: string;
  tagline?: string;
  isMajor?: boolean;
}

export interface StateInfo {
  id: string;
  name: string;
  type: 'state' | 'ut';
  isPopular?: boolean;
}

// 1. ALL 38 DISTRICTS OF TAMIL NADU
export const TAMIL_NADU_DISTRICTS: DistrictInfo[] = [
  { id: 'Chennai', name: 'Chennai', tagline: 'Marina/Besant beach, Palazzo IMAX, ECR & Anna Nagar', isMajor: true },
  { id: 'Coimbatore', name: 'Coimbatore', tagline: 'RS Puram food, Siruvani, Valparai & Western Ghats', isMajor: true },
  { id: 'Madurai', name: 'Madurai', tagline: 'Thoonga Nagaram, Midnight bun parotta, Jigarthanda & Heritage', isMajor: true },
  { id: 'Tiruchirappalli', name: 'Tiruchirappalli (Trichy)', tagline: 'Rockfort sunsets, Thillai Nagar & student hub', isMajor: true },
  { id: 'Salem', name: 'Salem', tagline: 'Yercaud hairpin rides, Shevapet food & scenic foothills', isMajor: true },
  { id: 'Tirunelveli', name: 'Tirunelveli', tagline: 'Halwa trails, Thamirabarani & Manapad coastal rides', isMajor: true },
  { id: 'Vellore', name: 'Vellore', tagline: 'VIT & student culture, Fort heritage & highway drives', isMajor: true },
  { id: 'Tiruppur', name: 'Tiruppur', tagline: 'Textile capital, turf sports & Kongu hangouts', isMajor: true },
  { id: 'Erode', name: 'Erode', tagline: 'Bhavani confluence & highway food runs', isMajor: true },
  { id: 'Nilgiris', name: 'Nilgiris (Ooty / Coonoor)', tagline: 'Tea estates, cool climate & hill station getaways', isMajor: true },
  { id: 'Kanyakumari', name: 'Kanyakumari', tagline: 'Triveni Sangam sunrises, coastal cycling & heritage', isMajor: true },
  { id: 'Dindigul', name: 'Dindigul', tagline: 'Biryani capital & Kodaikanal foothills', isMajor: true },
  { id: 'Thanjavur', name: 'Thanjavur', tagline: 'Brihadisvara temple, classical arts & Chettinad trail', isMajor: true },
  { id: 'Krishnagiri', name: 'Krishnagiri (Hosur)', tagline: 'Border corridor, pleasant weather & weekend rides', isMajor: true },
  { id: 'Thoothukudi', name: 'Thoothukudi (Tuticorin)', tagline: 'Pearl city, coastal food & port sunsets' },
  { id: 'Chengalpattu', name: 'Chengalpattu', tagline: 'Mahabalipuram, surf clubs & tech highway' },
  { id: 'Kanchipuram', name: 'Kanchipuram', tagline: 'Silk city, historic temples & rural cycling' },
  { id: 'Tiruvallur', name: 'Tiruvallur', tagline: 'Poondi reservoir & historic lake escapes' },
  { id: 'Pondicherry', name: 'Puducherry (Pondy)', tagline: 'White Town French cafes, Serenity surf & Auroville', isMajor: true },
  { id: 'Namakkal', name: 'Namakkal', tagline: 'Anjaneyar temple & Kolli Hills 70-bend rides' },
  { id: 'Dharmapuri', name: 'Dharmapuri', tagline: 'Hogenakkal waterfalls & forest treks' },
  { id: 'Karur', name: 'Karur', tagline: 'Amaravathi riverside & sports clubs' },
  { id: 'Theni', name: 'Theni', tagline: 'Suruli falls & cardamom hills' },
  { id: 'Tenkasi', name: 'Tenkasi', tagline: 'Courtallam waterfalls & Western Ghats breeze' },
  { id: 'Virudhunagar', name: 'Virudhunagar', tagline: 'Spicy culinary heritage & traditional hubs' },
  { id: 'Sivaganga', name: 'Sivaganga (Karaikudi)', tagline: 'Chettinad mansions, spicy cuisine & heritage' },
  { id: 'Ramanathapuram', name: 'Ramanathapuram', tagline: 'Rameswaram, Pamban bridge & coastal expeditions' },
  { id: 'Tiruvannamalai', name: 'Tiruvannamalai', tagline: 'Arunachala girivalam & spiritual meetups' },
  { id: 'Cuddalore', name: 'Cuddalore', tagline: 'Silver beach & coastal chillouts' },
  { id: 'Villupuram', name: 'Villupuram', tagline: 'Gingee Fort hiking & historic ruins' },
  { id: 'Nagapattinam', name: 'Nagapattinam', tagline: 'Velankanni, coastal trails & port breeze' },
  { id: 'Mayiladuthurai', name: 'Mayiladuthurai', tagline: 'Cauvery delta heritage & quiet temple towns' },
  { id: 'Tiruvarur', name: 'Tiruvarur', tagline: 'Chariot festivals & delta culture' },
  { id: 'Pudukkottai', name: 'Pudukkottai', tagline: 'Sittannavasal rock art & palace walks' },
  { id: 'Ariyalur', name: 'Ariyalur', tagline: 'Fossil sites & Gangaikonda Cholapuram' },
  { id: 'Perambalur', name: 'Perambalur', tagline: 'Ranjankudi fort & hillock treks' },
  { id: 'Kallakurichi', name: 'Kallakurichi', tagline: 'Kalrayan hills & jungle trails' },
  { id: 'Ranipet', name: 'Ranipet', tagline: 'Palar riverside & highway corridors' },
  { id: 'Tirupattur', name: 'Tirupattur', tagline: 'Yelagiri hill treks & lake boating' },
];

// 2. ALL 28 STATES & 8 UNION TERRITORIES OF INDIA
export const ALL_INDIAN_STATES: StateInfo[] = [
  // Major & Neighboring Hubs first
  { id: 'Tamil Nadu', name: 'Tamil Nadu', type: 'state', isPopular: true },
  { id: 'Karnataka', name: 'Karnataka', type: 'state', isPopular: true },
  { id: 'Kerala', name: 'Kerala', type: 'state', isPopular: true },
  { id: 'Telangana', name: 'Telangana', type: 'state', isPopular: true },
  { id: 'Andhra Pradesh', name: 'Andhra Pradesh', type: 'state', isPopular: true },
  { id: 'Maharashtra', name: 'Maharashtra', type: 'state', isPopular: true },
  { id: 'Delhi', name: 'Delhi (NCR)', type: 'ut', isPopular: true },
  { id: 'Goa', name: 'Goa', type: 'state', isPopular: true },
  
  // All other 21 States
  { id: 'Arunachal Pradesh', name: 'Arunachal Pradesh', type: 'state' },
  { id: 'Assam', name: 'Assam', type: 'state' },
  { id: 'Bihar', name: 'Bihar', type: 'state' },
  { id: 'Chhattisgarh', name: 'Chhattisgarh', type: 'state' },
  { id: 'Gujarat', name: 'Gujarat', type: 'state' },
  { id: 'Haryana', name: 'Haryana', type: 'state' },
  { id: 'Himachal Pradesh', name: 'Himachal Pradesh', type: 'state' },
  { id: 'Jharkhand', name: 'Jharkhand', type: 'state' },
  { id: 'Madhya Pradesh', name: 'Madhya Pradesh', type: 'state' },
  { id: 'Manipur', name: 'Manipur', type: 'state' },
  { id: 'Meghalaya', name: 'Meghalaya', type: 'state' },
  { id: 'Mizoram', name: 'Mizoram', type: 'state' },
  { id: 'Nagaland', name: 'Nagaland', type: 'state' },
  { id: 'Odisha', name: 'Odisha', type: 'state' },
  { id: 'Punjab', name: 'Punjab', type: 'state' },
  { id: 'Rajasthan', name: 'Rajasthan', type: 'state' },
  { id: 'Sikkim', name: 'Sikkim', type: 'state' },
  { id: 'Tripura', name: 'Tripura', type: 'state' },
  { id: 'Uttar Pradesh', name: 'Uttar Pradesh', type: 'state' },
  { id: 'Uttarakhand', name: 'Uttarakhand', type: 'state' },
  { id: 'West Bengal', name: 'West Bengal', type: 'state' },

  // Union Territories
  { id: 'Andaman and Nicobar', name: 'Andaman & Nicobar Islands', type: 'ut' },
  { id: 'Chandigarh', name: 'Chandigarh', type: 'ut' },
  { id: 'Dadra and Nagar Haveli', name: 'Dadra & Nagar Haveli and Daman & Diu', type: 'ut' },
  { id: 'Jammu and Kashmir', name: 'Jammu & Kashmir', type: 'ut' },
  { id: 'Ladakh', name: 'Ladakh', type: 'ut' },
  { id: 'Lakshadweep', name: 'Lakshadweep', type: 'ut' },
  { id: 'Puducherry', name: 'Puducherry', type: 'ut' },
];
