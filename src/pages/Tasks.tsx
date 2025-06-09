import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Modal, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
  recurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  assignedTo?: string;
  reminder?: string;
}

const CATEGORIES = ['Дім', 'Робота', 'Особисте', 'Сім\'я', 'Інше'];
const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_LABELS = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий'
};

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    priority: 'medium',
    category: 'Дім',
    recurring: false
  });
  const [filter, setFilter] = useState({
    category: '',
    priority: '',
    completed: false
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...newTask, id: task.id } as Task : task
      ));
    } else {
      setTasks([...tasks, { ...newTask, id: Date.now().toString() } as Task]);
    }
    setShowModal(false);
    setEditingTask(null);
    setNewTask({ priority: 'medium', category: 'Дім', recurring: false });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask(task);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleComplete = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge bg="danger">Високий</Badge>;
      case 'medium':
        return <Badge bg="warning" text="dark">Середній</Badge>;
      case 'low':
        return <Badge bg="success">Низький</Badge>;
      default:
        return null;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter.category && task.category !== filter.category) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.completed !== task.completed) return false;
    return true;
  });

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Завдання</h2>
            <Button variant="light" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />Нове завдання
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
                value={filter.priority}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              >
                <option value="">Всі пріоритети</option>
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS]}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Check
                type="switch"
                id="completed-filter"
                label="Показати виконані"
                checked={filter.completed}
                onChange={(e) => setFilter({ ...filter, completed: e.target.checked })}
              />
            </div>
          </div>

          <ListGroup>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-4">
                <FaCheck size={48} className="text-muted mb-3" />
                <h4>Немає завдань</h4>
                <p className="text-muted">Створіть нове завдання або змініть фільтри</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <ListGroup.Item
                  key={task.id}
                  className={`d-flex justify-content-between align-items-center ${task.completed ? 'bg-light' : ''}`}
                >
                  <div>
                    <h5 className={`mb-1 ${task.completed ? 'text-muted text-decoration-line-through' : ''}`}>
                      {task.title}
                    </h5>
                    <p className="mb-1">{task.description}</p>
                    <div className="d-flex gap-2">
                      <Badge bg="secondary">{task.category}</Badge>
                      {getPriorityBadge(task.priority)}
                      {task.recurring && (
                        <Badge bg="info">
                          <FaClock className="me-1" />
                          {task.recurringInterval === 'daily' ? 'Щодня' :
                           task.recurringInterval === 'weekly' ? 'Щотижня' :
                           task.recurringInterval === 'monthly' ? 'Щомісяця' : ''}
                        </Badge>
                      )}
                      {task.reminder && (
                        <Badge bg="warning" text="dark">
                          <FaExclamationTriangle className="me-1" />
                          Нагадування
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant={task.completed ? "outline-success" : "success"}
                      size="sm"
                      onClick={() => handleComplete(task.id)}
                    >
                      {task.completed ? 'Відновити' : 'Завершити'}
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(task)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                    >
                      <FaTrash />
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
        setEditingTask(null);
        setNewTask({ priority: 'medium', category: 'Дім', recurring: false });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTask ? 'Редагувати завдання' : 'Нове завдання'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Назва</Form.Label>
              <Form.Control
                type="text"
                value={newTask.title || ''}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Опис</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTask.description || ''}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Категорія</Form.Label>
              <Form.Select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Пріоритет</Form.Label>
              <Form.Select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
              >
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS]}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Термін виконання</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newTask.dueDate || ''}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="recurring"
                label="Повторюване завдання"
                checked={newTask.recurring}
                onChange={(e) => setNewTask({ ...newTask, recurring: e.target.checked })}
              />
            </Form.Group>
            {newTask.recurring && (
              <Form.Group className="mb-3">
                <Form.Label>Інтервал повторення</Form.Label>
                <Form.Select
                  value={newTask.recurringInterval}
                  onChange={(e) => setNewTask({ ...newTask, recurringInterval: e.target.value as Task['recurringInterval'] })}
                >
                  <option value="daily">Щодня</option>
                  <option value="weekly">Щотижня</option>
                  <option value="monthly">Щомісяця</option>
                </Form.Select>
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Призначити</Form.Label>
              <Form.Control
                type="text"
                value={newTask.assignedTo || ''}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                placeholder="Ім'я члена сім'ї"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Нагадування</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newTask.reminder || ''}
                onChange={(e) => setNewTask({ ...newTask, reminder: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            setEditingTask(null);
            setNewTask({ priority: 'medium', category: 'Дім', recurring: false });
          }}>
            Скасувати
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingTask ? 'Зберегти' : 'Створити'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Tasks; 