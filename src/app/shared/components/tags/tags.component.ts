import {
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';

@Component({
  selector: 'app-tags',
  imports: [],
  template: `<div id="tags-content"
    class="flex items-center px-3 py-1 text-sm font-medium text-white bg-teal-500 rounded-full"
  >
    <ng-content></ng-content>
    <button
      type="button"
      class="ml-2 text-white hover:text-red-400"
      (click)="removeTagByIndex()"
    >
      <i class="fas fa-times"></i>
    </button>
  </div> `,
})
export class TagsComponent {
  public index: InputSignal<number> = input.required<number>();
  public removeTag: OutputEmitterRef<number> = output<number>();

  removeTagByIndex() {
    this.removeTag.emit(this.index());
  }
}
