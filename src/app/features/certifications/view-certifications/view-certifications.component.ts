import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-view-certifications',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './view-certifications.component.html',
  styleUrl: './view-certifications.component.scss'
})
export class ViewCertificationsComponent {
  certifications = [
    {
      title: 'Certified Web Developer',
      issuer: 'ABC Institute',
      issueDate: new Date('2020-05-01'),
      expirationDate: new Date('2023-05-01'),
      credentialId: '12345',
      credentialUrl: 'https://example.com/certification/12345',
      description: 'Certification in full-stack web development.',
      skillsGained: ['HTML', 'CSS', 'JavaScript', 'Angular','HTML', 'CSS', 'JavaScript', 'Angular'],
      imageUrl: 'https://via.placeholder.com/150'
    },
    {
      title: 'Certified React Developer',
      issuer: 'XYZ Academy',
      issueDate: new Date('2021-07-15'),
      expirationDate: new Date('2024-07-15'),
      credentialId: '67890',
      credentialUrl: 'https://example.com/certification/67890',
      description: 'Certification in building applications with React.',
      skillsGained: ['React', 'JavaScript', 'Redux'],
      imageUrl: 'https://via.placeholder.com/150'
    }
  ];
  editCertification(cert: any) {
    // Handle the logic for editing the certification
    console.log('Edit certification:', cert);
  }
  
  toggleHideCertification(cert: any) {
    // Toggle hide/show based on expirationDate or any other condition
    cert.expirationDate = cert.expirationDate ? null : new Date();
    console.log('Toggle hide/show certification:', cert);
  }
  
  deleteCertification(cert: any) {
    // Handle the logic for deleting a certification
    const index = this.certifications.indexOf(cert);
    if (index > -1) {
      this.certifications.splice(index, 1);
    }
    console.log('Deleted certification:', cert);
  }
  
}
