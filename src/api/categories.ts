import { Category } from '../types/categories';

// Placeholder/mock function for fetching categories.
// In a real application, this would make an API call.
export const getCategories = async (): Promise<Category[]> => {
  console.log('API: Fetching categories (mocked)');
  // Simulate an API call delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Return a static list of categories, similar to what's used in components
  return [
    { id: '1', value: 'electric', name: 'Электрогитары', label: 'Электрические гитары' },
    { id: '2', value: 'acoustic', name: 'Акустические гитары', label: 'Акустические гитары' },
    { id: '3', value: 'classic', name: 'Классические гитары', label: 'Классические гитары' },
    { id: '4', value: 'bass', name: 'Бас-гитары', label: 'Бас-гитары' },
    { id: '5', value: 'combo', name: 'Комбоусилители', label: 'Комбоусилители' },
    { id: '6', value: 'accessories', name: 'Аксессуары', label: 'Аксессуары' },
    // Add other categories as needed, ensure they match the Category type
  ];
};
