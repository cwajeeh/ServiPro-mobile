
export interface Category {
  id: string;
  name: string;
  serviceCount: number;
  icon: string; // Using string identifiers for icons for now
  emoji: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  image: string;
  backgroundColor: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  professionalCount: number;
  startingPrice: number;
  image: string;
  description: string;
}

export interface Tasker {
  id: string;
  name: string;
  profession: string;
  rating: number;
  location: string;
  pricePerHour: number;
  image: string;
  isAvailable: boolean;
}

export interface TaskBid {
  id: string;
  workerName: string;
  workerImage: string;
  bidAmount: number;
  message: string;
}

export interface BiddingTask {
  id: string;
  title: string;
  estimatedTime: string;
  distance: string;
  budget: number;
  icon: string;
  bids: TaskBid[];
}

export interface CustomerBooking {
  id: string;
  title: string;
  category: string;
  status: 'In Progress' | 'Scheduled' | 'Completed';
  workerName: string;
  workerImage: string;
  pricePerHour: number;
  description: string;
  estimatedTime: string;
  distance: string;
  timeSlot: string;
}

export const HISTORY_TASKS: CustomerBooking[] = [
  {
    id: 'h1',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'Completed',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: 'Today'
  },
  {
    id: 'h2',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'Completed',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: 'Today'
  },
  {
    id: 'h3',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'Completed',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: 'Today - 2:00PM'
  },
  {
    id: 'h4',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'Completed',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/4.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: 'Today'
  },
  {
    id: 'h5',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'Completed',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/5.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: 'Today'
  },
  {
    id: 'h6',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'Completed',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/6.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: 'Today - 2:00PM'
  }
];

export interface CustomerWalletTransaction {
  id: string;
  dateGroup: string;
  provider: string;
  category: string;
  status: string;
  price: string;
  title: string;
  description: string;
  time: string;
  distance: string;
  date: string;
}

export const CUSTOMER_WALLET_DATA: CustomerWalletTransaction[] = [
  {
    id: '1',
    dateGroup: 'Completed Within June 2025',
    provider: 'Jhon',
    category: 'Plumbing',
    status: 'Completed',
    price: '£25',
    title: 'Pipe Leakage Repair',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    time: '1-2 hrs',
    distance: '5Km Away',
    date: 'Today',
  },
  {
    id: '2',
    dateGroup: 'Completed Within June 2025',
    provider: 'Jhon',
    category: 'Plumbing',
    status: 'Completed',
    price: '£25',
    title: 'Pipe Leakage Repair',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    time: '1-2 hrs',
    distance: '5Km Away',
    date: 'Today',
  },
  {
    id: '3',
    dateGroup: 'Completed Within June 2025',
    provider: 'Jhon',
    category: 'Plumbing',
    status: 'Completed',
    price: '£25',
    title: 'Pipe Leakage Repair',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    time: '1-2 hrs',
    distance: '5Km Away',
    date: 'Today - 2:00PM',
  },
  {
    id: '4',
    dateGroup: 'Completed Within July 2025',
    provider: 'Jhon',
    category: 'Plumbing',
    status: 'Completed',
    price: '£25',
    title: 'Pipe Leakage Repair',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    time: '1-2 hrs',
    distance: '5Km Away',
    date: 'Today',
  },
];

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Plumbing', serviceCount: 10, icon: 'wrench', emoji: '🔧' },
  { id: '2', name: 'Carpentry', serviceCount: 9, icon: 'hammer', emoji: '🔨' },
  { id: '3', name: 'Locksmith', serviceCount: 9, icon: 'lock', emoji: '🔐' },
  { id: '4', name: 'Electrical', serviceCount: 9, icon: 'flash', emoji: '⚡' },
  { id: '5', name: 'Cleaning', serviceCount: 10, icon: 'broom', emoji: '🧹' },
  { id: '6', name: 'HVAC', serviceCount: 9, icon: 'air-conditioner', emoji: '❄️' },
  { id: '7', name: 'Flooring', serviceCount: 9, icon: 'floor-plan', emoji: '🏗️' },
  { id: '8', name: 'Roofing', serviceCount: 9, icon: 'home-roof', emoji: '🏠' },
];

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: '1',
    title: '30% OFF',
    subtitle: 'on your first order',
    ctaText: 'Grab The Deal',
    image: 'https://img.freepik.com/free-photo/handyman-with-his-tool-belt-blue-background_1368-554.jpg',
    backgroundColor: '#87CEEB',
  },
  {
    id: '2',
    title: 'Wall Painting',
    subtitle: 'Right to Your Door Step',
    ctaText: 'Grab The Deal',
    image: 'https://img.freepik.com/free-photo/painter-with-brush_23-2148171181.jpg',
    backgroundColor: '#008080',
  },
  {
    id: '3',
    title: 'Wall Painting',
    subtitle: 'Right to Your Door Step',
    ctaText: 'Grab The Deal',
    image: 'https://img.freepik.com/free-photo/painter-with-brush_23-2148171181.jpg',
    backgroundColor: '#455A64',
  },
  {
    id: '4',
    title: 'Wall Painting',
    subtitle: 'Right to Your Door Step',
    ctaText: 'Grab The Deal',
    image: 'https://img.freepik.com/free-photo/painter-with-brush_23-2148171181.jpg',
    backgroundColor: '#00BCD4',
  },
];

