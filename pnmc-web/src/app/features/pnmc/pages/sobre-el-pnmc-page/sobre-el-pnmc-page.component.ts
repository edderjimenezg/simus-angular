import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideArrowRight, 
  LucideZap, 
  LucideBoxes, 
  LucideLandmark, 
  LucideGlobe, 
  LucideUsers2, 
  LucideMap, 
  LucideMusic2, 
  LucideBuilding2, 
  LucideUsers, 
  LucideUserCircle2, 
  LucideMessageCircle 
} from '@lucide/angular';
import { NavigationService } from '../../../../core/services/navigation.service';
import { WebTextsService } from '../../../../core/services/web-texts.service';
import { PageHeroComponent } from '../../../../shared/components/ui/page-hero/page-hero.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { TagComponent } from '../../../../shared/components/ui/tag/tag.component';
import { ContentWrapperComponent } from '../../../../shared/components/ui/content-wrapper/content-wrapper.component';
import { RANDOM_GALLERY_IMAGES } from '../../../../core/services/media-library.config';

@Component({
  selector: 'app-sobre-el-pnmc-page',
  standalone: true,
  imports: [
    CommonModule,
    PageHeroComponent,
    SectionHeaderComponent,
    TagComponent,
    ContentWrapperComponent,
    LucideArrowRight, 
    LucideZap, 
    LucideBoxes, 
    LucideLandmark, 
    LucideGlobe, 
    LucideUsers2, 
    LucideMap, 
    LucideMusic2, 
    LucideBuilding2, 
    LucideUsers, 
    LucideUserCircle2, 
    LucideMessageCircle
  ],
  templateUrl: './sobre-el-pnmc-page.component.html'
})
export class SobreElPnmcPageComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private webTexts = inject(WebTextsService);

  activeStage = signal<number>(4);
  activeNormativeStage = signal<number>(4);

  workTeam = [
    { role: 'Coordinación Grupo de Música', name: 'Jorge Enrique Sossa Santos', email: 'jsossa@mincultura.gov.co' },
    { role: 'Apoyo a la coordinación', name: 'Dora Carolina Rojas Rivera', email: 'drojas@mincultura.gov.co' },
    { role: 'Líder Componente: Formación', name: 'Diego Rodríguez', email: 'drodriguezc@mincultura.gov.co' },
    { role: 'Líder Componente: Investigación', name: 'Raúl Hernán Daza', email: 'rdaza@mincultura.gov.co' },
    { role: 'Líder Componente: Circulación', name: 'Carolina Ruiz Barragán', email: 'druizb@mincultura.gov.co' },
    { role: 'Líder Componente: Dotación', name: 'Guadalupe Gil', email: 'ggil@mincultura.gov.co' },
    { role: 'Líder Componente: Creación', name: 'Isabel Durán', email: 'iduranp@mincultura.gov.co' },
    { role: 'Líder Componente: Gobernanza', name: '', email: '' },
    { role: 'Líder Componente: Información', name: 'Yazmín López', email: 'ylopez@mincultura.gov.co' },
    { role: 'Líder Componente: Comunicación', name: 'Shirley Giomar Gómez', email: 'sgomezc@mincultura.gov.co' },
  ];

  timelineEvents = [ 
    { id: 0, year: '2003-2006', title: 'Creación e Institucionalización', desc: 'La aprobación del CONPES 3409 de 2006 formalizó el PNMC y consolidó las Escuelas Municipales de Música (EMM) como espacios centrales para la formación musical colectiva. Este periodo estableció los cimientos del programa: acceso, democratización, convivencia y fortalecimiento de las músicas locales. Se amplió la dotación instrumental, se fortalecieron los equipos territoriales y se empezó a articular una red nacional de formación basada en la práctica comunitaria.', img: RANDOM_GALLERY_IMAGES[11] }, 
    { id: 1, year: '2007-2014', title: 'Territorialización y saberes', desc: 'Durante esta etapa se profundizó en la institucionalización territorial, con énfasis en la formación de formadores, la cualificación de músicos en ejercicio y el impulso a las músicas tradicionales. Se promovió la descentralización, se consolidaron procesos comunitarios sostenidos y se promovió el reconocimiento de músicos empíricos y sabedores. Este periodo marcó un avance significativo en la diversidad musical, al visibilizar prácticas propias de cada región y promover su circulación.', img: RANDOM_GALLERY_IMAGES[12] }, 
    { id: 2, year: '2015-2018', title: 'Profesionalización y SIMUS', desc: 'En estos años se desarrollaron las líneas estratégicas de Musicalización de la Ciudadanía y Estructuración del Campo Profesional de la Música, orientadas a fortalecer la formación integral y la profesionalización del sector. Se creó el Sistema de Información de la Música (SIMUS), herramienta clave para la toma de decisiones y la caracterización del ecosistema musical. Además, se implementaron nuevas estrategias de circulación y se amplió la presencia del PNMC en festivales, mercados y espacios de movilidad artística.', img: RANDOM_GALLERY_IMAGES[13] }, 
    { id: 3, year: '2018-2022', title: 'Evaluación y Consolidación', desc: 'El Departamento Nacional de Planeación (DNP) realizó una evaluación integral del PNMC, destacando su impacto en la formación musical, el fortalecimiento del tejido social y la dignificación del trabajo artístico. A partir de esta evaluación se identificaron retos y oportunidades, como mejorar la articulación interinstitucional, fortalecer SIMUS, ampliar la presencia del PNMC en educación superior, incentivar economías creativas en los territorios y mejorar las condiciones laborales de los músicos y formadores.', img: RANDOM_GALLERY_IMAGES[14] }, 
    { id: 4, year: '2023-2025', title: 'Actualización y Proyección 2035', desc: 'En un ejercicio nacional sin precedentes, el Ministerio de las Culturas abrió espacios de participación a través de 34 Encuentros Territoriales, mesas sectoriales, la Mesa Nacional Vinculante y el VII Congreso Nacional de Música. Estas iniciativas permitieron recoger las necesidades, visiones y apuestas del sector musical en todo el país y dieron origen al PNMC 2025-2035, "Huellas y apuestas de la diversidad sonora". Este nuevo Plan articula la música con la vida, el diálogo intercultural, la bioculturalidad, la equidad, la sostenibilidad y la gobernanza participativa, proyectando un ecosistema musical diverso, justo y sostenible para la próxima década.', img: RANDOM_GALLERY_IMAGES[15] } 
  ]; 

  normativeStages = [
    {
      id: 0,
      year: '1997',
      title: 'Ley 397 de 1997',
      desc: 'La Ley General de Cultura establece los principios, objetivos y mecanismos para proteger, fomentar y difundir la cultura en Colombia. Reconoce la diversidad cultural como fundamento de la identidad nacional y define la cultura como derecho. En su estructura se incluyen disposiciones para el fomento de las artes, la formación artística y la protección del patrimonio cultural, elementos esenciales para el desarrollo del PNMC. Actualizada por la Ley 1185 de 2008.',
      img: RANDOM_GALLERY_IMAGES[16],
    },
    {
      id: 1,
      year: '2006',
      title: 'CONPES 3409 de 2006',
      desc: 'Este documento aprobó la política del Plan Nacional de Música para la Convivencia, institucionalizando las Escuelas Municipales de Música y definiendo estrategias para mejorar la formación musical, la dotación instrumental y la gestión cultural en los territorios. Fue la base técnica y financiera que permitió consolidar el PNMC como política pública estable.',
      img: RANDOM_GALLERY_IMAGES[17],
    },
    {
      id: 2,
      year: '2011',
      title: 'Ley 1493 de 2011',
      desc: 'La Ley de Espectáculos Públicos regula la organización de espectáculos públicos de las artes escénicas y promueve la circulación artística en condiciones más equitativas. Aunque su alcance es más amplio que la música, ha tenido un impacto directo en la infraestructura cultural y en la movilidad de artistas y agrupaciones musicales en el país, facilitando escenarios más dignos y accesibles.',
      img: RANDOM_GALLERY_IMAGES[18],
    },
    {
      id: 3,
      year: '2018',
      title: 'Decreto 2120 de 2018',
      desc: 'Este decreto reglamenta la organización, funcionamiento y articulación de los subsistemas que integran el Sistema Nacional de Cultura. Para el PNMC es clave porque define los espacios de participación ciudadana, la gobernanza territorial y las responsabilidades institucionales en procesos formativos y comunitarios, incluyendo los vinculados a las músicas del país.',
      img: RANDOM_GALLERY_IMAGES[0],
    },
    {
      id: 4,
      year: '2024-2038',
      title: 'Plan Nacional de Cultura',
      desc: 'El nuevo PNC establece la visión cultural del país para los próximos 14 años. Define la cultura como eje del cuidado de la vida, la diversidad y la paz, y orienta las políticas del Ministerio de las Culturas, las Artes y los Saberes. El PNMC 2025-2035 se enmarca plenamente en esta estrategia, en sus componentes institucional y subsectorial, articulando lineamientos de diversidad sonora, ecosistemas culturales, gobernanza y sostenibilidad.',
      img: RANDOM_GALLERY_IMAGES[1],
    },
    {
      id: 6,
      year: '2025',
      title: 'Ley 2555 de 2025',
      desc: 'La Ley Artes al Aula convierte la educación artística en un mandato para todas las instituciones educativas oficiales del país. Reconoce las artes, incluida la música, como un derecho cultural fundamental y exige su incorporación transversal en los procesos pedagógicos, fortaleciendo competencias creativas, socioemocionales y ciudadanas. Impulsa la formación docente en pedagogías artísticas, promueve la articulación entre escuela, comunidad y territorio, y orienta la implementación desde el SINEFAC, facilitando la coordinación entre los sectores de educación y cultura.',
      img: RANDOM_GALLERY_IMAGES[3],
    },
  ];

  ngOnInit() {}

  getWebText(key: string, fallback = ''): string {
    return this.webTexts.getWebText(key) || fallback;
  }

  onBackToHome() {
    this.navigationService.navigate('home');
  }

  navigateToSection(page: string, sectionId: string) {
    this.navigationService.navigate(page);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        const yOffset = -100;
        const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 150);
  }
}
