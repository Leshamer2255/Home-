import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Badge } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  location: string;
  lastUpdated: string;
  notes: string;
}

const categories = [
  'Меблі',
  'Побутова техніка',
  'Електроніка',
  'Одяг',
  'Взуття',
  'Кухонне приладдя',
  'Інструменти',
  'Інше'
];

const locations = [
  'Вітальня',
  'Спальня',
  'Кухня',
  'Ванна',
  'Гардероб',
  'Гараж',
  'Сховище'
];

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    search: ''
  });

  const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'lastUpdated'>>({
    name: '',
    category: '',
    quantity: 1,
    location: '',
    notes: ''
  });

  useEffect(() => {
    const savedItems = localStorage.getItem('inventoryItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inventoryItems', JSON.stringify(items));
  }, [items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    if (editingItem) {
      const updatedItems = items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, lastUpdated: now }
          : item
      );
      setItems(updatedItems);
    } else {
      const newItem: InventoryItem = {
        id: Date.now(),
        ...formData,
        lastUpdated: now
      };
      setItems([...items, newItem]);
    }

    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      quantity: 1,
      location: '',
      notes: ''
    });
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      notes: item.notes
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей предмет?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const filteredItems = items.filter(item => {
    return (
      (filters.category === '' || item.category === filters.category) &&
      (filters.location === '' || item.location === filters.location) &&
      (filters.search === '' || 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.notes.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <Container>
          <h1>Інвентар</h1>
          <p className="mb-0">Управління домашнім майном</p>
        </Container>
      </div>

      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Список предметів</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaPlus className="me-2" /> Додати предмет
          </Button>
        </div>

        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Категорія</Form.Label>
                  <Form.Select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">Всі категорії</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Місце</Form.Label>
                  <Form.Select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  >
                    <option value="">Всі місця</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Пошук</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Пошук за назвою..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Назва</th>
                <th>Категорія</th>
                <th>Кількість</th>
                <th>Місце</th>
                <th>Останнє оновлення</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    <Badge bg="primary">{item.category}</Badge>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.location}</td>
                  <td>{new Date(item.lastUpdated).toLocaleDateString('uk-UA')}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>

      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
          name: '',
          category: '',
          quantity: 1,
          location: '',
          notes: ''
        });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Редагувати предмет' : 'Додати предмет'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Назва</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Категорія</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Виберіть категорію</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Кількість</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Місце</Form.Label>
              <Form.Select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              >
                <option value="">Виберіть місце</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Примітки</Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => {
                setShowModal(false);
                setEditingItem(null);
                setFormData({
                  name: '',
                  category: '',
                  quantity: 1,
                  location: '',
                  notes: ''
                });
              }}>
                Скасувати
              </Button>
              <Button variant="primary" type="submit">
                {editingItem ? 'Зберегти зміни' : 'Додати предмет'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Inventory; 