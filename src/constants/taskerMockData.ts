import { JobItem } from '../components/tasker/JobCard';

/** Mock tasker jobs / wallet rows only in development; production shows empty states until tasker APIs are wired. */
export function taskerDevMock<T>(mockValue: T, productionFallback: T): T {
  return __DEV__ ? mockValue : productionFallback;
}

export type TaskerHomeViewModel = {
  userName: string;
  location: string;
  notificationCount: number;
  earningsToday: number;
  ongoingJob: JobItem | null;
  todayJobs: JobItem[];
};

export const EMPTY_TASKER_HOME: TaskerHomeViewModel = {
  userName: '',
  location: '',
  notificationCount: 0,
  earningsToday: 0,
  ongoingJob: null,
  todayJobs: [],
};

export const taskerCategories = [
  { id: '1', name: 'Plumbing', icon: '🔧' },
  { id: '2', name: 'Carpentry', icon: '🔨' },
  { id: '3', name: 'Electrical', icon: '⚡' },
  { id: '4', name: 'Painting & Decoration', icon: '🖌️' },
  { id: '5', name: 'Home Appliance', icon: '🔌' },
  { id: '6', name: 'Cleaning', icon: '🧹' },
  { id: '7', name: 'HVAC', icon: '❄️' },
  { id: '8', name: 'Flooring & Tiling', icon: '🏗️' },
  { id: '9', name: 'Masonry & Construction', icon: '🧱' },
  { id: '10', name: 'Gardening & Landscaping', icon: '🌱' },
  { id: '11', name: 'Roofing', icon: '🏠' },
  { id: '12', name: 'Glass & Aluminum Work', icon: '🪟' },
  { id: '13', name: 'Locksmith', icon: '🔐' },
  { id: '14', name: 'Pest Control', icon: '🐛' },
  { id: '15', name: 'General Handyman', icon: '🛠️' },
];

export const taskerSubCategories: Record<string, string[]> = {
  '1': [
    'General Plumbing',
    'Bathroom Plumbing',
    'Kitchen Plumbing',
    'Water Systems',
    'Drainage & Sewer',
    'Emergency Plumbing',
    'Commercial & Construction Plumbing',
    'Specialized Plumbing Services',
    'Eco-Friendly Plumbing',
    'Maintenance & Inspection',
    'Commercial Plumbing',
  ],
  // Fallback for others
  default: [
    'General Service',
    'Emergency Service',
    'Maintenance',
    'Installation',
    'Repair',
    'Inspection',
  ]
};

export const taskerSuggestedSkills = [
  'Leak Detection & Repair',
  'Pump Services',
  'Pipe Installation & Replacement',
  'Faucet & Fixture Installation',
  'Water Pressure Issues',
  'Plumbing Maintenance',
  'Sink & Tap Repair',
];

export const mockCertificates = [
  {
    id: 'c1',
    name: 'Heritage Carpentry NVQ Level 2',
    date: 'July, 2024',
    description: 'Certification in advanced general maintenance skills regarding heritage site procedures.',
  }
];

export const TASKER_HOME_DATA: TaskerHomeViewModel = {
  userName: 'Muhammad Azeem',
  location: 'San Francisco, CA',
  notificationCount: 5,
  earningsToday: 500,
  ongoingJob: {
    id: 'ongoing-1',
    title: 'Pipe Leakage Repair',
    price: '£20/h',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    time: 'Now - 2:00PM',
    timer: '1:26mins',
    tasker: {
      name: 'Jhon',
      avatar: 'https://i.pravatar.cc/150?u=jhon',
    },
  },
  todayJobs: [
    {
      id: 'job-1',
      category: 'Plumbing',
      title: 'Pipe Leakage Repair',
      price: '£45/h',
      description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
      estimatedTime: '1-2 hrs',
      distance: '5Km Away',
      time: 'Today',
      tasker: {
        name: 'David Lee',
        avatar: 'https://i.pravatar.cc/150?u=david',
        rating: 4.5,
        address: '1234 Maple Street Apt. 56B Springfield, IL 62701 USA',
      },
      budget: '£200',
      workingHours: 2,
      dateTime: 'Tomorrow | 2:00PM',
      media: {
        images: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80',
          'https://images.unsplash.com/photo-1585704032915-c3400ca1f964?auto=format&fit=crop&w=300&q=80',
          'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?auto=format&fit=crop&w=300&q=80',
        ],
        videoThumbnail: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      },
    },
  ],
};

