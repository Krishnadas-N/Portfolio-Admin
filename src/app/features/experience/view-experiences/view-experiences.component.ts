import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
interface Experience {
  title: string;
  companyLogo: string;
  company: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
  technologies: string[];
  workType?: string;
  locationType?: string;
}
@Component({
    selector: 'app-view-experiences',
    imports: [DatePipe, CommonModule],
    templateUrl: './view-experiences.component.html',
    styleUrl: './view-experiences.component.scss'
})
export class ViewExperiencesComponent  implements OnInit{
 ngOnInit(): void {
   
 }
 experiences: Experience[] = [
  {
    title: 'Software Engineer',
    companyLogo:"https://img.logo.dev/clearme.com?token=pk_XTRYP6cyQSmTEZuYMtdW9Q",
    company: 'TechCorp Inc.',
    location: 'New York, NY',
    startDate: new Date('2021-01-01'),
    endDate: new Date('2023-06-01'),
    current: false,
    description: '.Developed and maintained web applications using Angular and Node.js .Developed and maintained web applications using Angular and Node.js.',
    technologies: ['Angular', 'Node.js', 'MongoDB', 'TypeScript'],
    workType: 'Full-time',
    locationType: 'On-site',
  },
  {
    title: 'Frontend Developer',
    companyLogo:"https://img.logo.dev/clearme.com?token=pk_XTRYP6cyQSmTEZuYMtdW9Q",
    company: 'Webify Solutions',
    location: 'Pune, Maharashtra',
    startDate: new Date('2023-07-01'),
    current: true,
    description: 'Creating responsive web designs and reusable components in Angular.',
    technologies: ['Angular', 'Tailwind CSS', 'RxJS'],
    workType: 'Part-time',
    locationType: 'Remote',
  },
];

showOptions: boolean[] = [false, false]; // Controls visibility of options for each experience

toggleOptions(index: number): void {
  this.showOptions[index] = !this.showOptions[index];
}

editExperience(index: number): void {
  console.log('Edit Experience:', this.experiences[index]);
}

hideExperience(index: number): void {
  console.log('Hide Experience:', this.experiences[index]);
}

deleteExperience(index: number): void {
  this.experiences.splice(index, 1);
  this.showOptions.splice(index, 1);
}
calculateDuration(startDate: Date, endDate: Date | null | undefined, current: boolean): string {
  const start = new Date(startDate);
  const end = current ? new Date() : new Date(endDate!);

  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  let duration = '';
  if (years > 0) {
    duration += `${years} yr${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    duration += (years > 0 ? ' ' : '') + `${months} mo${months > 1 ? 's' : ''}`;
  }
  return duration || '0 mos';
}
}
