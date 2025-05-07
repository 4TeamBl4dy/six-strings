// Обработчик ошибки загрузки изображения
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  console.error(`Ошибка загрузки изображения: ${e.currentTarget.src}`);
  e.currentTarget.src = '/placeholder.png';
};