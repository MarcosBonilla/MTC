import type { Service } from '../types';

export const defaultServices: Service[] = [
  {
    id: '1',
    name: 'Audio Recording',
    description: 'Professional recording sessions with state-of-the-art equipment and acoustically treated rooms.',
    duration: 60,
    price: 80,
    color: '#f59e0b'
  },
  {
    id: '2',
    name: 'Mixing & Mastering', 
    description: 'Expert mixing and mastering services to give your tracks that professional polish.',
    duration: 90,
    price: 120,
    color: '#22c55e'
  },
  {
    id: '3',
    name: 'Music Production',
    description: 'Complete music production from concept to finished track with our experienced producers.',
    duration: 120,
    price: 150,
    color: '#3b82f6'
  },
  {
    id: '4',
    name: 'Music Lessons',
    description: 'One-on-one music lessons with professional instructors for all skill levels.',
    duration: 45,
    price: 60,
    color: '#8b5cf6'
  }
];

export const getServiceById = (id: string): Service | undefined => {
  return defaultServices.find(service => service.id === id);
};

export const getServicesByIds = (ids: string[]): Service[] => {
  return defaultServices.filter(service => ids.includes(service.id));
};

export const formatServiceDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

export const formatServicePrice = (price: number): string => {
  return `$${price}`;
};