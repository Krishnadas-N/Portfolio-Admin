import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment.development';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyDetails } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompanyLogoService {
  private apiKey =  environment.logoDevAPIKEY
  
  private http = inject(HttpClient);
  fetchCompanySuggestions(companyName: string): Observable<CompanyDetails[]> {
    const apiUrl = `https://api.logo.dev/search?q=${companyName}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiKey}`,
    });
    return this.http.get<CompanyDetails[]>(apiUrl, { headers });
  }
}
