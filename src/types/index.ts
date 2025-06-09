export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  assignedTo: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: 'cleaning' | 'shopping' | 'maintenance' | 'other';
  isMonthly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Family {
  id: string;
  name: string;
  members: User[];
  tasks: Task[];
} 