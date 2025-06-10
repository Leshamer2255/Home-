import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, ListGroup, Badge } from 'react-bootstrap';
import { FaUsers, FaPlus, FaTasks, FaShoppingCart, FaWallet, FaChartLine, FaCalendarAlt, FaCheck, FaBolt, FaCloudRain, FaCloudShowersHeavy, FaSnowflake, FaSmog, FaSun, FaCloud, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Task {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface ShoppingItem {
  id: number;
  name: string;
  completed: boolean;
  category: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

interface WeatherData {
  main: {
    temp: number;
  };
  weather: Array<{
    id: number;
    description: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Завантаження даних з localStorage
    const savedTasks = localStorage.getItem('tasks');
    const savedShoppingItems = localStorage.getItem('shoppingItems');
    const savedTransactions = localStorage.getItem('transactions');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedShoppingItems) setShoppingItems(JSON.parse(savedShoppingItems));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

    // Встановлення привітання
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Доброго ранку');
    else if (hour < 18) setGreeting('Добрий день');
    else setGreeting('Добрий вечір');

    // Отримання погоди (приклад)
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Kyiv&appid=YOUR_API_KEY&units=metric&lang=ua');
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Помилка отримання погоди:', error);
      }
    };

    fetchWeather();
  }, []);

  // Дані для графіків
  const expensesData = {
    labels: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень'],
    datasets: [
      {
        label: 'Витрати',
        data: [1200, 1900, 1500, 1800, 2100, 1700],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.4,
      },
      {
        label: 'Доходи',
        data: [2000, 2200, 2100, 2300, 2400, 2200],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
      },
    ],
  };

  const budgetData = {
    labels: ['Продукти', 'Комунальні', 'Розваги', 'Транспорт', 'Інше'],
    datasets: [
      {
        data: [30, 25, 15, 20, 10],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getWeatherIcon = (weatherCode: number) => {
    if (weatherCode >= 200 && weatherCode < 300) return <FaBolt />;
    if (weatherCode >= 300 && weatherCode < 400) return <FaCloudRain />;
    if (weatherCode >= 500 && weatherCode < 600) return <FaCloudShowersHeavy />;
    if (weatherCode >= 600 && weatherCode < 700) return <FaSnowflake />;
    if (weatherCode >= 700 && weatherCode < 800) return <FaSmog />;
    if (weatherCode === 800) return <FaSun />;
    return <FaCloud />;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Container>
          <h1>{greeting}, {userName}!</h1>
          <p className="mb-0">Ось огляд вашого сьогоднішнього дня</p>
        </Container>
      </div>

      <Container>
        <Row className="g-4 mb-4">
          {/* Статистика */}
          <Col md={3}>
            <Card className="h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Завдання</h6>
                    <h3 className="mb-0">
                      {tasks.filter(t => !t.completed).length}
                      <small className="text-muted">/{tasks.length}</small>
                    </h3>
                  </div>
                  <div className="stat-icon bg-primary">
                    <FaTasks />
                  </div>
                </div>
                <ProgressBar
                  now={tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}
                  className="mt-3"
                />
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Покупки</h6>
                    <h3 className="mb-0">
                      {shoppingItems.filter(i => !i.completed).length}
                      <small className="text-muted">/{shoppingItems.length}</small>
                    </h3>
                  </div>
                  <div className="stat-icon bg-warning">
                    <FaShoppingCart />
                  </div>
                </div>
                <ProgressBar
                  now={shoppingItems.length ? (shoppingItems.filter(i => i.completed).length / shoppingItems.length) * 100 : 0}
                  className="mt-3"
                />
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Доходи</h6>
                    <h3 className="mb-0 text-success">
                      {transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)}₴
                    </h3>
                  </div>
                  <div className="stat-icon bg-success">
                    <FaArrowUp />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Витрати</h6>
                    <h3 className="mb-0 text-danger">
                      {transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)}₴
                    </h3>
                  </div>
                  <div className="stat-icon bg-danger">
                    <FaArrowDown />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Фінансовий огляд</h5>
                <div>
                  <Badge bg="success" className="me-2">Доходи</Badge>
                  <Badge bg="danger">Витрати</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="chart-container">
                  <Line data={expensesData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">Бюджет</h5>
              </Card.Header>
              <Card.Body>
                <div className="chart-container">
                  <Doughnut data={budgetData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mt-4">
          <Col lg={6}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Завдання</h5>
                <Button variant="link" className="p-0">
                  <FaPlus /> Додати
                </Button>
              </Card.Header>
              <ListGroup variant="flush">
                {tasks.map((task, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{task.title}</h6>
                      <small className="text-muted">{task.dueDate}</small>
                    </div>
                    <Badge bg={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}>
                      {task.priority}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Список покупок</h5>
                <Button variant="link" className="p-0">
                  <FaPlus /> Додати
                </Button>
              </Card.Header>
              <ListGroup variant="flush">
                {shoppingItems.map((item, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{item.name}</h6>
                      <small className="text-muted">{item.category}</small>
                    </div>
                    <Button variant="link" className="p-0">
                      <FaCheck />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}; 