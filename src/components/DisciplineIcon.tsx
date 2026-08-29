import React from 'react';
import { 
  BookOpen, 
  Brain, 
  Atom, 
  Sparkles, 
  Scroll, 
  Globe, 
  Calculator, 
  Languages, 
  GraduationCap, 
  Compass,
  FileText,
  HelpCircle
} from 'lucide-react';

interface DisciplineIconProps {
  discipline?: string;
  className?: string;
}

export const DisciplineIcon: React.FC<DisciplineIconProps> = ({ discipline = '', className = 'w-4 h-4' }) => {
  const d = discipline.toLowerCase();

  if (d.includes('philo') || d.includes('philosophie') || d.includes('🧠')) {
    return <Brain className={className} />;
  }
  if (d.includes('math') || d.includes('mathematiques') || d.includes('📐')) {
    return <Calculator className={className} />;
  }
  if (d.includes('physique') || d.includes('chimie') || d.includes('⚡') || d.includes('🧪')) {
    return <Atom className={className} />;
  }
  if (d.includes('svt') || d.includes('biologie') || d.includes('🌱')) {
    return <Sparkles className={className} />;
  }
  if (d.includes('histoire') || d.includes('📜') || d.includes('🏺')) {
    return <Scroll className={className} />;
  }
  if (d.includes('geo') || d.includes('geographie') || d.includes('géographie') || d.includes('🌍') || d.includes('🌐')) {
    return <Globe className={className} />;
  }
  if (d.includes('allemand') || d.includes('deutsch') || d.includes('anglais') || d.includes('english') || d.includes('espagnol') || d.includes('spanish') || d.includes('langue')) {
    return <Languages className={className} />;
  }
  if (d.includes('francais') || d.includes('français') || d.includes('lettres') || d.includes('littérature') || d.includes('livre') || d.includes('📘') || d.includes('📚')) {
    return <BookOpen className={className} />;
  }
  if (d.includes('bac') || d.includes('bepc') || d.includes('college') || d.includes('lycee') || d.includes('🎓') || d.includes('🎒')) {
    return <GraduationCap className={className} />;
  }

  return <Compass className={className} />;
};
