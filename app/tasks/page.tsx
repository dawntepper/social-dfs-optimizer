'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Calendar, CheckCircle2, Circle, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Math.random().toString(36).substring(7),
      title: newTask,
      completed: false,
      priority: 'medium',
      tags: [],
      createdAt: new Date()
    };

    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-500/10 text-blue-500',
      medium: 'bg-yellow-500/10 text-yellow-500',
      high: 'bg-red-500/10 text-red-500'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Active</CardTitle>
                  <Badge variant="secondary">
                    {tasks.filter(t => !t.completed).length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {tasks
                      .filter(task => !task.completed)
                      .map(task => (
                        <div
                          key={task.id}
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              {task.dueDate && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(task.dueDate, 'MMM d')}
                                </span>
                              )}
                              {task.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Completed</CardTitle>
                  <Badge variant="secondary">
                    {tasks.filter(t => t.completed).length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {tasks
                      .filter(task => task.completed)
                      .map(task => (
                        <div
                          key={task.id}
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground line-through">
                              {task.title}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              Completed {format(task.createdAt, 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}