import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, ListGroup, Tabs, Tab } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface FamilyMember {
  id: number;
  name: string;
  role: string;
  birthDate: string;
  photo: string;
  notes: string;
  events: FamilyEvent[];
  contact: string;
  healthInfo: {
    bloodType: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
}

interface FamilyEvent {
  id: number;
  type: 'birthday' | 'anniversary' | 'other';
  date: string;
  description: string;
  memberId: number;
  title: string;
  reminder?: boolean;
}

interface MemberFormData {
  name: string;
  role: string;
  birthDate: string;
  contact: string;
  notes: string;
  healthInfo: {
    bloodType: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
}

interface EventFormData {
  title: string;
  type: 'birthday' | 'anniversary' | 'other';
  date: string;
  description: string;
  reminder: boolean;
}

const roles = [
  'Батько',
  'Мати',
  'Син',
  'Донька',
  'Брат',
  'Сестра',
  'Дідусь',
  'Бабуся',
  'Інше'
];

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const eventTypes = [
  { value: 'birthday', label: 'День народження', icon: FaIcons.FaBirthdayCake },
  { value: 'anniversary', label: 'Річниця', icon: FaIcons.FaGift },
  { value: 'other', label: 'Інше', icon: FaIcons.FaCalendarAlt }
];

const Family: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const [memberFormData, setMemberFormData] = useState<MemberFormData>({
    name: '',
    role: '',
    birthDate: '',
    contact: '',
    notes: '',
    healthInfo: {
      bloodType: '',
      allergies: [],
      medications: [],
      conditions: []
    }
  });
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    type: 'birthday',
    date: new Date().toISOString().split('T')[0],
    description: '',
    reminder: false
  });

  useEffect(() => {
    const savedMembers = localStorage.getItem('familyMembers');
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('familyMembers', JSON.stringify(members));
  }, [members]);

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newMember: FamilyMember = {
      id: editingMember?.id || Date.now(),
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      birthDate: formData.get('birthDate') as string,
      photo: formData.get('photo') as string,
      notes: formData.get('notes') as string,
      events: editingMember?.events || [],
      contact: formData.get('contact') as string,
      healthInfo: {
        bloodType: formData.get('healthInfo.bloodType') as string,
        allergies: (formData.get('healthInfo.allergies') as string).split(',').map(a => a.trim()).filter(Boolean),
        medications: (formData.get('healthInfo.medications') as string).split(',').map(m => m.trim()).filter(Boolean),
        conditions: (formData.get('healthInfo.conditions') as string).split(',').map(c => c.trim()).filter(Boolean)
      }
    };

    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id ? newMember : m));
    } else {
      setMembers([...members, newMember]);
    }

    setShowMemberModal(false);
    setEditingMember(null);
    setMemberFormData({
      name: '',
      role: '',
      birthDate: '',
      contact: '',
      notes: '',
      healthInfo: {
        bloodType: '',
        allergies: [],
        medications: [],
        conditions: []
      }
    });
    form.reset();
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newEvent: FamilyEvent = {
      id: Date.now(),
      type: formData.get('type') as 'birthday' | 'anniversary' | 'other',
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      memberId: selectedMember.id,
      title: formData.get('title') as string,
      reminder: formData.get('reminder') === 'on'
    };

    setMembers(members.map(member => {
      if (member.id === selectedMember.id) {
        return {
          ...member,
          events: [...member.events, newEvent]
        };
      }
      return member;
    }));

    setShowEventModal(false);
    setSelectedMember(null);
    setEventFormData({
      title: '',
      type: 'birthday',
      date: new Date().toISOString().split('T')[0],
      description: '',
      reminder: false
    });
    form.reset();
  };

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('healthInfo.')) {
      const field = name.split('.')[1];
      setMemberFormData(prev => ({
        ...prev,
        healthInfo: {
          ...prev.healthInfo,
          [field]: value
        }
      }));
    } else {
      setMemberFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEventFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowMemberModal(true);
    setMemberFormData({
      name: member.name,
      role: member.role,
      birthDate: member.birthDate,
      contact: member.contact,
      notes: member.notes,
      healthInfo: {
        bloodType: member.healthInfo.bloodType,
        allergies: member.healthInfo.allergies,
        medications: member.healthInfo.medications,
        conditions: member.healthInfo.conditions
      }
    });
  };

  const handleAddEvent = (memberId: number) => {
    setSelectedMember(members.find(m => m.id === memberId) || null);
    setShowEventModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього члена сім\'ї?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    setMembers(members.map(member => {
      return {
        ...member,
        events: member.events.filter(event => event.id !== eventId)
      };
    }));
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    return members.flatMap(member => 
      member.events
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= nextMonth;
        })
        .map(event => ({
          ...event,
          memberName: member.name
        }))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Container>
          <h1>Сім'я</h1>
          <p className="mb-0">Управління сімейними подіями та членами сім'ї</p>
        </Container>
      </div>

      <Container>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'members')}
          className="mb-4"
        >
          <Tab eventKey="members" title="Члени сім'ї">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 mb-0">Члени сім'ї</h2>
              <Button variant="primary" onClick={() => setShowMemberModal(true)}>
                <FaIcons.FaPlus className="me-2" /> Додати члена сім'ї
              </Button>
            </div>

            <Row className="g-4">
              {members.map((member) => (
                <Col md={6} lg={4} key={member.id}>
                  <Card>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="mb-1">{member.name}</h5>
                          <p className="text-muted mb-0">
                            {member.role} • {calculateAge(member.birthDate)} років
                          </p>
                        </div>
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditMember(member)}
                          >
                            <FaIcons.FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                          >
                            <FaIcons.FaTrash />
                          </Button>
                        </div>
                      </div>

                      {member.healthInfo && (
                        <div className="mb-3">
                          <h6 className="mb-2">Медична інформація:</h6>
                          {member.healthInfo.bloodType && (
                            <Badge bg="info" className="me-2">
                              Група крові: {member.healthInfo.bloodType}
                            </Badge>
                          )}
                          {member.healthInfo.allergies.length > 0 && (
                            <div className="mt-2">
                              <small className="text-muted">Алергії:</small>
                              <div>
                                {member.healthInfo.allergies.map((allergy, index) => (
                                  <Badge key={index} bg="warning" className="me-1">
                                    {allergy}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mb-3">
                        <h6 className="mb-2">Події:</h6>
                        <ListGroup variant="flush">
                          {member.events.map((event) => (
                            <ListGroup.Item key={event.id} className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{event.title}</strong>
                                <br />
                                <small className="text-muted">
                                  {format(new Date(event.date), 'd MMMM yyyy', { locale: uk })}
                                </small>
                              </div>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <FaIcons.FaTrash />
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100"
                        onClick={() => handleAddEvent(member.id)}
                      >
                        <FaIcons.FaPlus className="me-2" /> Додати подію
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="events" title="Майбутні події">
            <h2 className="h4 mb-4">Майбутні події</h2>
            <Row>
              <Col>
                <ListGroup>
                  {getUpcomingEvents().map((event) => (
                    <ListGroup.Item key={event.id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">{event.title}</h5>
                          <p className="mb-0 text-muted">
                            {event.memberName} • {format(new Date(event.date), 'd MMMM yyyy', { locale: uk })}
                          </p>
                        </div>
                        <Badge bg={event.type === 'birthday' ? 'success' : event.type === 'anniversary' ? 'primary' : 'secondary'}>
                          {eventTypes.find(t => t.value === event.type)?.label}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
            </Row>
          </Tab>
        </Tabs>

        {/* Модальне вікно для додавання/редагування члена сім'ї */}
        <Modal show={showMemberModal} onHide={() => setShowMemberModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editingMember ? 'Редагувати члена сім\'ї' : 'Додати члена сім\'ї'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleMemberSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ім'я</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={memberFormData.name}
                      onChange={handleMemberInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Роль</Form.Label>
                    <Form.Select
                      name="role"
                      value={memberFormData.role}
                      onChange={handleMemberInputChange}
                      required
                    >
                      <option value="">Виберіть роль</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Дата народження</Form.Label>
                    <Form.Control
                      type="date"
                      name="birthDate"
                      value={memberFormData.birthDate}
                      onChange={handleMemberInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Контакт</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact"
                      value={memberFormData.contact}
                      onChange={handleMemberInputChange}
                      placeholder="Телефон або email"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Фото URL</Form.Label>
                <Form.Control
                  type="text"
                  name="photo"
                  placeholder="URL фотографії"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Нотатки</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={memberFormData.notes}
                  onChange={handleMemberInputChange}
                  rows={3}
                />
              </Form.Group>

              <h5 className="mb-3">Медична інформація</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Група крові</Form.Label>
                    <Form.Select
                      name="healthInfo.bloodType"
                      value={memberFormData.healthInfo.bloodType}
                      onChange={handleMemberInputChange}
                    >
                      <option value="">Виберіть групу крові</option>
                      {bloodTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Алергії (через кому)</Form.Label>
                <Form.Control
                  type="text"
                  name="healthInfo.allergies"
                  value={memberFormData.healthInfo.allergies.join(', ')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMemberFormData(prev => ({
                      ...prev,
                      healthInfo: {
                        ...prev.healthInfo,
                        allergies: value.split(',').map(a => a.trim()).filter(Boolean)
                      }
                    }));
                  }}
                  placeholder="Наприклад: горіхи, мед, пшениця"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ліки (через кому)</Form.Label>
                <Form.Control
                  type="text"
                  name="healthInfo.medications"
                  value={memberFormData.healthInfo.medications.join(', ')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMemberFormData(prev => ({
                      ...prev,
                      healthInfo: {
                        ...prev.healthInfo,
                        medications: value.split(',').map(m => m.trim()).filter(Boolean)
                      }
                    }));
                  }}
                  placeholder="Наприклад: інсулін, аспірин"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Хронічні захворювання (через кому)</Form.Label>
                <Form.Control
                  type="text"
                  name="healthInfo.conditions"
                  value={memberFormData.healthInfo.conditions.join(', ')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMemberFormData(prev => ({
                      ...prev,
                      healthInfo: {
                        ...prev.healthInfo,
                        conditions: value.split(',').map(c => c.trim()).filter(Boolean)
                      }
                    }));
                  }}
                  placeholder="Наприклад: діабет, гіпертонія"
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowMemberModal(false)}>
                  Скасувати
                </Button>
                <Button variant="primary" type="submit">
                  {editingMember ? 'Зберегти зміни' : 'Додати'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Модальне вікно для додавання події */}
        <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Додати подію</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEventSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Назва події</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={eventFormData.title}
                  onChange={handleEventInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Тип події</Form.Label>
                <Form.Select
                  name="type"
                  value={eventFormData.type}
                  onChange={handleEventInputChange}
                  required
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Дата</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={eventFormData.date}
                  onChange={handleEventInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Опис</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={eventFormData.description}
                  onChange={handleEventInputChange}
                  rows={3}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="reminder"
                  label="Нагадування"
                  checked={eventFormData.reminder}
                  onChange={handleEventInputChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowEventModal(false)}>
                  Скасувати
                </Button>
                <Button variant="primary" type="submit">
                  Додати подію
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Family; 