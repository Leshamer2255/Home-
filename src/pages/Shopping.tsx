import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button, Card, Form, Modal, ListGroup, Badge, Table } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  completed: boolean;
  list: string;
  purchaseDate?: string;
}

interface ShoppingList {
  id: string;
  name: string;
  budget: number;
  totalSpent: number;
}

const CATEGORIES = ['Продукти', 'Побутова хімія', 'Електроніка', 'Одяг', 'Інше'];
const LISTS = ['Щоденні покупки', 'Тижневий запас', 'Спеціальні покупки'];

const Shopping: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<ShoppingItem>>({
    category: 'Продукти',
    quantity: 1,
    price: 0,
    list: LISTS[0]
  });
  const [filter, setFilter] = useState({
    category: '',
    list: '',
    completed: false
  });

  useEffect(() => {
    const savedItems = localStorage.getItem('shoppingItems');
    const savedLists = localStorage.getItem('shoppingLists');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    } else {
      // Створюємо списки за замовчуванням
      const defaultLists = LISTS.map(name => ({
        id: Date.now().toString() + Math.random(),
        name,
        budget: 0,
        totalSpent: 0
      }));
      setLists(defaultLists);
      localStorage.setItem('shoppingLists', JSON.stringify(defaultLists));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? { ...newItem, id: item.id } as ShoppingItem : item
      ));
    } else {
      setItems([...items, { ...newItem, id: Date.now().toString() } as ShoppingItem]);
    }
    setShowModal(false);
    setEditingItem(null);
    setNewItem({ category: 'Продукти', quantity: 1, price: 0, list: LISTS[0] });
  };

  const handleEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setNewItem(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleComplete = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed, purchaseDate: !item.completed ? new Date().toISOString() : undefined } : item
    ));
  };

  const handleListBudgetChange = (listId: string, budget: number) => {
    setLists(lists.map(list =>
      list.id === listId ? { ...list, budget } : list
    ));
  };

  const filteredItems = items.filter(item => {
    if (filter.category && item.category !== filter.category) return false;
    if (filter.list && item.list !== filter.list) return false;
    if (filter.completed !== item.completed) return false;
    return true;
  });

  const getListTotal = (listId: string) => {
    return items
      .filter(item => item.list === listId && item.completed)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Покупки</h2>
            <Button variant="light" onClick={() => setShowModal(true)}>
              <FaIcons.FaPlus className="me-2" />Новий товар
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="row mb-4">
            <div className="col-md-4">
              <Form.Select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              >
                <option value="">Всі категорії</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Select
                value={filter.list}
                onChange={(e) => setFilter({ ...filter, list: e.target.value })}
              >
                <option value="">Всі списки</option>
                {LISTS.map(list => (
                  <option key={list} value={list}>{list}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Check
                type="switch"
                id="completed-filter"
                label="Показати куплені"
                checked={filter.completed}
                onChange={(e) => setFilter({ ...filter, completed: e.target.checked })}
              />
            </div>
          </div>

          <div className="row mb-4">
            {lists.map(list => (
              <div key={list.id} className="col-md-4 mb-3">
                <Card>
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{list.name}</h5>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowHistoryModal(true)}
                      >
                        <FaIcons.FaHistory className="me-1" />
                        Історія
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Бюджет</Form.Label>
                      <Form.Control
                        type="number"
                        value={list.budget}
                        onChange={(e) => handleListBudgetChange(list.id, Number(e.target.value))}
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-between">
                      <span>Витрачено:</span>
                      <span className={getListTotal(list.id) > list.budget ? 'text-danger' : 'text-success'}>
                        {getListTotal(list.id)} грн
                      </span>
                    </div>
                    {list.budget > 0 && (
                      <div className="progress mt-2">
                        <div
                          className={`progress-bar ${getListTotal(list.id) > list.budget ? 'bg-danger' : 'bg-success'}`}
                          role="progressbar"
                          style={{ width: `${Math.min((getListTotal(list.id) / list.budget) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>

          <ListGroup>
            {filteredItems.length === 0 ? (
              <div className="text-center py-4">
                <FaIcons.FaShoppingCart size={48} className="text-muted mb-3" />
                <h4>Немає товарів</h4>
                <p className="text-muted">Додайте новий товар або змініть фільтри</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <ListGroup.Item
                  key={item.id}
                  className={`d-flex justify-content-between align-items-center ${item.completed ? 'bg-light' : ''}`}
                >
                  <div>
                    <h5 className={`mb-1 ${item.completed ? 'text-muted text-decoration-line-through' : ''}`}>
                      {item.name}
                    </h5>
                    <div className="d-flex gap-2">
                      <Badge bg="secondary">{item.category}</Badge>
                      <Badge bg="info">{item.list}</Badge>
                      <span className="text-muted">
                        {item.quantity} шт. × {item.price} грн = {item.quantity * item.price} грн
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant={item.completed ? "outline-success" : "success"}
                      size="sm"
                      onClick={() => handleComplete(item.id)}
                    >
                      {item.completed ? 'Відновити' : 'Куплено'}
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <FaIcons.FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaIcons.FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingItem(null);
        setNewItem({ category: 'Продукти', quantity: 1, price: 0, list: LISTS[0] });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? 'Редагувати товар' : 'Новий товар'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Назва</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newItem.name || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Категорія</Form.Label>
              <Form.Select
                name="category"
                value={newItem.category}
                onChange={handleInputChange}
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Список</Form.Label>
              <Form.Select
                name="list"
                value={newItem.list}
                onChange={handleInputChange}
              >
                {LISTS.map(list => (
                  <option key={list} value={list}>{list}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Кількість</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                min="1"
                value={newItem.quantity}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ціна (грн)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={newItem.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            setEditingItem(null);
            setNewItem({ category: 'Продукти', quantity: 1, price: 0, list: LISTS[0] });
          }}>
            Скасувати
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingItem ? 'Зберегти' : 'Додати'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Історія покупок</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Товар</th>
                <th>Категорія</th>
                <th>Кількість</th>
                <th>Ціна</th>
                <th>Сума</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter(item => item.completed && item.purchaseDate)
                .sort((a, b) => new Date(b.purchaseDate!).getTime() - new Date(a.purchaseDate!).getTime())
                .map(item => (
                  <tr key={item.id}>
                    <td>{new Date(item.purchaseDate!).toLocaleDateString()}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price} грн</td>
                    <td>{item.quantity * item.price} грн</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Закрити
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Shopping; 