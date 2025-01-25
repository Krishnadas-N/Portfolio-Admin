import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  projects= [
    { "id": 1, "name": "Project 1" },
    { "id": 2, "name": "Project 2" },
    { "id": 3, "name": "Project 3" }
  ]
  
  getProjects(): Observable<any[]> {
    return of(this.projects)
  }
}
