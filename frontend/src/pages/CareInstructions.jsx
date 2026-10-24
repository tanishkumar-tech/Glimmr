import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CareInstructions = () => {
  const careCategories = [
    {
      title: 'Gold Jewelry',
      icon: '🥇',
      gradient: 'from-yellow-400 to-amber-600',
      tips: [
        'Clean with mild soap and warm water',
        'Dry with a soft, lint-free cloth',
        'Store separately to avoid scratches',
        'Remove before swimming or exercising',
        'Avoid harsh chemicals and perfumes',
        'Professional cleaning once a year',
      ],
    },
    {
      title: 'Diamond Jewelry',
      icon: '💎',
      gradient: 'from-blue-400 to-purple-600',
      tips: [
        'Soak in warm soapy water for 20 minutes',
        'Use a soft brush to clean settings',
        'Rinse thoroughly under running water',
        'Check settings regularly for loose stones',
        'Store in individual soft pouches',
        'Professional inspection annually',
      ],
    },
    {
      title: 'Silver Jewelry',
      icon: '⚡',
      gradient: 'from-gray-400 to-slate-600',
      tips: [
        'Polish with a silver cleaning cloth',
        'Store in airtight bags to prevent tarnish',
        'Wear frequently to maintain shine',
        'Clean with baking soda paste for tarnish',
        'Avoid chlorine and bleach',
        'Remove during household cleaning',
      ],
    },
    {
      title: 'Platinum Jewelry',
      icon: '⭐',
      gradient: 'from-slate-300 to-gray-600',
      tips: [
        'Clean with ammonia solution (1:6 ratio)',
        'Buff with chamois cloth for shine',
        'Develops unique patina over time',
        'Professional polishing yearly',
        'Extremely durable, minimal care needed',
        'Store in soft fabric-lined boxes',
      ],
    },
  ];

  const generalTips = [
    {
      icon: '🚫',
      title: 'What to Avoid',
      items: [
        'Harsh chemicals and cleaning products',
        'Swimming pools (chlorine damages jewelry)',
        'Exercising with jewelry on',
        'Applying perfume after wearing jewelry',
        'Sleeping with jewelry',
      ],
    },
    {
      icon: '✅',
      title: 'Best Practices',
      items: [
        'Put jewelry on last when getting ready',
        'Remove jewelry first when undressing',
        'Store in individual compartments',
        'Clean regularly with proper solutions',
        'Get professional inspections annually',
      ],
    },
    {
      icon: '🏠',
      title: 'Storage Tips',
      items: [
        'Use fabric-lined jewelry boxes',
        'Keep pieces separated to prevent scratching',
        'Store in cool, dry place away from sunlight',
        'Use anti-tarnish strips for silver',
        'Close clasps to prevent tangling',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 mb-4">
            ✨ Jewelry Care Instructions
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Keep your precious jewelry looking brilliant for years with our expert care guide
          </p>
        </motion.div>

        {/* Care by Material */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {careCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-teal-100"
            >
              <div className={`bg-gradient-to-r ${category.gradient} p-6`}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {category.tips.map((tip, tipIndex) => (
                    <motion.li
                      key={tipIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + tipIndex * 0.05 }}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <span className="text-teal-500 text-xl flex-shrink-0">•</span>
                      <span>{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* General Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">General Care Guidelines</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {generalTips.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-200"
              >
                <div className="text-5xl mb-4 text-center">{section.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-teal-600 flex-shrink-0">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cleaning Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-teal-100"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🗓️ Recommended Cleaning Schedule
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <h3 className="text-xl font-bold text-green-700 mb-2">Daily Wear</h3>
              <p className="text-4xl mb-2">📅</p>
              <p className="text-gray-700">Clean every 1-2 weeks</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <h3 className="text-xl font-bold text-blue-700 mb-2">Occasional Wear</h3>
              <p className="text-4xl mb-2">📆</p>
              <p className="text-gray-700">Clean monthly</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <h3 className="text-xl font-bold text-purple-700 mb-2">Stored Pieces</h3>
              <p className="text-4xl mb-2">🗃️</p>
              <p className="text-gray-700">Clean before wearing</p>
            </div>
          </div>
        </motion.div>

        {/* Professional Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-white text-center shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-4">Need Professional Cleaning?</h2>
          <p className="mb-6 text-teal-100">
            We offer complimentary professional cleaning and inspection services for all jewelry purchased from Glimmr
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-teal-600 rounded-full font-semibold shadow-lg"
              >
                Shop Now
              </motion.button>
            </Link>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-teal-600 transition-colors"
              >
                Contact Us
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CareInstructions;
