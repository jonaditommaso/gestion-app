import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;

}

export function snakeCaseToTitleCase(text: string) {
  return text
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

const predefinedColors = ['#fd6f63', '#ff9750', '#ffd042', '#fee801', '#c1e746', '#72d26e', '#66e9da', '#a894cd', '#ff38f8', '#ff088d'];

export const generateColorFromPalette = (index: number) => {
  return predefinedColors[index % predefinedColors.length];
};