export const TASKER_JOB_FILTERS = ['Quick', 'Hourly', 'Fixed Rate'];

export const TASKER_FIND_JOBS_DATA = [
  ...TASKER_HOME_DATA.todayJobs,
  {
    id: 'job-2',
    category: 'Plumbing',
    title: 'Pipe Leakage Repair',
    price: '£45/h',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    time: 'Today',
    tasker: {
      name: 'David Lee',
      avatar: 'https://i.pravatar.cc/150?u=david',
      rating: 4.5,
      address: '1234 Maple Street Apt. 56B Springfield, IL 62701 USA',
    },
    budget: '£200',
    workingHours: 2,
    dateTime: 'Tomorrow | 2:00PM',
  },
  {
    id: 'job-3',
    category: 'Plumbing',
    title: 'Pipe Leakage Repair',
    price: '£45/h',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    time: 'Today',
    tasker: {
      name: 'David Lee',
      avatar: 'https://i.pravatar.cc/150?u=david',
      rating: 4.5,
      address: '1234 Maple Street Apt. 56B Springfield, IL 62701 USA',
    },
    budget: '£200',
    workingHours: 2,
    dateTime: 'Tomorrow | 2:00PM',
  },
];

export const TASKER_BIDDING_DATA: JobItem[] = [
  {
    id: 'bid-1',
    title: 'Home Cleaning',
    price: '£80',
    category: 'Cleaning',
    description: 'Weekly cleaning of a 3-bedroom house, including kitchen and bathrooms.',
    estimatedTime: '3-4 hrs',
    distance: '3Km Away',
    time: 'Today',
    tasker: {
      name: 'Alice',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    },
    budget: '£100',
    workingHours: 4,
    dateTime: 'Today | 10:00AM',
  },
];

export const TASKER_HISTORY_DATA: JobItem[] = [
  {
    id: 'hist-1',
    title: 'Pipe Leakage Repair',
    price: '£25/h',
    category: 'Plumbing',
    status: 'In Progress',
    dateGroup: 'Today',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    time: 'Today',
    tasker: {
      name: 'Jhon',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
  },
  {
    id: 'hist-2',
    title: 'Pipe Leakage Repair',
    price: '£25/h',
    category: 'Plumbing',
    status: 'Completed',
    dateGroup: 'Today',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    time: 'Today',
    tasker: {
      name: 'Jhon',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
  },
  {
    id: 'hist-3',
    title: 'Pipe Leakage Repair',
    price: '£25/h',
    category: 'Plumbing',
    status: 'Completed',
    dateGroup: 'Today',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    time: 'Today',
    tasker: {
      name: 'Jhon',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
  },
  {
    id: 'hist-4',
    title: 'Pipe Leakage Repair',
    price: '£25/h',
    category: 'Plumbing',
    status: 'Completed',
    dateGroup: '24 August 2025',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
    estimatedTime: '1-2 hrs',
    distance: '5Km Away',
    time: 'Today',
    tasker: {
      name: 'Jhon',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
  },
];

export interface Transaction {
  id: string;
  provider: string;
  category: string;
  status: 'Pending' | 'Paid';
  title: string;
  description: string;
  price: string;
  time: string;
  distance: string;
  date: string;
  dateGroup: string;
}

export const TASKER_WALLET_DATA: Transaction[] = [
  {
    id: '1',
    provider: 'Jhon',
    category: 'Plumbing',
    status: 'Pending',
    title: 'Pipe Leakage Repair',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
    price: '£25/h',
    time: '1-2 hrs',
    distance: '5Km Away',
    date: 'Today',
    dateGroup: 'Today',
  },
  {
    id: '2',
    provider: 'Jhon',
    category: 'Plumbing',
    status: 'Paid',
    title: 'Pipe Leakage Repair',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
    price: '£500',
    time: '1-2 hrs',
    distance: '5Km Away',
    date: '24 Aug 2025',
    dateGroup: '24 August 2025',
  },
  {
    id: '3',
    provider: 'Jhon',
    category: 'Plumbing',
    status: 'Paid',
    title: 'Pipe Leakage Repair',
    description: 'A plumbing repair task typically involves identifying the source of a leak, blockage, or malfunction...',
    price: '£25/h',
    time: '1-2 hrs',
    distance: '5Km Away',
    date: 'Today',
    dateGroup: '24 August 2025',
  },
];
