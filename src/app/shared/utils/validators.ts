import {
  AbstractControl,
  ValidationErrors,
  FormArray,
  Validators,
} from '@angular/forms';
import { REGEX_PATTERNS } from '../constants/regex-patterns';

export function uniqueTagsValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (control instanceof FormArray) {
    const tags = control.value;
    const hasDuplicates = new Set(tags).size !== tags.length;
    return hasDuplicates ? { duplicateTags: true } : null;
  }
  return null;
}

export const IMAGE_URL_VALIDATOR = Validators.pattern(
  /https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i
);

// Validator for image file extensions
export function imageFileValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value as string;
  return value && !REGEX_PATTERNS.IMAGE_FORMAT.test(value)
    ? { invalidImageFormat: true }
    : null;
}
