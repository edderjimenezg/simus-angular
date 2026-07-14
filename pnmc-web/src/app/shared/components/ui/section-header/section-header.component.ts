import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full text-left group" [class.mb-4]="compact" [class.lg:mb-6]="compact" [class.mb-8]="!compact" [class.lg:mb-12]="!compact">
      <div class="relative inline-block">
        <div
          class="font-gregor text-[4.5rem] lg:text-[8rem] select-none opacity-50 leading-none tracking-tight pointer-events-none text-left"
          style="color: #E6DAE5"
        >
          {{ backgroundText }}
        </div>
        <div class="absolute bottom-0 left-0 z-10 flex items-end gap-3 md:gap-4 text-left whitespace-nowrap">
          <h2 class="font-gregor text-[#291242] uppercase tracking-tighter leading-none text-3xl lg:text-5xl">
            {{ foregroundText }}
          </h2>
          <div class="w-8 lg:w-12 h-1.5 bg-[#8BF784] rounded-full mb-1 opacity-80 group-hover:w-24 transition-all duration-500"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SectionHeaderComponent {
  @Input() backgroundText = '';
  @Input() foregroundText = '';
  @Input() compact = false;
}
