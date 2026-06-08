import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
}

export function LucideIcon({ name, className }: LucideIconProps) {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) {
    // Fallback if icon is not found
    return <Icons.HelpCircle className={className} />;
  }
  return <IconComponent className={className} />;
}
export default LucideIcon;
