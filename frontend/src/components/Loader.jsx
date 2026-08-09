const Loader = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-ink/60">
    <div className="w-8 h-8 border-2 border-ink/20 border-t-gold rounded-full animate-spin" />
    <p className="mt-3 text-sm">{label}</p>
  </div>
);

export default Loader;
