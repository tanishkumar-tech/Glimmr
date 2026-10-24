import { motion } from 'framer-motion';

const LoadingOverlay = ({ show, text = 'Processing...' }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[900] bg-white/40 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full"
      />
      <span className="ml-3 text-amber-700 font-medium">{text}</span>
    </div>
  );
};

export default LoadingOverlay;
