import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Badge } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa';
import { FaArrowUp, FaArrowDown, FaBalanceScale, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface Budget {
  category: string;
  amount: number;
  spent: number;
}

const categories = {
  income: [
    'Зарплата',
    'Фріланс',
    'Інвестиції',
    'Подарунки',
    'Інше'
  ],
  expense: [
    'Продукти',
    'Комунальні послуги',
    'Транспорт',
    'Розваги',
    'Одяг',
    'Здоров\'я',
    'Освіта',
    'Інше'
  ]
};

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('uk-UA')} ₴`;
};

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedBudgets = localStorage.getItem('budgets');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [transactions, budgets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newTransaction: Transaction = {
      id: editingTransaction?.id || Date.now(),
      type: formData.get('type') as 'income' | 'expense',
      category: formData.get('category') as string,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      description: formData.get('description') as string
    };

    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? newTransaction : t));
    } else {
      setTransactions([...transactions, newTransaction]);
    }

    setShowModal(false);
    setEditingTransaction(null);
    form.reset();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю транзакцію?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleBudgetChange = (category: string, amount: number) => {
    setBudgets(budgets.map(b => 
      b.category === category ? { ...b, amount } : b
    ));
  };

  const filteredTransactions = transactions.filter(transaction => {
    return (
      (filters.type === '' || transaction.type === filters.type) &&
      (filters.category === '' || transaction.category === filters.category) &&
      (filters.startDate === '' || transaction.date >= filters.startDate) &&
      (filters.endDate === '' || transaction.date <= filters.endDate)
    );
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Container>
          <h1>Фінанси</h1>
          <p className="mb-0">Управління домашнім бюджетом</p>
        </Container>
      </div>

      <Container fluid className="px-4">
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Доходи</h6>
                    <h3 className="mb-0 text-success">
                      {formatCurrency(totalIncome)}
                    </h3>
                  </div>
                  <div className="stat-icon bg-success">
                    <FaArrowUp />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Витрати</h6>
                    <h3 className="mb-0 text-danger">
                      {formatCurrency(totalExpenses)}
                    </h3>
                  </div>
                  <div className="stat-icon bg-danger">
                    <FaArrowDown />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Баланс</h6>
                    <h3 className="mb-0 text-primary">
                      {formatCurrency(totalIncome - totalExpenses)}
                    </h3>
                  </div>
                  <div className="stat-icon bg-primary">
                    <FaBalanceScale />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Транзакції</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaPlus className="me-2" /> Додати транзакцію
          </Button>
        </div>

        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Тип</Form.Label>
                  <Form.Select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    <option value="">Всі типи</option>
                    <option value="income">Доходи</option>
                    <option value="expense">Витрати</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Категорія</Form.Label>
                  <Form.Select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">Всі категорії</option>
                    {Object.entries(categories).map(([type, cats]) => (
                      <optgroup key={type} label={type === 'income' ? 'Доходи' : 'Витрати'}>
                        {cats.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Від</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>До</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Категорія</th>
                <th>Сума</th>
                <th>Опис</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.date).toLocaleDateString('uk-UA')}</td>
                  <td>
                    <Badge bg={transaction.type === 'income' ? 'success' : 'danger'}>
                      {transaction.type === 'income' ? 'Дохід' : 'Витрата'}
                    </Badge>
                  </td>
                  <td>
                    {transaction.type === 'income'
                      ? (categories.income.includes(transaction.category) ? transaction.category : transaction.category)
                      : (categories.expense.includes(transaction.category) ? transaction.category : transaction.category)}
                  </td>
                  <td className={transaction.type === 'income' ? 'text-success' : 'text-danger'}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td>{transaction.description}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
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
        setEditingTransaction(null);
        setFormData({
          type: 'expense',
          category: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTransaction ? 'Редагувати транзакцію' : 'Додати транзакцію'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Тип</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="income">Дохід</option>
                <option value="expense">Витрата</option>
              </Form.Select>
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
                {categories[formData.type as 'income' | 'expense'].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Сума</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Дата</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Опис</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => {
                setShowModal(false);
                setEditingTransaction(null);
                setFormData({
                  type: 'expense',
                  category: '',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  description: ''
                });
              }}>
                Скасувати
              </Button>
              <Button variant="primary" type="submit">
                {editingTransaction ? 'Зберегти зміни' : 'Додати транзакцію'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Finance;

 