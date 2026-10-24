import { AnimatePresence, motion } from 'framer-motion';

const ConfirmDialog = ({ open, title = 'Confirm', message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-100"
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💎</span>
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              </div>
              <p className="text-gray-600 mb-5">{message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary via-amber-600 to-rose-600 text-white hover:opacity-95"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
