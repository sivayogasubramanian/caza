import React from 'react';
import {
  Backpack,
  Browser,
  CreditCard,
  File,
  Ghost,
  IceCream,
  KawaiiMood,
  KawaiiProps,
  Planet,
  SpeechBubble,
} from 'react-kawaii';

interface Props {
  isHappy: boolean;
  size?: number;
  color?: string;
}

const icons: React.ComponentType<KawaiiProps>[] = [
  Backpack,
  Browser,
  CreditCard,
  File,
  Ghost,
  IceCream,
  Planet,
  SpeechBubble,
];

const sadMoods: KawaiiMood[] = ['sad', 'shocked', 'ko'];
const happyMoods: KawaiiMood[] = ['blissful', 'happy', 'excited'];

function getRandomItem<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function RandomKawaii({ isHappy, size, color }: Props) {
  const Kawaii = getRandomItem(icons);
  const moodChoices = isHappy ? happyMoods : sadMoods;
  const mood = getRandomItem(moodChoices);

  return <Kawaii size={size} mood={mood} color={color} />;
}

export default RandomKawaii;
