import { FeatureItem, LanguageDemo, VoicePreset } from './types';
import { Mic, Globe, Repeat, Zap, Layers, Languages } from 'lucide-react';

export const API_URL = "https://800ed9a6a87b.ngrok-free.app/v1/tts";

export const LOGO_URL = "/bharatgen-logo.png";

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'hi',
    name: 'Hindi',
    audioUrl: '/voices/voice-hi.wav',
    refText: 'हम जल्द से जल्द इस समस्या का समाधान करेंगे।',
    languageId: 'hi'
  },
  {
    id: 'bn',
    name: 'Bengali',
    audioUrl: '/voices/voice-bn.wav',
    refText: 'তাতে অবশ্য ভড়ং ভণ্ডামি আর দুর্নীতির শেষ নেই',
    languageId: 'bn'
  },
  {
    id: 'ta',
    name: 'Tamil',
    audioUrl: '/voices/voice-ta.wav',
    refText: 'சென்னை சென்ட்ரல் விஜயவாடா ஜன் சதாப்தி எக்ஸ்பிரஸ்',
    languageId: 'ta'
  },
  {
    id: 'mr',
    name: 'Marathi',
    audioUrl: '/voices/voice-mr.wav',
    refText: 'यासाठी एखादं टूर पॅकेज सुचवाल का?',
    languageId: 'mr'
  },
  {
    id: 'en',
    name: 'English',
    audioUrl: '/voices/voice-en.wav',
    refText: 'Some call me nature, others call me mother nature.',
    languageId: 'en'
  }
];

export const FEATURES: FeatureItem[] = [
  {
    title: "Voice Cloning",
    description: "Clone a speaker’s voice from a short audio sample while preserving natural tone and style.",
    icon: Mic
  },
  {
    title: "Polyglot Generation",
    description: "Generate speech seamlessly across 12 languages using a single unified model.",
    icon: Globe
  },
  {
    title: "Cross-Language Transfer",
    description: "Use a voice sample in one language to generate speech in another language.",
    icon: Repeat
  },
  {
    title: "Blazing-Fast Speed",
    description: "Near-instant speech output designed for real-time applications.",
    icon: Zap
  },
  {
    title: "Code-Mixed Speech",
    description: "Naturally handles mixed-language sentences like Hindi–English or Tamil–English.",
    icon: Layers
  },
  {
    title: "12-Language Support",
    description: "Supports Indian-accented English, Hindi, Bengali, Gujarati, Kannada, and more.",
    icon: Languages
  }
];

