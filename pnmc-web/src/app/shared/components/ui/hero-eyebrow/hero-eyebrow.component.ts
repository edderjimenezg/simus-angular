import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-eyebrow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-eyebrow.component.html',
})
export class HeroEyebrowComponent {
  @Input() text = '';
}
