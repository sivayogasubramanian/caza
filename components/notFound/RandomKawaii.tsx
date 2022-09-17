import React from 'react';
import {
  Backpack,
  Browser,
  Cat,
  CreditCard,
  File,
  Ghost,
  IceCream,
  KawaiiMood,
  KawaiiProps,
  Mug,
  Planet,
  SpeechBubble,
} from 'react-kawaii';

interface Props {
  size?: number;
  color?: string;
}

const icons: React.ComponentType<KawaiiProps>[] = [
  Backpack,
  Browser,
  Cat,
  CreditCard,
  File,
  Ghost,
  IceCream,
  Mug,
  Planet,
  SpeechBubble,
];

const moods: KawaiiMood[] = ['sad', 'shocked', 'ko'];

function getRandomItem<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function RandomKawaii({ size, color }: Props) {
  const Kawaii = getRandomItem(icons);
  const mood = getRandomItem(moods);

  return <Kawaii size={size} mood={mood} color={color} />;
}

export default RandomKawaii;
