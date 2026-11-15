import React, { createContext, useContext, useState, useEffect } from 'react';

type TextSize = 'normal' | 'large' | 'xlarge';
type Language = 'en' | 'hi';

interface ThemeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (high: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
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

  useEffect(() => {
    localStorage.setItem('saathicare_text_size', textSize);
    const root = document.documentElement;
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    root.classList.add(`text-size-${textSize}`);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('saathicare_high_contrast', String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('saathicare_lang', language);
  }, [language]);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower, calm cadence for elderly comprehension
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
        highContrast,
        setHighContrast,
        language,
        setLanguage,
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
