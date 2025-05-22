// Обработчик ошибки загрузки изображения
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  console.error(`Ошибка загрузки изображения: ${e.currentTarget.src}`);
  e.currentTarget.src = '/placeholder.png';
};

// Функция для нормализации номера телефона
export const normalizePhoneNumber = (phone: string): string => {
  // Удаляем все нечисловые символы
  const cleanedPhone = phone.replace(/\D/g, '');

  // Если номер уже начинается с +, возвращаем как есть или нормализуем
  if (phone.startsWith('+')) {
    if (cleanedPhone.length === 11 && cleanedPhone.startsWith('7')) {
      return `+${cleanedPhone}`; // Например, +7771234567
    } else if (cleanedPhone.length === 12 && cleanedPhone.startsWith('7')) {
      return `+${cleanedPhone.slice(1)}`; // Удаляем лишнюю 7, если есть
    }
    return `+${cleanedPhone}`; // Дефолтный случай для +номера
  }

  // Проверяем длину и добавляем код страны, если его нет
  if (cleanedPhone.length === 11 && cleanedPhone.startsWith('8')) {
    // Например, 87771234567 -> +77771234567
    return `+7${cleanedPhone.slice(1)}`;
  } else if (cleanedPhone.length === 10) {
    // Например, 7771234567 -> +77771234567
    return `+7${cleanedPhone}`;
  } else if (cleanedPhone.length === 12 && cleanedPhone.startsWith('7')) {
    // Например, 77771234567 -> +77771234567
    return `+${cleanedPhone}`;
  } else if (cleanedPhone.length >= 11 && !cleanedPhone.startsWith('+')) {
    // Если номер длинный, но без кода страны, добавляем +7 (для Казахстана)
    return `+7${cleanedPhone}`;
  }

  // Если номер не соответствует ожиданиям, возвращаем как есть с добавлением +
  return `+${cleanedPhone}`;
};