import { Component, OnInit, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-guide-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatSelectModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="form-container" [@fadeIn]>
      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title class="title">Create Your Guide</mat-card-title>
          <mat-card-subtitle class="subtitle">Share your knowledge step by step</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="guideForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width" [@slideIn]>
              <mat-label>Guide Title</mat-label>
              <input matInput formControlName="title" required placeholder="Enter a descriptive title">
              <mat-icon matSuffix>title</mat-icon>
              <mat-error *ngIf="guideForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
            </mat-form-field>

            <div formArrayName="steps" [@listAnimation]>
              <div *ngFor="let step of steps.controls; let i = index" [formGroupName]="i"
                   [@stepAnimation]="'in'" class="step-wrapper">
                <mat-card class="step-card">
                  <mat-card-header>
                    <mat-card-title class="step-title">
                      <span class="step-number">{{i + 1}}</span>
                      Step {{i + 1}}
                    </mat-card-title>
                    <button mat-icon-button color="warn" *ngIf="steps.length > 1"
                            (click)="removeStep(i)" class="delete-btn" matTooltip="Remove step">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="editor-container">
                      <mat-toolbar class="editor-toolbar">
                        <button type="button" mat-button (click)="formatText('bold', i)" matTooltip="Bold">
                          <mat-icon>format_bold</mat-icon>
                        </button>
                        <button type="button" mat-button (click)="formatText('italic', i)" matTooltip="Italic">
                          <mat-icon>format_italic</mat-icon>
                        </button>
                        <button type="button" mat-button (click)="formatText('underline', i)" matTooltip="Underline">
                          <mat-icon>format_underlined</mat-icon>
                        </button>
                        <mat-divider vertical></mat-divider>
                        <button type="button" mat-button [matMenuTriggerFor]="fontMenu" matTooltip="Font Family">
                          <mat-icon>font_download</mat-icon>
                        </button>
                        <mat-menu #fontMenu="matMenu">
                          <button type="button" mat-menu-item (click)="setFont('Arial', i)">Arial</button>
                          <button type="button" mat-menu-item (click)="setFont('Times New Roman', i)">Times New Roman</button>
                          <button type="button" mat-menu-item (click)="setFont('Courier New', i)">Courier New</button>
                          <button type="button" mat-menu-item (click)="setFont('Georgia', i)">Georgia</button>
                        </mat-menu>
                        <button type="button" mat-button [matMenuTriggerFor]="sizeMenu" matTooltip="Font Size">
                          <mat-icon>format_size</mat-icon>
                        </button>
                        <mat-menu #sizeMenu="matMenu">
                          <button type="button" mat-menu-item (click)="setFontSize('2', i)">Small</button>
                          <button type="button" mat-menu-item (click)="setFontSize('2,5', i)">Normal</button>
                          <button type="button" mat-menu-item (click)="setFontSize('3', i)">Large</button>
                          <button type="button" mat-menu-item (click)="setFontSize('3,5', i)">Larger</button>
                        </mat-menu>
                        <mat-divider vertical></mat-divider>
                        <button type="button" mat-button (click)="formatText('justifyLeft', i)" matTooltip="Align Left">
                          <mat-icon>format_align_left</mat-icon>
                        </button>
                        <button type="button" mat-button (click)="formatText('justifyCenter', i)" matTooltip="Align Center">
                          <mat-icon>format_align_center</mat-icon>
                        </button>
                        <button type="button" mat-button (click)="formatText('justifyRight', i)" matTooltip="Align Right">
                          <mat-icon>format_align_right</mat-icon>
                        </button>
                        <mat-divider vertical></mat-divider>
                        <button type="button" mat-button 
                                [color]="isRecording(i) ? 'warn' : 'primary'"
                                (click)="toggleSpeechRecognition(i)"
                                matTooltip="Speech to Text">
                          <mat-icon>{{isRecording(i) ? 'mic' : 'mic_none'}}</mat-icon>
                        </button>
                      </mat-toolbar>
                      <div class="editor-content" 
                           [id]="'editor-' + i"
                           contenteditable="true"
                           (input)="onEditorInput($event, i)"
                           #editorContent
                           style="text-align: left;">
                      </div>
                    </div>

                    <div class="image-upload" [@fadeIn]>
                      <input type="file" #fileInput (change)="onFileSelected($event, i)"
                             accept="image/*" style="display: none" multiple>
                      <button mat-stroked-button type="button" (click)="fileInput.click()"
                              class="upload-btn">
                        <mat-icon>add_photo_alternate</mat-icon>
                        Add Images
                      </button>
                      <div class="images-grid" *ngIf="getStepImages(i).length > 0">
                        <div class="preview-container" *ngFor="let image of getStepImages(i); let imgIndex = index">
                          <img [src]="image.preview" class="preview-image">
                          <button mat-icon-button color="warn" class="remove-image"
                                  (click)="removeImage(i, imgIndex)">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>

            <div class="form-actions" [@fadeIn]>
              <button mat-stroked-button type="button" (click)="addStep()" class="add-step-btn">
                <mat-icon>add</mat-icon>
                Add Step
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!guideForm.valid"
                      class="submit-btn">
                <mat-icon>preview</mat-icon>
                Preview Guide
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .main-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .title {
      font-size: 2rem;
      font-weight: 500;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #666;
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1.5rem;
    }

    .step-wrapper {
      margin-bottom: 2rem;
    }

    .step-card {
      background: #fafafa;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
    }

    .step-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
    }

    .step-number {
      background: #3f51b5;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }

    .delete-btn {
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.1);
      }
    }

    .editor-container {
      margin-bottom: 1.5rem;
    }

    .editor-toolbar {
      background: #f5f5f5;
      border-radius: 4px 4px 0 0;
      padding: 0.5rem;
      display: flex;
      gap: 0.5rem;
      border: 1px solid #ddd;
      border-bottom: none;

      button {
        min-width: 40px;
        padding: 0 8px;
      }

      mat-divider {
        margin: 0 8px;
      }
    }

    .editor-content {
      min-height: 150px;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 0 0 4px 4px;
      background: white;
      outline: none;
      overflow-y: auto;

      &:focus {
        border-color: #3f51b5;
      }
    }

    .image-upload {
      margin-top: 1.5rem;
    }

    .upload-btn {
      border: 2px dashed #ccc;
      padding: 0.5rem 1rem;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #3f51b5;
        background: rgba(63, 81, 181, 0.04);
      }
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .preview-container {
      position: relative;
      display: inline-block;
    }

    .preview-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .remove-image {
      position: absolute;
      top: -8px;
      right: -8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      justify-content: flex-end;
    }

    .add-step-btn {
      border: 2px solid #3f51b5;
      color: #3f51b5;
      
      &:hover {
        background: rgba(63, 81, 181, 0.04);
      }
    }

    .submit-btn {
      padding: 0 2rem;
      
      mat-icon {
        margin-right: 0.5rem;
      }
    }

    ::ng-deep {
      .mat-mdc-form-field {
        .mat-mdc-form-field-flex {
          background: white;
        }
      }
    }

    .editor-toolbar button[color="warn"] {
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('stepAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ]
})
export class GuideFormComponent implements OnInit {
  guideForm: FormGroup;
  @ViewChildren('editorContent') editorContents: any;
  private recognition: any;
  private activeRecognitionIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.guideForm = this.fb.group({
      title: ['', Validators.required],
      steps: this.fb.array([])
    });

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        if (this.activeRecognitionIndex !== null) {
          const editor = document.getElementById(`editor-${this.activeRecognitionIndex}`);
          if (editor) {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
              editor.innerHTML += result[0].transcript + ' ';
              this.updateStepContent(this.activeRecognitionIndex);
            }
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.stopRecognition();
      };
    }
  }

  isRecording(index: number): boolean {
    return this.activeRecognitionIndex === index;
  }

  toggleSpeechRecognition(index: number) {
    if (this.isRecording(index)) {
      this.stopRecognition();
    } else {
      this.startRecognition(index);
    }
  }

  private startRecognition(index: number) {
    if (this.recognition) {
      this.activeRecognitionIndex = index;
      this.recognition.start();
    }
  }

  private stopRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.activeRecognitionIndex = null;
    }
  }

  ngOnInit() {
    // Try to load saved form data
    const savedGuide = localStorage.getItem('currentGuide');
    if (savedGuide) {
      const guideData = JSON.parse(savedGuide);
      this.guideForm.patchValue({ title: guideData.title });
      
      // Clear existing steps
      while (this.steps.length) {
        this.steps.removeAt(0);
      }

      // Add saved steps
      guideData.steps.forEach((step: any) => {
        const stepGroup = this.fb.group({
          description: [step.description, Validators.required],
          images: [step.images || []]
        });
        this.steps.push(stepGroup);
      });

      // Set initial content after view init
      setTimeout(() => {
        this.editorContents.forEach((editor: any, index: number) => {
          if (editor.nativeElement) {
            editor.nativeElement.innerHTML = this.steps.at(index).get('description')?.value || '';
          }
        });
      });
    } else {
      this.addStep();
    }
  }

  get steps() {
    return this.guideForm.get('steps') as FormArray;
  }

  getStepImages(stepIndex: number) {
    return this.steps.at(stepIndex).get('images')?.value || [];
  }

  addStep() {
    const step = this.fb.group({
      description: ['', Validators.required],
      images: [[]]
    });
    this.steps.push(step);
  }

  removeStep(index: number) {
    this.steps.removeAt(index);
    // Save the current form state after removing a step
    const formData = this.guideForm.value;
    localStorage.setItem('currentGuide', JSON.stringify(formData));
  }

  removeImage(stepIndex: number, imageIndex: number) {
    const step = this.steps.at(stepIndex);
    const images = [...step.get('images')?.value || []];
    images.splice(imageIndex, 1);
    step.patchValue({ images });
  }

  onFileSelected(event: Event, stepIndex: number) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      const step = this.steps.at(stepIndex);
      const currentImages = step.get('images')?.value || [];
      const newImages = [...currentImages];
      
      // Process all files at once
      const filePromises = Array.from(files).map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              file,
              preview: reader.result
            });
          };
          reader.readAsDataURL(file);
        });
      });

      // Wait for all files to be processed
      Promise.all(filePromises).then((processedImages: any[]) => {
        step.patchValue({ 
          images: [...currentImages, ...processedImages]
        });
      });
    }
  }

  onEditorInput(event: Event, stepIndex: number) {
    const editor = document.getElementById(`editor-${stepIndex}`);
    if (editor) {
      const step = this.steps.at(stepIndex);
      const control = step.get('description');
      if (control) {
        control.setValue(editor.innerHTML, { emitEvent: false });
      }
    }
  }

  private updateStepContent(stepIndex: number) {
    const editor = document.getElementById(`editor-${stepIndex}`);
    if (editor) {
      const step = this.steps.at(stepIndex);
      const control = step.get('description');
      if (control) {
        control.setValue(editor.innerHTML, { emitEvent: false });
      }
    }
  }

  private removeExistingFormat(element: HTMLElement, type: string) {
    const elements = element.querySelectorAll('span');
    elements.forEach(el => {
      if (type === 'fontSize' && el.style.fontSize) {
        el.style.fontSize = '';
      } else if (type === 'fontFamily' && el.style.fontFamily) {
        el.style.fontFamily = '';
      } else if (type === 'format' && (el.style.fontWeight || el.style.fontStyle || el.style.textDecoration)) {
        el.style.fontWeight = '';
        el.style.fontStyle = '';
        el.style.textDecoration = '';
      }
      // Remove empty spans
      if (!el.style.cssText) {
        el.replaceWith(...el.childNodes);
      }
    });
  }

  formatText(command: string, stepIndex: number) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer.parentElement;
      if (container) {
        this.removeExistingFormat(container, 'format');
      }
      const span = document.createElement('span');
      span.style.fontWeight = command === 'bold' ? 'bold' : 'normal';
      span.style.fontStyle = command === 'italic' ? 'italic' : 'normal';
      span.style.textDecoration = command === 'underline' ? 'underline' : 'none';
      range.surroundContents(span);
      this.updateStepContent(stepIndex);
    }
  }

  setFont(font: string, stepIndex: number) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer.parentElement;
      if (container) {
        this.removeExistingFormat(container, 'fontFamily');
      }
      const span = document.createElement('span');
      span.style.fontFamily = font;
      range.surroundContents(span);
      this.updateStepContent(stepIndex);
    }
  }

  setFontSize(size: string, stepIndex: number) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer.parentElement;
      if (container) {
        this.removeExistingFormat(container, 'fontSize');
      }
      const span = document.createElement('span');
      span.style.fontSize = `${parseFloat(size) * 4}px`;
      range.surroundContents(span);
      this.updateStepContent(stepIndex);
    }
  }

  onSubmit() {
    if (this.guideForm.valid) {
      const formData = this.guideForm.value;
      localStorage.setItem('currentGuide', JSON.stringify(formData));
      this.router.navigate(['/preview']);
    }
  }
} 