export const TOP_RATED_TASKERS: Tasker[] = [
  {
    id: '1',
    name: 'David Lee',
    profession: 'Plumber',
    rating: 4.5,
    location: '1234 Maple Street Apt. 56B Springfield, IL 62701 USA',
    pricePerHour: 14,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'David Lee',
    profession: 'Electrician',
    rating: 4.5,
    location: '1234 Maple Street Apt. 56B Springfield, IL 62701 USA',
    pricePerHour: 14,
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'David Lee',
    profession: 'Auto Mechanic',
    rating: 4.5,
    location: '1234 Maple Street Apt. 56B Springfield, IL 62701 USA',
    pricePerHour: 14,
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    isAvailable: true,
  },
  {
    id: '4',
    name: 'David Lee',
    profession: 'Carpenter',
    rating: 4.5,
    location: '1234 Maple Street Apt. 56B Springfield, IL 62701 USA',
    pricePerHour: 14,
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    isAvailable: true,
  },
];

export const SUB_CATEGORIES: SubCategory[] = [
  {
    id: 's1',
    categoryId: '1',
    name: 'Pipe installation & replacement',
    professionalCount: 4,
    startingPrice: 14,
    image: 'https://img.freepik.com/free-photo/plumber-working-client-s-house_23-2148171172.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolor ...'
  },
  {
    id: 's2',
    categoryId: '1',
    name: 'Drain cleaning services',
    professionalCount: 6,
    startingPrice: 20,
    image: 'https://img.freepik.com/free-photo/plumber-fixing-sink_23-2148171175.jpg',
    description: 'Professional drain cleaning for all types of blockages.'
  },
  {
    id: 's3',
    categoryId: '1',
    name: 'Leak detection services',
    professionalCount: 3,
    startingPrice: 25,
    image: 'https://img.freepik.com/free-photo/plumber-checking-pipes_23-2148171180.jpg',
    description: 'Advanced leak detection using modern technology.'
  },
  {
    id: 's4',
    categoryId: '1',
    name: 'Water heater installation',
    professionalCount: 5,
    startingPrice: 30,
    image: 'https://img.freepik.com/free-photo/repairman-fixing-electric-boiler_23-2148171185.jpg',
    description: 'Expert installation of all water heater brands.'
  },
  {
    id: 's5',
    categoryId: '1',
    name: 'Sewer line repair',
    professionalCount: 2,
    startingPrice: 40,
    image: 'https://img.freepik.com/free-photo/plumber-working-sewer-pipes_23-2148171190.jpg',
    description: 'High-quality sewer line repairs and maintenance.'
  },
  {
    id: 's6',
    categoryId: '1',
    name: 'Toilet installation',
    professionalCount: 4,
    startingPrice: 18,
    image: 'https://img.freepik.com/free-photo/plumber-fixing-toilet_23-2148171195.jpg',
    description: 'Reliable toilet installation and repair services.'
  },
  {
    id: 's7',
    categoryId: '1',
    name: 'Faucet repair and installation',
    professionalCount: 7,
    startingPrice: 15,
    image: 'https://img.freepik.com/free-photo/plumber-fixing-tap_23-2148171200.jpg',
    description: 'Fixing leaky faucets and installing new fixtures.'
  },
];

export const BIDDING_TASKS: BiddingTask[] = [
  {
    id: 'b1',
    title: 'Pipe Leakage Repair',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    budget: 200,
    icon: 'wrench',
    bids: [
      { id: 'bid1', workerName: 'Jhon', workerImage: 'https://randomuser.me/api/portraits/men/1.jpg', bidAmount: 150, message: 'Worker A has submitted a bid on your task. Please review and proceed accordingly.' },
      { id: 'bid2', workerName: 'Jhon', workerImage: 'https://randomuser.me/api/portraits/men/2.jpg', bidAmount: 120, message: 'Worker A has submitted a bid on your task. Please review and proceed accordingly.' },
      { id: 'bid3', workerName: 'Jhon', workerImage: 'https://randomuser.me/api/portraits/men/3.jpg', bidAmount: 130, message: 'Worker A has submitted a bid on your task. Please review and proceed accordingly.' },
    ]
  },
  {
    id: 'b2',
    title: 'Wall Painting',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    budget: 200,
    icon: 'palette',
    bids: [
      { id: 'bid4', workerName: 'Jhon', workerImage: 'https://randomuser.me/api/portraits/men/4.jpg', bidAmount: 150, message: 'Worker A has submitted a bid on your task. Please review and proceed accordingly.' },
    ]
  },
  {
    id: 'b3',
    title: 'Pest Control',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    budget: 200,
    icon: 'bug',
    bids: [
      { id: 'bid5', workerName: 'Jhon', workerImage: 'https://randomuser.me/api/portraits/men/5.jpg', bidAmount: 150, message: 'Worker A has submitted a bid on your task. Please review and proceed accordingly.' },
    ]
  }
];

/** Mock promo / demo content only in development; production uses empty promos until wired to CMS/API. */
export function customerDevMock<T>(mockValue: T, productionFallback: T): T {
  return __DEV__ ? mockValue : productionFallback;
}

export const BOOKING_TASKS: CustomerBooking[] = [
  {
    id: 'bk1',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'In Progress',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: 'Today'
  },
  {
    id: 'bk2',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'Scheduled',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: 'Tomorrow'
  },
  {
    id: 'bk3',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'Scheduled',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: '25/10/2025 - 2PM'
  },
  {
    id: 'bk4',
    title: 'Pipe Leakage Repair',
    category: 'Plumbing',
    status: 'Scheduled',
    workerName: 'Jhon',
    workerImage: 'https://randomuser.me/api/portraits/men/4.jpg',
    pricePerHour: 25,
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction ...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    timeSlot: '25/10/2025 - 2PM'
  }
];
