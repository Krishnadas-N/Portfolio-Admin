import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-view-education',
    imports: [CommonModule],
    templateUrl: './view-education.component.html',
    styleUrl: './view-education.component.scss'
})
export class ViewEducationComponent {
    educations = [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'University of Calicut',
          fieldOfStudy: 'Computer Science',
          startDate: new Date('2019-08-01'),
          endDate: new Date('2023-05-31'),
          description: 'Studied a variety of computer science topics including programming, data structures, and algorithms.',
          activities: ['Coding Club', 'Tech Talks'],
          skills: ['Data Structures', 'Algorithms', 'Web Development'],
          grade: 'CGPA: 7.5',
          showOptions: false,
        },
        {
          degree: 'Certified Java with MEAN Stack Developer',
          institution: 'Larsen and Toubro Edutech',
          fieldOfStudy: 'Full Stack Development',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          description: 'Learned full stack development with focus on the MEAN stack.',
          activities: ['Project Development', 'Hackathons'],
          skills: ['Angular', 'Node.js', 'MongoDB'],
          grade: 'Grade: A+',
          showOptions: false,
        },
      ];
      
    
      toggleOptions(event: MouseEvent, index: number) {
        // Close other open options
        const currentIndex = this.educations.findIndex(education => education.showOptions);
        if (currentIndex !== -1) {
          this.educations[currentIndex].showOptions = false;
        }
      
        // Toggle the clicked option
        this.educations[index].showOptions = !this.educations[index].showOptions;
      }
      
    
      openDetails(education: any) {
        alert('Opening details for: ' + education.degree);
      }
    
      editEducation(education: any) {
        alert('Editing: ' + education.degree);
      }
    
      deleteEducation(education: any) {
        const index = this.educations.indexOf(education);
        if (index !== -1) {
          this.educations.splice(index, 1);
        }
      }
}
