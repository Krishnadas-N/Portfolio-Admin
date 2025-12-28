import { Routes } from '@angular/router';
import { ViewTestimonialsComponent } from './view-testimonials/view-testimonials.component';
import { AddTestimonialComponent } from './add-testimonial/add-testimonial.component';

export const TESTIMONIAL_ROUTES: Routes = [
    { path: '', component: ViewTestimonialsComponent },
    { path: 'add', component: AddTestimonialComponent },
    { path: 'edit/:id', component: AddTestimonialComponent }
];
