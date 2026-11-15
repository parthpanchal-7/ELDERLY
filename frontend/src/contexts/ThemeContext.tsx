import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, type Language, type TranslationKey } from '@/lib/translations';

export type TextSize = 'normal' | 'large' | 'xlarge';

interface ThemeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  cycleTextSize: () => void;
  highContrast: boolean;
  setHighContrast: (high: boolean) => void;
  toggleHighContrast: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  speak: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem('saathicare_text_size') as TextSize) || 'large'; // default to large for elderly
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('saathicare_high_contrast') === 'true';
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('saathicare_lang') as Language) || 'en';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply text size changes to HTML root element
  useEffect(() => {
    localStorage.setItem('saathicare_text_size', textSize);
    const root = document.documentElement;
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    root.classList.add(`text-size-${textSize}`);
    root.setAttribute('data-text-size', textSize);

    // Apply direct root font size for foolproof Tailwind rem scaling
    if (textSize === 'normal') {
      root.style.fontSize = '16px';
    } else if (textSize === 'large') {
      root.style.fontSize = '20px';
    } else if (textSize === 'xlarge') {
      root.style.fontSize = '24px';
    }
  }, [textSize]);

  // Apply High Contrast mode to HTML root element
  useEffect(() => {
    localStorage.setItem('saathicare_high_contrast', String(highContrast));
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      root.removeAttribute('data-high-contrast');
    }
  }, [highContrast]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('saathicare_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const cycleTextSize = useCallback(() => {
    setTextSize((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => !prev);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const langDict = translations[language] || translations.en;
      return langDict[key] || translations.en[key] || key;
    },
    [language]
  );

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // Calm cadence for elderly comprehension
    utterance.pitch = 1.0;
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        textSize,
        setTextSize,
        cycleTextSize,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        language,
        setLanguage,
        toggleLanguage,
        t,
        speak,
        isSpeaking,
        stopSpeaking,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
