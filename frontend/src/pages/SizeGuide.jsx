import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SizeGuide = () => {
  const [activeTab, setActiveTab] = useState('rings');
  const [measurement, setMeasurement] = useState('');
  const [suggestedSize, setSuggestedSize] = useState('');

  const ringSizes = [
    { size: '5', diameter: '15.7mm', circumference: '49.3mm' },
    { size: '6', diameter: '16.5mm', circumference: '51.9mm' },
    { size: '7', diameter: '17.3mm', circumference: '54.4mm' },
    { size: '8', diameter: '18.2mm', circumference: '57.0mm' },
    { size: '9', diameter: '18.9mm', circumference: '59.5mm' },
    { size: '10', diameter: '19.8mm', circumference: '62.1mm' },
  ];

  const braceletSizes = [
    { size: 'XS', wrist: '14-15cm', bracelet: '16cm' },
    { size: 'S', wrist: '15-16cm', bracelet: '17cm' },
    { size: 'M', wrist: '16-18cm', bracelet: '19cm' },
    { size: 'L', wrist: '18-20cm', bracelet: '21cm' },
    { size: 'XL', wrist: '20-22cm', bracelet: '23cm' },
  ];

  const necklaceLengths = [
    { name: 'Choker', length: '35-40cm', description: 'Sits at the base of neck' },
    { name: 'Princess', length: '45cm', description: 'Just below the collarbone' },
    { name: 'Matinee', length: '50-60cm', description: 'Sits at the chest' },
    { name: 'Opera', length: '70-90cm', description: 'Below the bust' },
    { name: 'Rope', length: '100cm+', description: 'Very long, can be doubled' },
  ];

  const calculateRingSize = () => {
    const circum = parseFloat(measurement);
    if (circum >= 49 && circum < 51) setSuggestedSize('5');
    else if (circum >= 51 && circum < 54) setSuggestedSize('6');
    else if (circum >= 54 && circum < 57) setSuggestedSize('7');
    else if (circum >= 57 && circum < 59) setSuggestedSize('8');
    else if (circum >= 59 && circum < 62) setSuggestedSize('9');
    else if (circum >= 62) setSuggestedSize('10');
    else setSuggestedSize('Please measure again');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 mb-4">
            📏 Size Guide
          </h1>
          <p className="text-gray-600 text-lg">Find your perfect fit with our comprehensive sizing guide</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {['rings', 'bracelets', 'necklaces'].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Ring Size Guide */}
        {activeTab === 'rings' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Size Calculator */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>💍</span> Ring Size Calculator
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter finger circumference (mm):
                  </label>
                  <input
                    type="number"
                    value={measurement}
                    onChange={(e) => setMeasurement(e.target.value)}
                    placeholder="e.g., 54.4"
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={calculateRingSize}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg"
                  >
                    Calculate Size
                  </motion.button>
                </div>
                <div className="flex items-center justify-center">
                  {suggestedSize && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl"
                    >
                      <p className="text-sm text-gray-600 mb-2">Suggested Size:</p>
                      <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        {suggestedSize}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Size Chart */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <h3 className="text-2xl font-bold text-white">Ring Size Chart</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Size</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Diameter</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Circumference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ringSizes.map((ring, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-purple-100 hover:bg-purple-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-purple-600">{ring.size}</td>
                        <td className="px-6 py-4 text-gray-700">{ring.diameter}</td>
                        <td className="px-6 py-4 text-gray-700">{ring.circumference}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* How to Measure */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 border border-purple-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">How to Measure Your Ring Size</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">1</span>
                  <span>Wrap a string or paper strip around your finger</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">2</span>
                  <span>Mark where the ends meet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">3</span>
                  <span>Measure the length in millimeters</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">4</span>
                  <span>Use our calculator above to find your size</span>
                </li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* Bracelet Size Guide */}
        {activeTab === 'bracelets' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📿</span> Bracelet Size Chart
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Size</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Wrist Circumference</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Bracelet Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {braceletSizes.map((bracelet, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-purple-100 hover:bg-purple-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-purple-600">{bracelet.size}</td>
                        <td className="px-6 py-4 text-gray-700">{bracelet.wrist}</td>
                        <td className="px-6 py-4 text-gray-700">{bracelet.bracelet}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Necklace Size Guide */}
        {activeTab === 'necklaces' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📿</span> Necklace Length Guide
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {necklaceLengths.map((necklace, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xl font-bold text-purple-600">{necklace.name}</h4>
                      <span className="text-2xl font-bold text-gray-700">{necklace.length}</span>
                    </div>
                    <p className="text-gray-600">{necklace.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-6">Still unsure about your size?</p>
          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg"
            >
              Browse Our Collection
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default SizeGuide;