export const LANGUAGE_DEMOS: LanguageDemo[] = [
  {
    id: 'en',
    name: 'English',
    scriptLabel: 'English',
    demos: [
      {
        title: "Standard English",
        display_text: "BharatGen is building AI for Indian languages.",
        actual_text: "BharatGen is building AI for Indian languages.",
        type: "Normal"
      },
      {
        title: "Product Vision",
        display_text: "Voice cloning that feels natural and fast.",
        actual_text: "Voice cloning that feels natural and fast.",
        type: "Normal"
      }
    ]
  },
  {
    id: 'hi',
    name: 'Hindi',
    scriptLabel: 'हिन्दी',
    demos: [
      {
        title: "Standard Hindi",
        display_text: "BharatGen is building AI for Indian languages.",
        actual_text: "भारतजेन भारतीय भाषाओं के लिए एआई बना रहा है।",
        type: "Normal"
      },
      {
        title: "Code-Mixed Hindi",
        display_text: "India's diversity, AI's power.",
        actual_text: "भारत की विविधता, एआई की ताकत।",
        type: "Code-Mix"
      }
    ]
  },
  {
    id: 'mr',
    name: 'Marathi',
    scriptLabel: 'मराठी',
    demos: [
      {
        title: "Standard Marathi",
        display_text: "Our language is not just words, it is our identity.",
        actual_text: "आपली भाषा म्हणजे केवळ शब्द नाहीत, ती आपली ओळख आहे.",
        type: "Normal"
      },
      {
        title: "Code-Mixed Marathi",
        display_text: "AI speaking in our language.",
        actual_text: "आपल्या भाषेत बोलणारी एआय.",
        type: "Code-Mix"
      }
    ]
  },
  {
    id: 'gu',
    name: 'Gujarati',
    scriptLabel: 'ગુજરાતી',
    demos: [
      {
        title: "Standard Gujarati",
        display_text: "BharatGen puts Indian languages at the center of AI.",
        actual_text: "ભારતજેન ભારતીય ભાષાઓને એઆઈના કેન્દ્રમાં મૂકે છે.",
        type: "Normal"
      },
      {
        title: "Code-Mixed Gujarati",
        display_text: "Building AI with Indian Languages is a future-ready idea.",
        actual_text: "ઇન્ડિયન લેન્ગ્વેજિસ સાથે એઆઈ બનાવવું એ ફ્યુચર-રેડી વિચાર છે.",
        type: "Code-Mix"
      }
    ]
  },
  {
    id: 'bn',
    name: 'Bengali',
    scriptLabel: 'বাংলা',
    demos: [
      {
        title: "Standard Bengali",
        display_text: "India's identity lives in its languages.",
        actual_text: "ভারতের পরিচয় তার ভাষার মধ্যেই বেঁচে থাকে।",
        type: "Normal"
      },
      {
        title: "Tech Focus",
        display_text: "Technology works best when built on language.",
        actual_text: "ভাষার উপর ভিত্তি করে তৈরি করা প্রযুক্তি সবার জন্য বেশি কার্যকর।",
        type: "Normal"
      }
    ]
  },
  {
    id: 'ta',
    name: 'Tamil',
    scriptLabel: 'தமிழ்',
    demos: [
      {
        title: "Standard Tamil",
        display_text: "Since the weather was pleasant today, the evening walk was very enjoyable.",
        actual_text: "இன்று வானிலை இனிமையாக இருந்ததால், மாலை நேர நடைப்பயணம் மிகவும் மகிழ்ச்சியாக இருந்தது.",
        type: "Normal"
      },
      {
        title: "About BharatGen",
        display_text: "BharatGen works with the aim of bringing technology to people's daily lives.",
        actual_text: "பாரத்ஜென் தொழில்நுட்பத்தை மனிதர்களின் தினசரி வாழ்க்கைக்கு பயனுள்ள வகையில் கொண்டு சேர்க்கும் நோக்கத்துடன் செயல்படுகிறது.",
        type: "Normal"
      }
    ]
  },
  {
    id: 'kn',
    name: 'Kannada',
    scriptLabel: 'ಕನ್ನಡ',
    demos: [
      {
        title: "Standard Kannada",
        display_text: "BharatGen is building AI for Indian languages.",
        actual_text: "ಆದರೆ ಈ ಸಣ್ಣ ಮಳಿಗೆಗಳು ಕ್ಯಾಂಡಿ, ಸಣ್ಣ ಆಟಿಕೆಗಳು ಮತ್ತು ಇತರ ಹಬ್ಬದ ನಿಕ್ನಾಕ್ಸ್ಗಳಂತಹ ಸ್ಟಾಕಿಂಗ್ ಸ್ಟಫರ್ಗಳಿಗೆ ಉತ್ತಮ ಆಯ್ಕೆಯಾಗಬಲ್ಲವು.",
        type: "Normal"
      }
    ]
  },
  {
    id: 'ml',
    name: 'Malayalam',
    scriptLabel: 'മലയാളം',
    demos: [
      {
        title: "Standard Malayalam",
        display_text: "Technology should feel natural in every language.",
        actual_text: "അവിടുത്തെ സൗകര്യങ്ങളൊക്കെ എന്നെ നന്നായി ആകർഷിച്ചു.",
        type: "Normal"
      }
    ]
  },
  {
    id: 'te',
    name: 'Telugu',
    scriptLabel: 'తెలుగు',
    demos: [
      {
        title: "Standard Telugu",
        display_text: "AI should sound natural in our language.",
        actual_text: "నా పీహెచ్డీ ప్రోగ్రామ్ అంచనాలు  నన్ను కొంచెం  భయపెడుతున్నాయి.",
        type: "Normal"
      }
    ]
  },
  {
    id: 'ur',
    name: 'Urdu',
    scriptLabel: 'اردو',
    demos: [
      {
        title: "Standard Urdu",
        display_text: "BharatGen gives voice to every language.",
        actual_text: "ہماچل ایکسپریس",
        type: "Normal"
      }
    ]
  },
  {
    id: 'or',
    name: 'Odia',
    scriptLabel: 'ଓଡିଆ',
    demos: [
      {
        title: "Standard Odia",
        display_text: "Language is identity.",
        actual_text: "ନିଜର ସାଧୁତା ଯୋଗୁ ସେ ଉଭୟ ଇଉରୋପୀୟ ଓ ନେଟିଭମାନଙ୍କ ଦ୍ୱାରା ସର୍ବତୋଭାବେ ସମ୍ମାନିତ।",
        type: "Normal"
      }
    ]
  },
  {
    id: 'pa',
    name: 'Punjabi',
    scriptLabel: 'ਪੰਜਾਬੀ',
    demos: [
      {
        title: "Standard Punjabi",
        display_text: "BharatGen brings AI to every language.",
        actual_text: "ਮੈਂ ਸੱਚੇ ਦਿਲੋਂ ਸਹੁੰ ਖਾਂਦਾ ਹਾਂ ਕਿ ਮੈਂ ਰਾਸ਼ਟਰ ਦੀ ਏਕਤਾ, ਅਖੰਡਤਾ ਅਤੇ ਸੁਰੱਖਿਆ ਨੂੰ ਬਣਾਈ ਰੱਖਣ ਲਈ ਆਪਣੇ ਆਪ ਨੂੰ ਸਮਰਪਿਤ ਕਰਦਾ ਹਾਂ ਅਤੇ ਇਸ ਸੰਦੇਸ਼ ਨੂੰ ਆਪਣੇ ਸਾਥੀ ਦੇਸ਼ਵਾਸੀਆਂ ਵਿੱਚ ਫੈਲਾਉਣ ਲਈ ਸਖ਼ਤ ਮਿਹਨਤ ਕਰਾਂਗਾ।",
        type: "Normal"
      }
    ]
  }
];
