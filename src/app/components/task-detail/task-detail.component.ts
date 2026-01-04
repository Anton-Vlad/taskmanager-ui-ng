import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';

@Component({
  selector:  'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  loading: boolean = false;
  error: string = '';
  editMode: boolean = false;
  editedTask: Task = {
    title: '',
    description: '',
    completed: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadTask(+id);
  }

  loadTask(id: number): void {
    this.loading = true;
    this.error = '';

    this.taskService. getTaskById(id).subscribe({
      next: (data) => {
        this.task = data;
        this.editedTask = { ...data };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Task not found or backend is not running';
        this.loading = false;
        console.error('Error loading task:', err);
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (! this.editMode && this.task) {
      this.editedTask = { ...this.task };  // Reset changes
    }
  }

  saveTask(): void {
    if (!this.editedTask.title.trim()) {
      alert('Title is required');
      return;
    }

    this.taskService.updateTask(this.task! .id!, this.editedTask).subscribe({
      next: (updated) => {
        this.task = updated;
        this.editMode = false;
        alert('Task updated successfully!');
      },
      error: (err) => {
        alert('Failed to update task');
        console.error('Error updating task:', err);
      }
    });
  }

  deleteTask(): void {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.deleteTask(this.task!.id! ).subscribe({
      next: () => {
        alert('Task deleted successfully!');
        this.router.navigate(['/tasks']);
      },
      error:  (err) => {
        alert('Failed to delete task');
        console.error('Error deleting task:', err);
      }
    });
  }

  toggleCompletion(): void {
    const updated = { ...this.task!, completed: !this.task! .completed };

    this.taskService.updateTask(this.task!.id!, updated).subscribe({
      next: (updatedTask) => {
        this.task = updatedTask;
      },
      error: (err) => {
        alert('Failed to update task');
        console.error('Error updating task:', err);
      }
    });
  }
}
