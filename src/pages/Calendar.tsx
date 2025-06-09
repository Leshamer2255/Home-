import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, addDays, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import * as FaIcons from 'react-icons/fa';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  location?: string;
  participants: string[];
  reminder: boolean;
  reminderTime?: Date;
  color?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

const FAMILY_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Батько', color: '#3788d8' },
  { id: '2', name: 'Мати', color: '#28a745' },
  { id: '3', name: 'Син', color: '#dc3545' },
  { id: '4', name: 'Донька', color: '#ffc107' }
];

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    allDay: false,
    participants: [],
    reminder: false
  });
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('familyCalendarEvents');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        reminderTime: event.reminderTime ? new Date(event.reminderTime) : undefined
      }));
      setEvents(parsedEvents);
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('familyCalendarEvents', JSON.stringify(events));
  }, [events]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setNewEvent({
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay
    });
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setNewEvent(event);
      setShowEventModal(true);
    }
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.start) {
      const event: Event = {
        id: newEvent.id || Date.now().toString(),
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end || addDays(newEvent.start, 1),
        allDay: newEvent.allDay || false,
        description: newEvent.description,
        location: newEvent.location,
        participants: newEvent.participants || [],
        reminder: newEvent.reminder || false,
        reminderTime: newEvent.reminderTime,
        color: newEvent.color
      };

      if (newEvent.id) {
        setEvents(events.map(e => e.id === event.id ? event : e));
      } else {
        setEvents([...events, event]);
      }

      setShowEventModal(false);
      setNewEvent({
        title: '',
        allDay: false,
        participants: [],
        reminder: false
      });
    }
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    setShowEventModal(false);
  };

  const formatDate = (date: Date) => {
    return format(date, 'd MMMM yyyy, HH:mm', { locale: uk });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Container>
          <h1>Календар</h1>
          <p className="mb-0">Управління сімейними подіями та заходами</p>
        </Container>
      </div>

      <Container fluid className="px-4">
        <Row className="mb-4">
          <Col>
            <div className="btn-group">
              <Button 
                variant={view === 'dayGridMonth' ? 'primary' : 'outline-primary'}
                onClick={() => setView('dayGridMonth')}
              >
                Місяць
              </Button>
              <Button 
                variant={view === 'timeGridWeek' ? 'primary' : 'outline-primary'}
                onClick={() => setView('timeGridWeek')}
              >
                Тиждень
              </Button>
              <Button 
                variant={view === 'timeGridDay' ? 'primary' : 'outline-primary'}
                onClick={() => setView('timeGridDay')}
              >
                День
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Члени сім'ї</h5>
              </Card.Header>
              <Card.Body>
                {FAMILY_MEMBERS.map(member => (
                  <div key={member.id} className="d-flex align-items-center mb-2">
                    <div 
                      className="rounded-circle me-2" 
                      style={{ width: '12px', height: '12px', backgroundColor: member.color }}
                    />
                    <span>{member.name}</span>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5 className="mb-0">Майбутні події</h5>
              </Card.Header>
              <Card.Body>
                {events
                  .filter(event => new Date(event.start) > new Date())
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="mb-2">
                      <div className="fw-bold">{event.title}</div>
                      <div className="small text-muted">
                        {formatDate(new Date(event.start))}
                      </div>
                    </div>
                  ))}
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Card>
              <Card.Body>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView={view}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  locale="uk"
                  buttonText={{
                    today: 'Сьогодні',
                    month: 'Місяць',
                    week: 'Тиждень',
                    day: 'День'
                  }}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={events}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  height="auto"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Модальне вікно події */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{newEvent.id ? 'Редагувати подію' : 'Нова подія'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEventSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Назва</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Опис</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Місце</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.location || ''}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Весь день"
                checked={newEvent.allDay || false}
                onChange={(e) => setNewEvent({...newEvent, allDay: e.target.checked})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Учасники</Form.Label>
              <div>
                {FAMILY_MEMBERS.map(member => (
                  <Form.Check
                    key={member.id}
                    type="checkbox"
                    label={member.name}
                    checked={newEvent.participants?.includes(member.id) || false}
                    onChange={(e) => {
                      const participants = newEvent.participants || [];
                      if (e.target.checked) {
                        setNewEvent({
                          ...newEvent,
                          participants: [...participants, member.id]
                        });
                      } else {
                        setNewEvent({
                          ...newEvent,
                          participants: participants.filter(id => id !== member.id)
                        });
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Нагадування"
                checked={newEvent.reminder || false}
                onChange={(e) => setNewEvent({...newEvent, reminder: e.target.checked})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            {newEvent.id && (
              <Button variant="danger" onClick={() => deleteEvent(newEvent.id!)}>
                Видалити
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowEventModal(false)}>
              Скасувати
            </Button>
            <Button variant="primary" type="submit">
              {newEvent.id ? 'Зберегти' : 'Додати'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Calendar; 