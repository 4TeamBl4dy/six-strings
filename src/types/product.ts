import { SalerPublicProfile } from './saler'; // Adjusted import path

export interface Guitar {
  _id: string;
  img: string;
  name: string;
  cost: number;
  amount: number; // Represents stock/availability
  type: string; // e.g., 'electric', 'acoustic'
  brand?: string;
  description?: string;
  seller: SalerPublicProfile; // Updated to use SalerPublicProfile
  popularity?: number; // Added optional popularity field
}

// You might also want a type for Guitar creation or update if fields differ
// export interface GuitarFormData {
//   name: string;
//   cost: number;
//   amount: number;
//   type: string;
//   brand?: string;
//   description?: string;
//   // img might be handled as a File object
// }
