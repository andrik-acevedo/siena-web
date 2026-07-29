type OrnateCardBorderProps = {
  className?: string;
};

const OrnateCardBorder = ({ className = "text-white" }: OrnateCardBorderProps) => (
  <div className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}>
    {/* Ornate corners */}
    <div className="absolute top-2 left-2 w-20 h-20 border-l-4 border-t-4 border-current opacity-70 rounded-tl-lg" />
    <div className="absolute top-2 right-2 w-20 h-20 border-r-4 border-t-4 border-current opacity-70 rounded-tr-lg" />
    <div className="absolute bottom-2 left-2 w-20 h-20 border-l-4 border-b-4 border-current opacity-70 rounded-bl-lg" />
    <div className="absolute bottom-2 right-2 w-20 h-20 border-r-4 border-b-4 border-current opacity-70 rounded-br-lg" />

    {/* Decorative lines */}
    <div className="absolute top-6 left-16 right-16 h-px bg-current opacity-50" />
    <div className="absolute bottom-6 left-16 right-16 h-px bg-current opacity-50" />
    <div className="absolute left-6 top-16 bottom-16 w-px bg-current opacity-50" />
    <div className="absolute right-6 top-16 bottom-16 w-px bg-current opacity-50" />

    {/* Corner dots */}
    {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map(pos => (
      <div key={pos} className={`absolute ${pos} w-3 h-3 rounded-full bg-current opacity-70`} />
    ))}
  </div>
);

export default OrnateCardBorder;