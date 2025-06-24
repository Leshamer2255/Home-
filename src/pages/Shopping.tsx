import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button, Card, Form, Modal, ListGroup, Badge, Table } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa';
import BarcodeScanner from '../components/BarcodeScanner';

interface StorePrice {
  store: string;
  price: number;
}

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  prices: StorePrice[];
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

interface ShoppingTemplate {
  id: string;
  name: string;
  items: Omit<ShoppingItem, 'id' | 'completed' | 'purchaseDate'>[];
}

const CATEGORIES = ['Продукти', 'Побутова хімія', 'Електроніка', 'Одяг', 'Інше'];
const LISTS = ['Щоденні покупки', 'Тижневий запас', 'Спеціальні покупки'];

const Shopping: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [templates, setTemplates] = useState<ShoppingTemplate[]>(() => {
    const saved = localStorage.getItem('shoppingTemplates');
    return saved ? JSON.parse(saved) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<ShoppingItem>>({
    category: 'Продукти',
    quantity: 1,
    prices: [{ store: '', price: 0 }],
    list: LISTS[0]
  });
  const [filter, setFilter] = useState({
    category: '',
    list: '',
    completed: false
  });
  const [templateName, setTemplateName] = useState('');

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

  useEffect(() => {
    localStorage.setItem('shoppingTemplates', JSON.stringify(templates));
  }, [templates]);

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
    setNewItem({ category: 'Продукти', quantity: 1, prices: [{ store: '', price: 0 }], list: LISTS[0] });
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
      .reduce((sum, item) => sum + (item.prices[0].price * item.quantity), 0);
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  // Мапа для зберігання штрих-кодів і назв товарів (можна розширити або замінити на API)
  const barcodeMap: Record<string, { name: string; category: string }> = {
    '4820000000000': { name: 'Молоко', category: 'Продукти' },
    '4820000000001': { name: 'Хліб', category: 'Продукти' },
    // Додайте більше штрих-кодів за потреби
  };

  const handleBarcodeDetected = (barcode: string) => {
    setShowScanner(false);
    const found = barcodeMap[barcode];
    if (found) {
      setNewItem(prev => ({
        ...prev,
        name: found.name,
        category: found.category,
      }));
      setShowModal(true);
    } else {
      alert('Товар з цим штрих-кодом не знайдено.');
    }
  };

  const saveCurrentAsTemplate = () => {
    const template: ShoppingTemplate = {
      id: Date.now().toString(),
      name: templateName || `Шаблон ${templates.length + 1}`,
      items: items.map(({ id, completed, purchaseDate, ...rest }) => rest),
    };
    setTemplates([...templates, template]);
    setShowTemplateModal(false);
    setTemplateName('');
  };

  const applyTemplate = (template: ShoppingTemplate) => {
    setItems([
      ...items,
      ...template.items.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random(),
        completed: false,
        purchaseDate: undefined,
      })),
    ]);
  };

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Покупки</h2>
            <div>
              <Button variant="light" onClick={() => setShowModal(true)} className="me-2">
                <FaIcons.FaPlus className="me-2" />Новий товар
              </Button>
              <Button variant="outline-light" onClick={() => setShowScanner(true)} className="me-2">
                <FaIcons.FaBarcode className="me-2" />Сканувати штрих-код
              </Button>
              <Button variant="outline-light" onClick={() => setShowTemplateModal(true)}>
                <FaIcons.FaSave className="me-2" />Зберегти як шаблон
              </Button>
            </div>
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
              filteredItems.map(item => {
                const minPriceObj = (item.prices || []).reduce((min, p) => (p.price < min.price ? p : min), { store: '', price: Infinity });
                return (
                  <ListGroup.Item
                    key={item.id}
                    className={`d-flex justify-content-between align-items-center ${item.completed ? 'bg-light' : ''}`}
                  >
                    <div>
                      <h5 className={`mb-1 ${item.completed ? 'text-muted text-decoration-line-through' : ''}`}>
                        {item.name}
                      </h5>
                      <div className="d-flex gap-2 align-items-center">
                        <Badge bg="secondary">{item.category}</Badge>
                        <Badge bg="info">{item.list}</Badge>
                        {minPriceObj.price !== Infinity && (
                          <span className="text-success">
                            {item.quantity} шт. × {minPriceObj.price} грн = {item.quantity * minPriceObj.price} грн
                            <span className="ms-2 text-muted">({minPriceObj.store || 'Магазин не вказано'})</span>
                          </span>
                        )}
                      </div>
                      {item.prices && item.prices.length > 1 && (
                        <div className="mt-1 small text-muted">
                          Інші ціни: {item.prices.filter(p => p !== minPriceObj).map((p, i) => `${p.price} грн (${p.store || 'Магазин не вказано'})`).join(', ')}
                        </div>
                      )}
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
                );
              })
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingItem(null);
        setNewItem({ category: 'Продукти', quantity: 1, prices: [{ store: '', price: 0 }], list: LISTS[0] });
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
              <Form.Label>Ціни в магазинах</Form.Label>
              {(newItem.prices || [{ store: '', price: 0 }]).map((sp, idx) => (
                <div key={idx} className="d-flex mb-2 align-items-center gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Магазин"
                    value={sp.store}
                    onChange={e => {
                      const prices = [...(newItem.prices || [])];
                      prices[idx] = { ...prices[idx], store: e.target.value };
                      setNewItem(prev => ({ ...prev, prices }));
                    }}
                    style={{ maxWidth: 120 }}
                  />
                  <Form.Control
                    type="number"
                    placeholder="Ціна"
                    min="0"
                    step="0.01"
                    value={sp.price}
                    onChange={e => {
                      const prices = [...(newItem.prices || [])];
                      prices[idx] = { ...prices[idx], price: Number(e.target.value) };
                      setNewItem(prev => ({ ...prev, prices }));
                    }}
                    style={{ maxWidth: 100 }}
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      const prices = [...(newItem.prices || [])];
                      prices.splice(idx, 1);
                      setNewItem(prev => ({ ...prev, prices }));
                    }}
                    disabled={(newItem.prices || []).length === 1}
                  >
                    -
                  </Button>
                  {idx === (newItem.prices?.length || 1) - 1 && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => {
                        setNewItem(prev => ({
                          ...prev,
                          prices: [...(prev.prices || []), { store: '', price: 0 }]
                        }));
                      }}
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            setEditingItem(null);
            setNewItem({ category: 'Продукти', quantity: 1, prices: [{ store: '', price: 0 }], list: LISTS[0] });
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
                    <td>{item.prices[0]?.price} грн</td>
                    <td>{item.quantity * item.prices[0]?.price} грн</td>
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

      <Modal show={showScanner} onHide={() => setShowScanner(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Сканування штрих-коду</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BarcodeScanner onDetected={handleBarcodeDetected} />
          <div className="text-muted mt-2">Наведіть камеру на штрих-код товару</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowScanner(false)}>
            Скасувати
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Зберегти список як шаблон</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Назва шаблону</Form.Label>
            <Form.Control
              type="text"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="Введіть назву шаблону"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
            Скасувати
          </Button>
          <Button variant="primary" onClick={saveCurrentAsTemplate}>
            Зберегти
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="mb-3">
        <Form.Label>Додати товари з шаблону:</Form.Label>
        <Form.Select onChange={e => {
          const t = templates.find(t => t.id === e.target.value);
          if (t) applyTemplate(t);
        }} defaultValue="">
          <option value="">Оберіть шаблон</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Form.Select>
      </div>
    </div>
  );
};

export default Shopping;