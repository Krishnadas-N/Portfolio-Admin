import { Routes } from '@angular/router';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { ViewBlogsComponent } from './view-blogs/view-blogs.component';



export const BLOG_ROUTES: Routes = [
        {
            path:'',
            component:ViewBlogsComponent,
            pathMatch: 'full'
        },
        {
            path:'add-blog',
            component:AddBlogComponent
        },
        {
            path:'details/:id',
            component:BlogDetailsComponent
        }
]