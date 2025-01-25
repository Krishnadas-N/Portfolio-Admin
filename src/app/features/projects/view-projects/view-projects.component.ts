import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-view-projects',
  imports: [CommonModule],
  templateUrl: './view-projects.component.html',
  styleUrl: './view-projects.component.scss'
})
export class ViewProjectsComponent {
    projectDetails = {
    title: "Maitri - Socio Booking Platform",
    projectType: "Social Media and Booking",
    status: "Active",
    license: "MIT",
    startDate: "2023-01-01",
    endDate: "2024-12-31",
    current: true,
    description:
      "Maitri is a comprehensive social media and booking platform for mental health patients, featuring seamless video consultations, booking systems, and admin dashboards.",
    technologies: ["Angular", "Node.js", "MongoDB", "Zego Cloud", "Razorpay"],
    link: "https://maitri-platform.com",
    repo: "https://github.com/example/maitri-platform",
    images: [
      "https://via.placeholder.com/400x200",
      "https://via.placeholder.com/400x200",
      "https://via.placeholder.com/400x200",
    ],
    deploymentDetails: [
      {
        platform: "AWS EC2",
        url: "https://maitri-aws.com",
      },
      {
        platform: "Vercel",
        url: "https://maitri-vercel.com",
      },
    ],
    skills: ["Full-Stack Development", "State Management", "Payment Integration"],
    viewsCount: 1200,
    likes: 350,
    seoKeywords: ["mental health", "video consultation", "booking platform"],
    tags: ["Mental Health", "Social Media", "Web App"],
    additionalResources: [
      "https://docs.example.com",
      "https://tutorial.example.com",
    ],
  };
  
}
