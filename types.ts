import React from 'react';

export interface TTSRequest {
  ref_audio_base64: string;
  ref_text: string;
  gen_text: string;
  lang?: string; // Query param
}

export interface TTSResponse {
  audio_base64: string;
}

export interface LanguageDemo {
  id: string;
  name: string;
  scriptLabel: string; // Native script label
  demos: {
    title: string;
    display_text: string; // English/Transliterated for UI
    actual_text: string; // Native script for API
    type: 'Normal' | 'Code-Mix';
  }[];
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ElementType;
}