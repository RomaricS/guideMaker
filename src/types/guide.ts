export interface Step {
  id: string;
  description: string;
  image: File | null;
  imagePreview?: string;
}

export interface Guide {
  id: string;
  title: string;
  steps: Step[];
  createdAt: Date;
} 