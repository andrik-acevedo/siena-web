import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

// Gradient colors for cards
export const GRADIENT_COLORS = [
  'from-[#e88584] to-[#8e4f63]',
  'from-[#0068aa] to-[#004d7f]',
  'from-[#FFA600] to-[#B36B00]',
  'from-[#B1E006] to-[#6C8300]',
  'from-[#F27C7C] to-[#E03B3B]',
  'from-[#080B42] to-[#6A51A6]', 
  'from-[#00789f] to-[#005a77]',
  'from-[#ea697c] to-[#b8455c]',
  'from-[#008792] to-[#006a70]',
  'from-[#7b5595] to-[#5d4070]',
  'from-[#0068aa] to-[#004d7f]'
];

interface TileCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  tag?: string;
  date?: string;
  gradientColor?: string;
  buttonText?: string;
  onClick?: () => void;
  to?: string;
  className?: string;
  height?: string;
}

export default function TileCard({
  title,
  description,
  icon,
  tag,
  date,
  gradientColor = GRADIENT_COLORS[0],
  buttonText,
  onClick,
  to,
  className = '',
  height = 'h-[320px]'
}: TileCardProps) {
  const cardContent = (
    <div className={`bg-gradient-to-br ${gradientColor} rounded-2xl shadow-md transition-all transform hover:scale-105 hover:shadow-lg ${height} flex flex-col ${className}`}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center space-x-3 mb-3">
          {icon && (
            <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-white line-clamp-1">{title}</h3>
          </div>
        </div>
        
        <p className="text-white/80 text-sm mb-4 line-clamp-2">{description}</p>
        
        {(tag || date) && (
          <div className="flex items-center gap-2 mb-4">
            {tag && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                {tag}
              </span>
            )}
            {date && (
              <span className="text-xs text-white/70">
                {date}
              </span>
            )}
          </div>
        )}
        
        {buttonText && (
          <div className="mt-auto">
            <Button 
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
              onClick={onClick}
            >
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{cardContent}</Link>;
  }

  return cardContent;
}