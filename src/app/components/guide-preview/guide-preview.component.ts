import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-guide-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <mat-card>
      <mat-card-header>

        <mat-card-title>
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
          {{guide?.title}}
          </mat-card-title>
        <div class="spacer"></div>
        <button mat-raised-button color="primary" class="export-button" (click)="exportPDF()">
          <mat-icon>picture_as_pdf</mat-icon>
          Export PDF
        </button>
        <button mat-raised-button color="accent" (click)="exportWord()">
          <mat-icon>description</mat-icon>
          Export Word
        </button>
      </mat-card-header>
      <mat-card-content>
        <div *ngFor="let step of guide?.steps; let i = index" [@stepAnimation]="'in'">
          <mat-card class="step-card">
            <mat-card-header>
              <mat-card-title>Step {{i + 1}}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p [innerHTML]="step.description"></p>
              <div class="images-grid" *ngIf="step.images?.length">
                <img *ngFor="let image of step.images" [src]="image.preview" class="step-image">
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    .step-card {
      margin-bottom: 20px;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .step-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    mat-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      text-transform: capitalize;
    }
    .export-button {
      margin-right: 16px;
    }
  `],
  animations: [
    trigger('stepAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class GuidePreviewComponent implements OnInit {
  guide: any;

  constructor(private router: Router) {}

  ngOnInit() {
    const savedGuide = localStorage.getItem('currentGuide');
    if (savedGuide) {
      this.guide = JSON.parse(savedGuide);
    } else {
      this.router.navigate(['/']);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  async exportPDF() {
    const doc = new jsPDF();
    let yOffset = 20;

    // Add title
    doc.setFontSize(20);
    doc.text(this.guide.title, 20, yOffset);
    yOffset += 20;

    // Add steps
    for (let i = 0; i < this.guide.steps.length; i++) {
      const step = this.guide.steps[i];
      
      // Add step number
      doc.setFontSize(16);
      doc.text(`Step ${i + 1}`, 20, yOffset);
      yOffset += 10;

      // Create a temporary div for the description
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = step.description;
      tempDiv.style.width = '170px';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.fontFamily = 'Arial';
      tempDiv.style.lineHeight = '1.2';
      console.log(tempDiv);
      console.log(step.description);
      document.body.appendChild(tempDiv);

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        width: 170,
        height: tempDiv.offsetHeight,
        scale: 3,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });

      // Add the canvas to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 20, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 10;

      // Clean up
      document.body.removeChild(tempDiv);

      // Add images
      if (step.images && step.images.length > 0) {
        for (const image of step.images) {
          if (yOffset > 200) {
            doc.addPage();
            yOffset = 20;
          }
          
          try {
            const img = new Image();
            img.src = image.preview;
            await new Promise((resolve) => {
              img.onload = () => {
                const imgWidth = 170;
                const imgHeight = (img.height * imgWidth) / img.width;
                doc.addImage(img, 'JPEG', 20, yOffset, imgWidth, imgHeight);
                yOffset += imgHeight + 10;
                resolve(null);
              };
            });
          } catch (error) {
            console.error('Error adding image to PDF:', error);
          }
        }
      }

      // Add page break between steps if not the last step
      if (i < this.guide.steps.length - 1) {
        doc.addPage();
        yOffset = 20;
      }
    }

    doc.save(`${this.guide.title}.pdf`);
  }

  private parseHtmlToTextRuns(element: HTMLElement): TextRun[] {
    const textRuns: TextRun[] = [];
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          textRuns.push(new TextRun({
            text: text, // Add space after each text node
            size: 24,
            font: 'Arial',
          }));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const style: any = {
          font: 'Arial',
          size: 24,
        };
        
        // Handle common HTML formatting
        if (element.tagName === 'B' || element.tagName === 'STRONG') {
          style.bold = true;
        }
        if (element.tagName === 'I' || element.tagName === 'EM') {
          style.italics = true;
        }
        if (element.tagName === 'U') {
          style.underline = {};
        }
        if (element.style.fontFamily) {
          style.font = element.style.fontFamily;
        }
        if (element.style.fontSize) {
          style.size = parseInt(element.style.fontSize) * 2;
        }
        
        // Process child nodes
        Array.from(element.childNodes).forEach(child => {
          const childRuns = this.parseHtmlToTextRuns(child as HTMLElement);
          textRuns.push(...childRuns);
        });

        // Add line break for block elements
        if (['P', 'DIV', 'BR'].includes(element.tagName)) {
          textRuns.push(new TextRun({
            text: '\n',
            size: 24,
            font: 'Arial',
          }));
        }
      }
    };

    processNode(element);
    return textRuns;
  }

  async exportWord() {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: this.guide.title,
                bold: true,
                size: 32,
                font: 'Arial',
              }),
            ],
          }),
          ...this.guide.steps.map((step: any, index: number) => {
            const children = [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `Step ${index + 1}`,
                    bold: true,
                    size: 24,
                    font: 'Arial',
                  }),
                ],
              }),
            ];

            // Parse HTML content and create formatted text runs
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = step.description;
            const textRuns = this.parseHtmlToTextRuns(tempDiv);
            
            // Add description paragraph
            if (textRuns.length > 0) {
              children.push(
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: {
                    line: 360, // 1.5 line spacing
                  },
                  children: textRuns,
                })
              );
            }

            // Add images if they exist
            if (step.images && step.images.length > 0) {
              step.images.forEach((image: any) => {
                children.push(
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: image.preview.split(',')[1],
                        transformation: {
                          width: 400,
                          height: 300,
                        },
                      }),
                    ],
                  })
                );
              });
            }

            return children;
          }).flat(),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.guide.title}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
} 