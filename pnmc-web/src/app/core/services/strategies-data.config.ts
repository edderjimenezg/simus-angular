import { RANDOM_GALLERY_IMAGES } from './media-library.config';

export interface StrategyCard {
  id: string;
  tag: string;
  title: string;
  desc: string;
  img: string;
  navigatePath: string;
  componentId: string;
  bgGlow: string;
}

export const STRATEGIES_DATA: StrategyCard[] = [
  {
    id: 'celebra-la-musica',
    tag: 'Estrategia de Circulación',
    title: 'Celebra la Música',
    desc: 'Activa escenarios, programación y redes territoriales para que los procesos musicales circulen, se conecten y ganen visibilidad.',
    img: RANDOM_GALLERY_IMAGES[2] || '',
    navigatePath: 'estrategia-circulacion',
    componentId: 'comp-c2-3',
    bgGlow: 'bg-[#6100D7]/20'
  },
  {
    id: 'territorios-sonoros',
    tag: 'Estrategia de Investigación',
    title: 'Territorios Sonoros',
    desc: 'Impulsa procesos de investigación, cartografía y documentación para reconocer, interpretar y proyectar la diversidad sonora del país.',
    img: RANDOM_GALLERY_IMAGES[4] || '',
    navigatePath: 'estrategia-investigacion',
    componentId: 'comp-c2-4',
    bgGlow: 'bg-[#00DA5E]/5'
  },
  {
    id: 'congreso-nacional',
    tag: 'Estrategia de Gobernanza y Participación',
    title: '8vo Congreso Nacional de Música',
    desc: 'Espacio de diálogo académico, social e institucional para consolidar las políticas del sector y fortalecer la gobernanza musical en el país.',
    img: RANDOM_GALLERY_IMAGES[6] || '',
    navigatePath: 'comp-c3-1',
    componentId: 'comp-c3-1',
    bgGlow: 'bg-[#6100D7]/15'
  },
  {
    id: 'tempos-memorias',
    tag: 'Estrategia de Formación',
    title: 'Tempos de Memorias',
    desc: 'Laboratorio formativo enfocado en la cualificación de saberes tradicionales, lutería, pedagogía y preservación de patrimonios sonoros locales.',
    img: RANDOM_GALLERY_IMAGES[8] || '',
    navigatePath: 'comp-c2-1',
    componentId: 'comp-c2-1',
    bgGlow: 'bg-[#00DA5E]/10'
  },
  {
    id: 'voces-saberes',
    tag: 'Estrategia de Investigación',
    title: 'Voces y Saberes',
    desc: 'Proceso nacional de documentación y registro para catalogar las expresiones orales y la memoria viva de nuestros cantautores y sabedores.',
    img: RANDOM_GALLERY_IMAGES[10] || '',
    navigatePath: 'comp-c2-4',
    componentId: 'comp-c2-4',
    bgGlow: 'bg-[#6100D7]/15'
  },
  {
    id: 'red-jazz',
    tag: 'Estrategia de Circulación',
    title: 'Red Nacional de Jazz',
    desc: 'Plataforma de circulación colaborativa que conecta festivales, clubes y músicos de jazz en circuitos nacionales y de intercambio.',
    img: RANDOM_GALLERY_IMAGES[12] || '',
    navigatePath: 'comp-c2-3',
    componentId: 'comp-c2-3',
    bgGlow: 'bg-[#00DA5E]/5'
  },
  {
    id: 'mercados-musicales',
    tag: 'Estrategia de Circulación',
    title: 'Mercados Musicales de Colombia',
    desc: 'Fortalece el encuentro entre programadores, directores y agrupaciones nacionales para dinamizar la circulación nacional e internacional.',
    img: RANDOM_GALLERY_IMAGES[1] || '',
    navigatePath: 'comp-c2-3',
    componentId: 'comp-c2-3',
    bgGlow: 'bg-[#6100D7]/15'
  },
  {
    id: 'mesas-participacion',
    tag: 'Estrategia de Gobernanza y Circulación',
    title: 'Mesas de Participación',
    desc: 'Nodos comunitarios de concertación que articulan el tejido asociativo y las veedurías locales del Plan Nacional de Música.',
    img: RANDOM_GALLERY_IMAGES[3] || '',
    navigatePath: 'comp-c3-1',
    componentId: 'comp-c3-1',
    bgGlow: 'bg-[#00DA5E]/10'
  }
];
