import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagsComponent } from './tags.component';
import { ComponentRef } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let componentRef: ComponentRef<TagsComponent>;
  let fixture: ComponentFixture<TagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should render projected content inside ng-content', () => {
    const projectedContent = 'Hellp World';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.innerHTML = `<app-tags>${projectedContent}</app-tags>`;
    const contentElement = compiled.querySelector('#tags-content');
    expect(contentElement?.textContent).toContain(projectedContent);
  });
  it('should emit removeTag with the correct index when the button is clicked', () => {
    const spy = jasmine.createSpy('removeTagSpy');
    componentRef.setInput('index', 2);
    component.removeTag.subscribe(spy);
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('button'));
    buttonElement.triggerEventHandler('click', null);

    expect(spy).toHaveBeenCalledOnceWith(2);
  });
});
