import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebTextsService } from '../../../../core/services/web-texts.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  private webTexts = inject(WebTextsService);
  currentYear = new Date().getFullYear();

  // NOTA: destinos institucionales por defecto. Reemplazar por las URLs oficiales
  // definitivas del PNMC/Ministerio cuando el equipo de contenido las confirme.
  private readonly minculturaBase = 'https://www.mincultura.gov.co';

  socialNetworks: { label: string; href: string }[] = [
    { label: 'YouTube', href: 'https://www.youtube.com/@MinCulturasCol' },
    { label: 'Instagram', href: 'https://www.instagram.com/minculturascol' },
    { label: 'Facebook', href: 'https://www.facebook.com/MinCulturasCol' },
    { label: 'X', href: 'https://x.com/MinCulturasCol' },
    { label: 'WhatsApp', href: 'https://wa.me/573138000000' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@minculturascol' },
  ];

  citizenshipServices: { label: string; href: string }[] = [
    { label: 'PQRSD', href: `${this.minculturaBase}/atencion-al-ciudadano/Paginas/PQRS.aspx` },
    { label: 'Preguntas Frecuentes', href: `${this.minculturaBase}/atencion-al-ciudadano/preguntas-frecuentes` },
    { label: 'Glosario', href: `${this.minculturaBase}/atencion-al-ciudadano/glosario` },
    { label: 'Trámites y servicios', href: `${this.minculturaBase}/atencion-al-ciudadano/tramites-y-servicios` },
  ];

  aboutSite: { label: string; href: string }[] = [
    { label: 'Políticas', href: `${this.minculturaBase}/politicas` },
    { label: 'Política de privacidad y protección de datos', href: `${this.minculturaBase}/proteccion-de-datos` },
    { label: 'Mapa del sitio', href: `${this.minculturaBase}/mapa-del-sitio` },
    { label: 'Términos y condiciones', href: `${this.minculturaBase}/terminos-y-condiciones` },
    { label: 'Accesibilidad', href: `${this.minculturaBase}/accesibilidad` },
  ];

  getWebText(key: string, fallback: string): string {
    return this.webTexts.getWebText(key) || fallback;
  }
}
