import './styles.css';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';

interface Guitar {
  _id: string;
  img: string;
  name: string;
  description: string;
  cost: number;
  amount: number;
  type: string;
  brand: string;
  seller: {
    login: string;
    name: string;
    phone: string;
  };
}

export const MyProductsPage = () => {
  const [guitars, setGuitars] = useState<Guitar[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [img, setImage] = useState<File | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [brand, setBrand] = useState<string>('');

  const [editingGuitarId, setEditingGuitarId] = useState<string | null>(null);
  const [editedGuitarImg, setEditedGuitarImg] = useState<{ [key: string]: File | null }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const sellerLogin = localStorage.getItem('login') || '';
  const userName = localStorage.getItem('userName') || '';
  const userPhone = localStorage.getItem('userPhone') || '';

  useEffect(() => {
    const fetchGuitars = async () => {
      try {
        const response: AxiosResponse<Guitar[]> = await axios.get('http://localhost:8080/guitars');
        console.log('Полученные гитары:', response.data); 
        const sellerGuitars = response.data.filter(guitar => guitar.seller?.login === sellerLogin);
        setGuitars(sellerGuitars || []);
      } catch (error) {
        console.error('Ошибка при загрузке гитар:', error);
        setError('Не удалось загрузить товары.');
      }
    };
    if (sellerLogin) {
      fetchGuitars();
    }
  }, [sellerLogin]);

  const imageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImage(file);
  };

  const imageChangeId = (event: ChangeEvent<HTMLInputElement>, guitarId: string) => {
    const file = event.target.files?.[0] || null;
    setEditedGuitarImg((prevImages) => ({
      ...prevImages,
      [guitarId]: file,
    }));
  };

  const createGuitar = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!name || !img || !description || !cost || !amount || !type || !brand || !sellerLogin) {
      setError('Пропущено поле. Повторите ввод.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('img', img);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('cost', cost);
      formData.append('amount', amount);
      formData.append('type', type);
      formData.append('brand', brand);
      formData.append('sellerLogin', sellerLogin);
      formData.append('userName', userName);
      formData.append('userPhone', userPhone);

      console.log('Отправка данных для создания:', [...formData.entries()]); // Для отладки
      const response: AxiosResponse<Guitar> = await axios.post('http://localhost:8080/guitars', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setGuitars((prev) => [...prev, response.data]);
      resetForm();
    } catch (error) {
      console.error('Ошибка при добавлении гитары:', error);
      setError('Не удалось добавить товар.');
      resetForm();
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredGuitars = guitars.filter((guitar) =>
    guitar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const editGuitar = (guitarId: string) => {
    const guitar = guitars.find((g) => g._id === guitarId);
    if (guitar) {
      setEditingGuitarId(guitarId);
      setImage(null);
      setName(guitar.name);
      setDescription(guitar.description);
      setCost(String(guitar.cost));
      setAmount(String(guitar.amount));
      setType(guitar.type);
      setBrand(guitar.brand);
    }
  };

  const updateGuitar = async (guitarId: string) => {
    try {
      const formData = new FormData();
      if (editedGuitarImg[guitarId]) {
        formData.append('img', editedGuitarImg[guitarId]!);
      } else {
        formData.append('img', guitars.find((g) => g._id === guitarId)!.img); // Передаем текущий URL
      }
      formData.append('name', name);
      formData.append('description', description);
      formData.append('cost', String(parseFloat(cost)));
      formData.append('amount', String(parseInt(amount, 10)));
      formData.append('type', type);
      formData.append('brand', brand);
      formData.append('sellerLogin', sellerLogin);
      formData.append('userName', userName);
      formData.append('userPhone', userPhone);

      console.log('Отправка данных для обновления:', [...formData.entries()]); // Для отладки
      const response: AxiosResponse<Guitar> = await axios.put(`http://localhost:8080/guitars/${guitarId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setGuitars((prev) =>
        prev.map((guitar) => (guitar._id === guitarId ? response.data : guitar))
      );
      resetForm();
    } catch (error) {
      console.error('Ошибка при обновлении гитары:', error);
      setError('Не удалось обновить товар.');
    }
  };

  const resetForm = () => {
    setImage(null);
    setName('');
    setDescription('');
    setCost('');
    setAmount('');
    setType('');
    setBrand('');
    setEditingGuitarId(null);
    setEditedGuitarImg({});
    setError(null);
  };

  const deleteGuitar = async (guitarId: string) => {
    try {
      await axios.delete(`http://localhost:8080/guitars/${guitarId}`);
      setGuitars((prev) => prev.filter((guitar) => guitar._id !== guitarId));
    } catch (error) {
      console.error('Ошибка при удалении гитары:', error);
      setError('Не удалось удалить товар.');
    }
  };

  return (
    <div className="Menu">
      <div className="addGuitar">
        <h1>Добавить товар</h1>
        <div className="addGuitar-form">
          <input className="changeImage" type="file" onChange={imageChange} accept="image/*" />
          <input
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Название"
          />
          <input
            value={description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            placeholder="Описание"
          />
          <input
            value={cost}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCost(e.target.value)}
            placeholder="Цена"
          />
          <input
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            placeholder="Количество"
          />
          <input
            value={type}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setType(e.target.value)}
            placeholder="Тип"
          />
          <input
            value={brand}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBrand(e.target.value)}
            placeholder="Бренд"
          />
          {error && <nav className="error">{error}</nav>}
          <button onClick={createGuitar}>Добавить</button>
        </div>
      </div>

      <div className="infoChange">
        <h1 className="infoGuitars">Информация о товарах</h1>
        <div className="searchAdmin">
          <label htmlFor="search">Поиск по названию:</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Введите название"
          />
        </div>

        <div className="cards">
          {filteredGuitars.map((guitar) => (
            <div className="adminCard" key={guitar._id}>
              {editingGuitarId === guitar._id ? (
                <div>
                  <input
                    type="file"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => imageChangeId(e, guitar._id)}
                    accept="image/*"
                  />
                  <img
                    src={
                      editedGuitarImg[guitar._id]
                        ? URL.createObjectURL(editedGuitarImg[guitar._id]!)
                        : guitar.img // Используем URL из R2
                    }
                    alt={guitar.name}
                  />
                  <input
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    placeholder="Название"
                  />
                  <input
                    value={description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                    placeholder="Описание"
                  />
                  <input
                    value={cost}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCost(e.target.value)}
                    placeholder="Цена"
                  />
                  <input
                    value={amount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                    placeholder="Количество"
                  />
                  <input
                    value={type}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setType(e.target.value)}
                    placeholder="Тип"
                  />
                  <input
                    value={brand}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBrand(e.target.value)}
                    placeholder="Бренд"
                  />
                  <button onClick={() => updateGuitar(guitar._id)}>Сохранить</button>
                  <button onClick={resetForm}>Отменить</button>
                </div>
              ) : (
                <div>
                  <img src={guitar.img} alt={guitar.name} /> 
                  <nav>Название: {guitar.name}</nav>
                  <nav>Описание: {guitar.description}</nav>
                  <nav>Цена: {guitar.cost}</nav>
                  <nav>Количество на складе: {guitar.amount}</nav>
                  <nav>Тип товара: {guitar.type}</nav>
                  <nav>Название бренда: {guitar.brand}</nav>
                  <button onClick={() => editGuitar(guitar._id)}>Изменить</button>
                  <button onClick={() => deleteGuitar(guitar._id)}>Удалить</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};