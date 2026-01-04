import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports:  [CommonModule, RouterLink, FormsModule],
  templateUrl:  './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading:  boolean = false;
  error:  string = '';
  filterStatus: string = 'all';
  searchKeyword: string = '';

  // New task form
  showCreateForm: boolean = false;
  newTask: Task = {
    title: '',
    description: '',
    completed: false
  };

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';

    this.taskService. getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks.  Make sure your Spring Boot backend is running on http://localhost:8080';
        this.loading = false;
        console.error('Error loading tasks:', err);
      }
    });
  }

  applyFilters(): void {
    let result = this.tasks;

    // Filter by status
    if (this.filterStatus === 'completed') {
      result = result.filter(task => task.completed);
    } else if (this.filterStatus === 'incomplete') {
      result = result.filter(task => ! task.completed);
    }

    // Filter by search keyword
    if (this.searchKeyword) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(this.searchKeyword. toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    }

    this.filteredTasks = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (! this.showCreateForm) {
      this.resetForm();
    }
  }

  createTask(): void {
    if (!this.newTask.title. trim()) {
      alert('Please enter a task title');
      return;
    }

    this.taskService.createTask(this.newTask).subscribe({
      next: (createdTask) => {
        this.tasks.unshift(createdTask);  // Add to beginning
        this.applyFilters();
        this.toggleCreateForm();
        this.resetForm();
      },
      error: (err) => {
        alert('Failed to create task. Make sure your backend is running.');
        console.error('Error creating task:', err);
      }
    });
  }

  toggleTaskCompletion(task: Task): void {
    const updatedTask = { ...task, completed: !task.completed };

    this.taskService.updateTask(task.id!, updatedTask).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updated;
          this.applyFilters();
        }
      },
      error: (err) => {
        alert('Failed to update task');
        console.error('Error updating task:', err);
      }
    });
  }

  deleteTask(taskId: number): void {
    if (! confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.applyFilters();
      },
      error: (err) => {
        alert('Failed to delete task');
        console.error('Error deleting task:', err);
      }
    });
  }

  resetForm(): void {
    this.newTask = {
      title: '',
      description: '',
      completed: false
    };
  }
}
