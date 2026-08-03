import type { Metadata } from 'next';
import CareerDiscoveryClient from './CareerDiscoveryClient';

export const metadata: Metadata = {
  title: 'Career Discovery',
};

export default function CareerDiscoveryPage() {
  return <CareerDiscoveryClient />;
}
