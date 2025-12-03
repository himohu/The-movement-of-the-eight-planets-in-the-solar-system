import { PlanetData } from './types';

// Distances and sizes are not to scale (for visibility), but preserve relative order.
export const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: '水星',
    color: '#A5A5A5',
    type: 'terrestrial',
    textureColors: ['#707070', '#909090'],
    size: 4,
    distance: 60,
    speed: 4.1,
    description: "太阳系最小的行星，也是离太阳最近的行星。它表面布满陨石坑，就像月球一样。"
  },
  {
    id: 'venus',
    name: '金星',
    color: '#E3BB76',
    type: 'terrestrial',
    textureColors: ['#D4A050', '#E6C288'],
    size: 7,
    distance: 90,
    speed: 1.6,
    description: "太阳系第二颗行星。它是天空中最亮的星星，因为厚厚的大气层反射了阳光，表面非常热。"
  },
  {
    id: 'earth',
    name: '地球',
    color: '#2E63CC',
    type: 'terrestrial',
    textureColors: ['#4F83CC', '#25521C', '#FFFFFF'], // Ocean, Land, Clouds
    size: 7.5,
    distance: 130,
    speed: 1,
    description: "我们的家园，太阳系第三颗行星。它是目前已知唯一孕育生命的星球，表面大部分被蓝色的海洋覆盖。"
  },
  {
    id: 'mars',
    name: '火星',
    color: '#E27B58',
    type: 'terrestrial',
    textureColors: ['#C1440E', '#E89070'],
    size: 5,
    distance: 170,
    speed: 0.53,
    description: "太阳系第四颗行星，被称为'红色星球'。它有巨大的火山和峡谷，科学家们正在探索上面是否有生命存在过的痕迹。"
  },
  {
    id: 'jupiter',
    name: '木星',
    color: '#D6A56C',
    type: 'gas_giant',
    textureColors: ['#A67645', '#E3CBA6', '#C49866', '#8F6340'], // Band colors
    size: 22,
    distance: 260,
    speed: 0.08,
    description: "太阳系最大的行星！它是一颗巨大的气态行星，表面有红白相间的条纹和一个巨大的红色风暴，叫做'大红斑'。"
  },
  {
    id: 'saturn',
    name: '土星',
    color: '#F4D03F',
    type: 'gas_giant',
    textureColors: ['#E0C870', '#D4BC5F', '#C4AC4F'],
    size: 18,
    distance: 350,
    speed: 0.03,
    description: "太阳系第二大行星，拥有最美丽的光环系统。它的光环主要由冰块和岩石组成，非常壮观。",
    hasRings: true,
    ringColor: 'rgba(196, 172, 126, 0.6)',
    ringSize: 32
  },
  {
    id: 'uranus',
    name: '天王星',
    color: '#7DE3F4',
    type: 'ice_giant',
    textureColors: ['#5BC5D6', '#9AEDF5'],
    size: 12,
    distance: 430,
    speed: 0.01,
    description: "太阳系第七颗行星，是一颗冰巨星。它躺在轨道上滚动，颜色是美丽的青蓝色。"
  },
  {
    id: 'neptune',
    name: '海王星',
    color: '#3E54E8',
    type: 'ice_giant',
    textureColors: ['#3040B0', '#4E66F8'],
    size: 11,
    distance: 500,
    speed: 0.006,
    description: "太阳系最远的行星，是一颗深蓝色的冰巨星。那里非常寒冷，有着太阳系最强烈的风暴。"
  }
];

export const SUN_DATA = {
  id: 'sun',
  name: '太阳',
  color: '#FFD700',
  type: 'star',
  size: 40,
  distance: 0,
  speed: 0,
  description: "太阳系的中心，一颗巨大的恒星。它为我们提供光和热，没有它就没有地球上的生命。"
};