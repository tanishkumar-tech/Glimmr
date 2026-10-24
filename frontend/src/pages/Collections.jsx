import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Collections = () => {
  const collections = [
    {
      title: 'Gold Collection',
      description: 'Timeless elegance in pure gold. From classic designs to contemporary styles.',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      gradient: 'from-amber-400 via-yellow-500 to-amber-600',
      link: '/products?material=gold',
      items: '200+ Pieces'
    },
    {
      title: 'Diamond Collection',
      description: 'Sparkle with brilliance. Premium diamonds in stunning settings.',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      gradient: 'from-blue-400 via-cyan-500 to-teal-600',
      link: '/products?material=diamond',
      items: '150+ Pieces'
    },
    {
      title: 'Wedding Collection',
      description: 'Make your special day unforgettable with our bridal jewelry.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      gradient: 'from-rose-400 via-pink-500 to-red-600',
      link: '/products?category=wedding',
      items: '180+ Pieces'
    },
    {
      title: 'New Arrivals',
      description: 'Latest designs fresh from our master craftsmen.',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      gradient: 'from-purple-400 via-indigo-500 to-blue-600',
      link: '/products?sort=newest',
      items: 'Updated Weekly'
    },
    {
      title: 'Rings Collection',
      description: 'From engagement to daily wear, find your perfect ring.',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      gradient: 'from-emerald-400 via-green-500 to-teal-600',
      link: '/products?category=rings',
      items: '120+ Pieces'
    },
    {
      title: 'Necklaces Collection',
      description: 'Elegant chains, pendants, and chokers for every occasion.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      link: '/products?category=necklaces',
      items: '140+ Pieces'
    },
    {
      title: 'Earrings Collection',
      description: 'Studs, jhumkas, drops, and hoops to complement any look.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      gradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
      link: '/products?category=earrings',
      items: '160+ Pieces'
    },
    {
      title: 'Bracelets Collection',
      description: 'Delicate to bold, find bracelets that express your style.',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      gradient: 'from-lime-400 via-green-500 to-emerald-600',
      link: '/products?category=bracelets',
      items: '90+ Pieces'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-80 bg-gradient-to-r from-primary via-amber-600 to-rose-600 overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 180],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            rotate: [180, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-bold mb-4"
          >
            Our Collections
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl max-w-2xl"
          >
            Explore our curated collections of exquisite jewelry
          </motion.p>
        </div>
      </motion.div>

      {/* Collections Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={collection.link}>
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="relative h-80 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Background Image */}
                  <img 
                    src={collection.image} 
                    alt={collection.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-60`} />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{collection.title}</h3>
                    <p className="text-sm opacity-90 mb-3">{collection.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        {collection.items}
                      </span>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        Explore
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>

                  {/* Shimmer Effect */}
                  <motion.div
                    animate={{
                      x: [-100, 400],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600 mb-6">
            Why Choose Glimmr Collections?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-amber-100"
            >
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Premium Quality</h3>
              <p className="text-gray-600">Every piece is crafted with the finest materials and attention to detail</p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-amber-100"
            >
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Unique Designs</h3>
              <p className="text-gray-600">From traditional to contemporary, find exclusive designs you won't see elsewhere</p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-amber-100"
            >
              <div className="text-5xl mb-4">💝</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Certified & Authentic</h3>
              <p className="text-gray-600">All jewelry comes with authenticity certificates and lifetime warranty</p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-primary via-amber-600 to-rose-600 rounded-3xl p-12 text-center text-white shadow-2xl"
        >
          <h2 className="text-4xl font-bold mb-4">Can't Decide?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let our AI-powered recommendation system help you find the perfect jewelry for any occasion
          </p>
          <Link to="/recommender">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Get Personalized Recommendations
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Collections;
