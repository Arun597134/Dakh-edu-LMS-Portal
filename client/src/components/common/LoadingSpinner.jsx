const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative">
        <div className={`${sizes[size]} border-[3px] border-slate-100 rounded-full`}></div>
        <div className={`${sizes[size]} border-[3px] border-transparent border-t-primary-600 rounded-full animate-spin absolute top-0 left-0`}></div>
      </div>
      {text && <p className="text-slate-400 text-sm font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
